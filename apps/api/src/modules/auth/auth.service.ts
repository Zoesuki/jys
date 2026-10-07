import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { ExtraRole, UserStatus, xpThreshold, LEVEL_TIERS } from '@jys/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/services/redis.service';
import { MailService } from '../../common/services/mail.service';
import { PasswordService } from '../../common/services/password.service';
import { CaptchaService } from '../../common/services/captcha.service';
import { JwtPayload } from './jwt.payload';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  ACTIVATION_EXPIRY_DAYS,
  LOGIN_LOCK_SECONDS,
  LOGIN_LOCK_THRESHOLD,
  TWO_FA_TTL_SECONDS,
  authErrors,
} from './auth.errors';
import type {
  Admin2faVerifyDto,
  ActivateDto,
  EmailCodeDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dtos';

export interface SessionUser {
  id: number;
  email: string;
  nickname: string;
  roles: ExtraRole[];
  status: UserStatus;
  xpTotal: number;
  pointTotal: number;
  level: number;
  tierName: string;
  admin2faPassed: boolean;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
  expiresIn: number;
  session: SessionUser;
}

const REFRESH_TTL_DEFAULT_SECONDS = 7 * 24 * 3600;
const REFRESH_TTL_REMEMBER_SECONDS = 30 * 24 * 3600; // rememberMe（原型 login「记住我」）
const JWT_SECRET = () => process.env.JWT_SECRET ?? 'dev-secret';

/**
 * auth 模块业务（契约 docs/接口契约.md §2.1；账号状态机 SRS 4.1）。
 * 鉴权规则的服务端实现（NFR-09）；登录防护 NFR-06；后台二次验证 NFR-07。
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
    private readonly password: PasswordService,
    private readonly captcha: CaptchaService,
    private readonly jwt: JwtService,
  ) {}

  /* ---------- 图形验证码（NFR-06） ---------- */
  createCaptcha() {
    return this.captcha.create();
  }

  /* ---------- 注册：提交注册 → 待激活 + 自动发送激活码（状态机 4.1） ---------- */
  async register(dto: RegisterDto): Promise<{ email: string; devCode?: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      const expired =
        existing.status === UserStatus.PendingActivation &&
        existing.createdAt.getTime() + ACTIVATION_EXPIRY_DAYS * 86400_000 < Date.now();
      if (expired) {
        await this.prisma.user.delete({ where: { id: existing.id } }); // 7 天未激活释放邮箱（P9-20）
      } else {
        throw authErrors.emailTaken();
      }
    }
    const passwordHash = await this.password.hash(dto.password);
    await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nickname: dto.email.split('@')[0],
        status: UserStatus.PendingActivation,
      },
    });
    const mail = await this.sendCode(dto.email, 'activate');
    return { email: dto.email, devCode: mail.devCode };
  }

  /* ---------- 验证码发送（register=重发激活码；reset=重置密码码，存在性校验对齐原型「✓ 账号存在」） ---------- */
  async sendEmailCode(dto: EmailCodeDto): Promise<{ devCode?: string }> {
    if (dto.scene === 'register') {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.status !== UserStatus.PendingActivation) throw authErrors.emailTaken();
      const mail = await this.sendCode(dto.email, 'activate');
      return { devCode: mail.devCode };
    }
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.status === UserStatus.Deactivated) throw authErrors.emailNotFound();
    const mail = await this.sendCode(dto.email, 'reset');
    return { devCode: mail.devCode };
  }

  /* ---------- 激活：待激活 → 已激活_未入会 ---------- */
  async activate(dto: ActivateDto): Promise<void> {
    await this.verifyCode('activate', dto.email, dto.code);
    const user = await this.mustFindUser(dto.email);
    if (user.status !== UserStatus.PendingActivation) {
      throw authErrors.codeInvalid('账号已激活，请直接登录');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.ActiveNoMember, emailVerifiedAt: new Date() },
    });
    await this.mail.send(user.email, '吉悠社 · 激活成功', '你的账号已完成激活，现在可以登录吉悠社成员中心。');
  }

  /* ---------- 登录（NFR-06：图形验证码 + 5 次失败锁 15 分钟；封禁禁止登录） ---------- */
  async login(dto: LoginDto): Promise<TokenPair> {
    const captchaOk = await this.captcha.verify(dto.captchaId, dto.captchaText);
    if (!captchaOk) throw authErrors.captcha();

    const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { roles: true } });
    // 防撞库：不区分「邮箱不存在」与「密码错误」
    if (!user) throw authErrors.invalidCredentials();
    if (user.status === UserStatus.Banned) throw authErrors.forbiddenStatus('账号已封禁，禁止登录');
    if (user.status === UserStatus.Deactivated) throw authErrors.forbiddenStatus('账号已注销');
    if (user.status === UserStatus.PendingActivation) throw authErrors.activationRequired();

    const passwordOk = await this.password.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      const failKey = `auth:loginfail:${dto.email}`;
      const fails = await this.redis.incr(failKey);
      if (fails === 1) await this.redis.expire(failKey, LOGIN_LOCK_SECONDS);
      if (fails >= LOGIN_LOCK_THRESHOLD) {
        const ttl = await this.redis.ttl(failKey);
        throw authErrors.locked(ttl > 0 ? ttl : LOGIN_LOCK_SECONDS);
      }
      throw authErrors.invalidCredentials();
    }
    await this.redis.del(`auth:loginfail:${dto.email}`);
    // 注销冷静期内登录可行（登录即提示可撤销，状态不变）
    return this.issueTokens(Number(user.id), user.email, user.roles.map((r) => r.role as ExtraRole), user.status, dto.rememberMe);
  }

  /* ---------- 刷新（轮换：旧 refresh 立即失效；白名单防重放） ---------- */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, { secret: JWT_SECRET() });
    } catch {
      throw authErrors.invalidCredentials();
    }
    if (payload.type !== 'refresh' || !payload.jti) throw authErrors.invalidCredentials();
    const whitelistKey = `auth:refresh:${payload.sub}:${payload.jti}`;
    if (!(await this.redis.get(whitelistKey))) throw authErrors.invalidCredentials(); // 已轮换/已登出
    await this.redis.del(whitelistKey);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: { roles: true } });
    if (!user || user.status === UserStatus.Banned || user.status === UserStatus.Deactivated) {
      throw authErrors.forbiddenStatus('账号状态异常，禁止登录');
    }
    return this.issueTokens(Number(user.id), user.email, user.roles.map((r) => r.role as ExtraRole), user.status, false);
  }

  /* ---------- 登出（吊销本人 refresh） ---------- */
  async logout(user: JwtPayload): Promise<void> {
    if (user.jti) await this.redis.del(`auth:refresh:${user.sub}:${user.jti}`);
  }

  /* ---------- 会话信息 ---------- */
  async me(user: JwtPayload): Promise<SessionUser> {
    const u = await this.prisma.user.findUnique({ where: { id: BigInt(user.sub) }, include: { roles: true } });
    if (!u) throw authErrors.invalidCredentials();
    const admin2faPassed = !!(await this.redis.get(`auth:2fa:ok:${u.id}`));
    return this.buildSession(u, u.roles.map((r) => r.role as ExtraRole), admin2faPassed);
  }

  /* ---------- 忘记/重置密码（安全类邮件不受订阅开关限制 P9-15；防枚举恒成功响应） ---------- */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ devCode?: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.status === UserStatus.Deactivated) {
      this.logger.warn(`[auth] 重置密码请求的邮箱不存在：${dto.email}`);
      return {};
    }
    const mail = await this.sendCode(dto.email, 'reset');
    return { devCode: mail.devCode };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) throw authErrors.passwordMismatch();
    await this.verifyCode('reset', dto.email, dto.code);
    const user = await this.mustFindUser(dto.email);
    const passwordHash = await this.password.hash(dto.newPassword);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await this.redis.delPattern(`auth:refresh:${user.id}:*`); // 全端下线
    await this.redis.del(`auth:loginfail:${user.email}`);
  }

  /* ---------- 管理后台二次验证（NFR-07：邮箱验证码，5 次失败锁 15 分钟） ---------- */
  async admin2faSendCode(user: JwtPayload): Promise<{ maskedEmail: string; devCode?: string }> {
    const u = await this.prisma.user.findUnique({ where: { id: user.sub } });
    if (!u) throw authErrors.invalidCredentials();
    const mail = await this.sendCode(u.email, '2fa');
    return { maskedEmail: maskEmail(u.email), devCode: mail.devCode };
  }

  async admin2faVerify(user: JwtPayload, dto: Admin2faVerifyDto): Promise<void> {
    const failKey = `auth:2fafail:${user.sub}`;
    const fails = Number((await this.redis.get(failKey)) ?? 0);
    if (fails >= LOGIN_LOCK_THRESHOLD) {
      const ttl = await this.redis.ttl(failKey);
      throw authErrors.locked(ttl > 0 ? ttl : LOGIN_LOCK_SECONDS);
    }
    try {
      await this.verifyCode('2fa', user.email, dto.code);
    } catch (err) {
      const n = await this.redis.incr(failKey);
      if (n === 1) await this.redis.expire(failKey, LOGIN_LOCK_SECONDS);
      if (n >= LOGIN_LOCK_THRESHOLD) throw authErrors.locked(LOGIN_LOCK_SECONDS);
      throw err;
    }
    await this.redis.setex(`auth:2fa:ok:${user.sub}`, TWO_FA_TTL_SECONDS, '1');
    await this.redis.del(failKey);
  }

  /* ---------- 内部 ---------- */

  /** 发送 6 位验证码（P9-23：10 分钟有效 / 60 秒重发冷却） */
  private async sendCode(email: string, scene: 'activate' | 'reset' | '2fa'): Promise<{ devCode?: string }> {
    const cooldownKey = `auth:code:cooldown:${scene}:${email}`;
    const cooldown = await this.redis.ttl(cooldownKey);
    if (cooldown > 0) throw authErrors.sendTooFrequent(cooldown);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.redis.setex(`auth:code:${scene}:${email}`, 600, code); // 10 分钟（P9-23）
    await this.redis.setex(cooldownKey, 60, '1');

    const subject =
      scene === 'activate' ? '吉悠社 · 注册激活验证码' : scene === 'reset' ? '吉悠社 · 重置密码验证码' : '吉悠社 · 后台二次验证';
    return this.mail.send(email, subject, `你的验证码是 ${code}，10 分钟内有效。`);
  }

  /** 一次性校验并销毁 */
  private async verifyCode(scene: string, email: string, code: string): Promise<void> {
    const key = `auth:code:${scene}:${email}`;
    const stored = await this.redis.get(key);
    if (!stored || stored !== code) throw authErrors.codeInvalid();
    await this.redis.del(key);
  }

  private async mustFindUser(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw authErrors.emailNotFound();
    return user;
  }

  private async issueTokens(
    userId: number,
    email: string,
    roles: ExtraRole[],
    status: UserStatus,
    rememberMe?: boolean,
  ): Promise<TokenPair> {
    const refreshJti = randomUUID();
    const base = { sub: userId, email, roles, status } as const;
    const token = await this.jwt.signAsync({ ...base, type: 'access' } satisfies JwtPayload, {
      secret: JWT_SECRET(),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
    const refreshTtl = rememberMe ? REFRESH_TTL_REMEMBER_SECONDS : REFRESH_TTL_DEFAULT_SECONDS;
    const refreshToken = await this.jwt.signAsync(
      { ...base, type: 'refresh', jti: refreshJti } satisfies JwtPayload,
      { secret: JWT_SECRET(), expiresIn: refreshTtl },
    );
    await this.redis.setex(`auth:refresh:${userId}:${refreshJti}`, refreshTtl, '1');
    const session = await this.me({ sub: userId, email, roles, status, type: 'access' });
    return { token, refreshToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS, session };
  }

  private buildSession(
    u: { id: number | bigint; email: string; nickname: string; xpTotal: number; pointTotal: number; status: UserStatus },
    roles: ExtraRole[],
    admin2faPassed: boolean,
  ): SessionUser {
    // 等级 = 满足 E(n) ≤ xp 的最大 n（上限 20）；P9-19 参数化后由 level_tier 快照驱动
    let level = 1;
    for (let n = 1; n <= 20; n++) if (xpThreshold(n) <= u.xpTotal) level = n;
    const tierName = [...LEVEL_TIERS].reverse().find((t) => level >= t.minLevel)?.name ?? '见习';
    return {
      id: Number(u.id),
      email: u.email,
      nickname: u.nickname,
      roles,
      status: u.status,
      xpTotal: u.xpTotal,
      pointTotal: u.pointTotal,
      level,
      tierName,
      admin2faPassed,
    };
  }
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}***@${domain ?? ''}`;
}
