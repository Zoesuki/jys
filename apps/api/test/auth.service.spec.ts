import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { ERROR_CODES } from '@jys/shared';
import { RedisService } from '../src/common/services/redis.service';
import { AuthService } from '../src/modules/auth/auth.service';

/** 无外部依赖：RedisService 走内存降级（无 REDIS_URL）、Prisma/Mail/Captcha 为桩 */
function buildService(
  overrides: {
    userFindUnique?: ReturnType<typeof vi.fn>;
    userCreate?: ReturnType<typeof vi.fn>;
    userUpdate?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const user = {
    findUnique:
      overrides.userFindUnique ??
      vi.fn(async () => null),
    create:
      overrides.userCreate ??
      vi.fn(async (args: { data: { email: string } }) => ({
        id: 1n,
        email: args.data.email,
        nickname: 'tester',
        status: 'pending_activation',
        createdAt: new Date(),
        xpTotal: 0,
        pointTotal: 0,
        roles: [],
      })),
    update:
      overrides.userUpdate ??
      vi.fn(async (args: { where: { id: bigint }; data: Record<string, unknown> }) => ({
        id: args.where.id,
        email: 'test@jyouclub.cn',
        nickname: 'tester',
        status: 'normal',
        xpTotal: 0,
        pointTotal: 0,
        roles: [],
      })),
  };
  const prisma = { user } as never;
  const redis = new RedisService();
  const mail = {
    send: vi.fn(async (_to: string, _subject: string, text: string) => ({
      delivered: false,
      devCode: text.match(/\d{6}/)?.[0],
    })),
  };
  const passwordSvc = {
    hash: vi.fn(async (p: string) => `hashed:${p}`),
    compare: vi.fn(async (plain: string, hash: string) => hash === `hashed:${plain}`),
  };
  const captcha = { verify: vi.fn(async () => true), create: vi.fn() };
  const jwt = new JwtService({ secret: 'test-secret' });
  const service = new AuthService(prisma, redis, mail as never, passwordSvc as never, captcha as never, jwt);
  return { service, redis, mail, passwordSvc, captcha, user };
}

const loginDto = (over: Partial<Record<string, unknown>> = {}) => ({
  email: 'new@jyouclub.cn',
  password: 'right-Pass1!',
  captchaId: 'c1',
  captchaText: 'abcd',
  ...over,
});

describe('AuthService · 注册/激活（状态机 4.1）', () => {
  let userFindUnique: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    userFindUnique = vi.fn(async () => null);
  });

  it('注册创建待激活用户并发送激活码（FR-A1）', async () => {
    const userCreate = vi.fn(async (args: { data: { email: string } }) => ({
      id: 1n,
      email: args.data.email,
      createdAt: new Date(),
      status: 'pending_activation',
    }));
    const { service, mail } = buildService({ userFindUnique, userCreate });
    const res = await service.register({ email: 'new@jyouclub.cn', password: 'Abcdef1!' });
    expect(userCreate).toHaveBeenCalled();
    expect(res.devCode).toMatch(/^\d{6}$/); // 开发模式回显
    expect(mail.send).toHaveBeenCalled();
  });

  it('重复注册已正常账号 → AUTH-1006', async () => {
    const { service } = buildService({
      userFindUnique: vi.fn(async () => ({ id: 2n, email: 'x@jyouclub.cn', status: 'normal', createdAt: new Date() })),
    });
    await expect(service.register({ email: 'x@jyouclub.cn', password: 'Abcdef1!' })).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_EMAIL_TAKEN,
    });
  });

  it('激活码错误 → AUTH-1008', async () => {
    const { service, redis } = buildService({ userFindUnique });
    await redis.setex('auth:code:activate:new@jyouclub.cn', 600, '123456');
    await expect(service.activate({ email: 'new@jyouclub.cn', code: '999999' })).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_CODE_INVALID,
    });
  });

  it('激活成功 → 已激活_未入会 + 记录激活时间', async () => {
    const userUpdate = vi.fn(async () => ({ id: 1n }));
    const { service, redis } = buildService({
      userFindUnique: vi.fn(async () => ({
        id: 1n,
        email: 'new@jyouclub.cn',
        status: 'pending_activation',
        createdAt: new Date(),
      })),
      userUpdate,
    });
    await redis.setex('auth:code:activate:new@jyouclub.cn', 600, '123456');
    await service.activate({ email: 'new@jyouclub.cn', code: '123456' });
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'active_no_member' }) }),
    );
  });
});

describe('AuthService · 登录防护（NFR-06）', () => {
  it('图形验证码错误 → AUTH-1003', async () => {
    const { service, captcha } = buildService();
    captcha.verify = vi.fn(async () => false);
    await expect(service.login(loginDto())).rejects.toMatchObject({ response: { code: ERROR_CODES.AUTH_CAPTCHA } });
  });

  it('连续失败 5 次 → 第 5 次抛 AUTH-1002 锁定', async () => {
    const { service } = buildService({
      userFindUnique: vi.fn(async () => ({
        id: 1n,
        email: 'new@jyouclub.cn',
        passwordHash: 'hashed:other',
        status: 'normal',
        roles: [],
        xpTotal: 0,
        pointTotal: 0,
      })),
    });
    for (let i = 1; i < 5; i++) {
      await expect(service.login(loginDto({ password: `wrong-${i}` }))).rejects.toBeTruthy();
    }
    await expect(service.login(loginDto({ password: 'wrong-5' }))).rejects.toMatchObject({
      response: { code: ERROR_CODES.AUTH_LOCKED },
    });
  });

  it('封禁账号 → AUTH-1010 禁止登录', async () => {
    const { service } = buildService({
      userFindUnique: vi.fn(async () => ({
        id: 1n,
        email: 'new@jyouclub.cn',
        passwordHash: 'hashed:whatever',
        status: 'banned',
        roles: [],
        xpTotal: 0,
        pointTotal: 0,
      })),
    });
    await expect(service.login(loginDto({ password: 'whatever' }))).rejects.toMatchObject({
      response: { code: ERROR_CODES.AUTH_STATUS_FORBIDDEN },
    });
  });

  it('待激活 → AUTH-1009 引导激活', async () => {
    const { service } = buildService({
      userFindUnique: vi.fn(async () => ({
        id: 1n,
        email: 'new@jyouclub.cn',
        passwordHash: 'hashed:whatever',
        status: 'pending_activation',
        roles: [],
        xpTotal: 0,
        pointTotal: 0,
      })),
    });
    await expect(service.login(loginDto({ password: 'whatever' }))).rejects.toMatchObject({
      response: { code: ERROR_CODES.AUTH_ACTIVATION_REQUIRED },
    });
  });

  it('密码正确 → 签发 token 对与会话（含等级段位）', async () => {
    const { service } = buildService({
      userFindUnique: vi.fn(async () => ({
        id: 1n,
        email: 'new@jyouclub.cn',
        passwordHash: 'hashed:right-Pass1!',
        status: 'normal',
        roles: [],
        xpTotal: 1864,
        pointTotal: 340,
      })),
    });
    const res = await service.login(loginDto());
    expect(res.token).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    expect(res.session.level).toBeGreaterThanOrEqual(6); // 1864 ≥ E(6)=1500
    expect(res.session.tierName).toBe('常驻');
  });
});

describe('AuthService · 刷新轮换', () => {
  it('刷新后旧 refresh 失效（白名单删除）', async () => {
    const { service } = buildService({
      userFindUnique: vi.fn(async () => ({
        id: 1n,
        email: 'new@jyouclub.cn',
        passwordHash: 'hashed:right-Pass1!',
        status: 'normal',
        roles: [],
        xpTotal: 0,
        pointTotal: 0,
      })),
    });
    const pair = await service.login(loginDto());
    const refreshed = await service.refresh(pair.refreshToken);
    expect(refreshed.token).toBeTruthy();
    await expect(service.refresh(pair.refreshToken)).rejects.toBeTruthy(); // 旧 token 已轮换
  });
});

describe('AuthService · 忘记/重置密码（FR-A1 安全类邮件 P9-15）', () => {
  it('未知邮箱不抛错（防枚举）且不发送', async () => {
    const { service, mail } = buildService();
    const res = await service.forgotPassword({ email: 'ghost@jyouclub.cn' });
    expect(res.devCode).toBeUndefined();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('重置成功后全端下线（refresh 白名单清空）', async () => {
    const userUpdate = vi.fn(async () => ({ id: 1n }));
    const { service, redis } = buildService({
      userFindUnique: vi.fn(async () => ({
        id: 1n,
        email: 'new@jyouclub.cn',
        passwordHash: 'hashed:right-Pass1!',
        status: 'normal',
        roles: [],
        createdAt: new Date(),
      })),
      userUpdate,
    });
    const pair = await service.login(loginDto());
    await redis.setex('auth:code:reset:new@jyouclub.cn', 600, '654321');
    await service.resetPassword({
      email: 'new@jyouclub.cn',
      code: '654321',
      newPassword: 'NewPass1!',
      confirmPassword: 'NewPass1!',
    });
    await expect(service.refresh(pair.refreshToken)).rejects.toBeTruthy();
  });

  it('两次密码不一致 → AUTH-1012', async () => {
    const { service } = buildService();
    await expect(
      service.resetPassword({
        email: 'new@jyouclub.cn',
        code: '654321',
        newPassword: 'NewPass1!',
        confirmPassword: 'Nope1234!',
      }),
    ).rejects.toMatchObject({ code: ERROR_CODES.AUTH_PASSWORD_MISMATCH });
  });
});

describe('AuthService · 管理后台二次验证（NFR-07）', () => {
  const adminPayload = { sub: 1, email: 'admin@jyouclub.cn', roles: ['admin'], status: 'normal', type: 'access' };

  it('验证通过 → 2FA 标记 12h', async () => {
    const { service, redis, mail } = buildService({
      userFindUnique: vi.fn(async () => ({ id: 1n, email: 'admin@jyouclub.cn' })),
    });
    const send = await service.admin2faSendCode(adminPayload as never);
    const code = send.devCode!;
    expect(code).toMatch(/^\d{6}$/);
    void mail;
    await service.admin2faVerify(adminPayload as never, { code });
    expect(await redis.get('auth:2fa:ok:1')).toBe('1');
  });

  it('连续 5 次失败 → 锁定 AUTH-1002', async () => {
    const { service } = buildService({
      userFindUnique: vi.fn(async () => ({ id: 1n, email: 'admin@jyouclub.cn' })),
    });
    await service.admin2faSendCode(adminPayload as never);
    let lastError: unknown = null;
    for (let i = 1; i <= 5; i++) {
      try {
        await service.admin2faVerify(adminPayload as never, { code: '000000' });
      } catch (e) {
        lastError = e;
      }
    }
    const responseCode = (lastError as { response?: { code?: string } } | null)?.response?.code;
    expect(responseCode).toBe(ERROR_CODES.AUTH_LOCKED);
  });
});
