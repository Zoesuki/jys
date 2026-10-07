import { BizError } from '../../common/http/api-response.helper';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';

/**
 * 错误抛出约定（架构文档 §4.4）：
 * - 参数/认证类用 Nest 内置异常（401/400），全局过滤器转 ApiResponse
 * - 业务规则用 BizError（错误码 ∈ shared ERROR_CODES 分段表）
 */
export const authErrors = {
  invalidCredentials: () =>
    new UnauthorizedException({ code: 'AUTH-1001', message: '邮箱或密码错误，或验证码校验未通过' }),
  locked: (ttlSeconds: number) =>
    new ForbiddenException({
      code: 'AUTH-1002',
      message: `连续失败次数过多，账号已锁定，请 ${Math.ceil(ttlSeconds / 60)} 分钟后重试`,
    }),
  captcha: () => new BadRequestException({ code: 'AUTH-1003', message: '图形验证码错误或已过期' }),
  tooMany: (message: string) => new ForbiddenException({ code: 'AUTH-1004', message }),
  forbiddenStatus: (message: string) => new ForbiddenException({ code: 'AUTH-1010', message }),
  activationRequired: () =>
    new ForbiddenException({ code: 'AUTH-1009', message: '账号尚未激活，请先完成邮箱验证码激活' }),
  emailTaken: () => new BizError('AUTH-1006', '该邮箱已被注册', 409),
  sendTooFrequent: (ttlSeconds: number) =>
    new BizError('AUTH-1007', `验证码发送过于频繁，请 ${ttlSeconds} 秒后重试`, 429),
  codeInvalid: (message = '验证码错误或已过期，请重新获取') => new BizError('AUTH-1008', message, 400),
  emailNotFound: () => new BizError('AUTH-1011', '该邮箱尚未注册', 404),
  passwordMismatch: () => new BizError('AUTH-1012', '两次输入的新密码不一致', 400),
};

/** 模块常量（口径来源：接口契约 §2.1 与 SRS P9-23/NFR-06/Q8-㉑） */
export const ACCESS_TOKEN_TTL_SECONDS = 7200; // 2h
export const ACTIVATION_EXPIRY_DAYS = 7; // P9-20 注册未激活失效
export const LOGIN_LOCK_THRESHOLD = 5; // 连续失败次数（Q8-⑲）
export const LOGIN_LOCK_SECONDS = 900; // 15 分钟
export const TWO_FA_TTL_SECONDS = 12 * 3600; // 后台 2FA 通过标记
