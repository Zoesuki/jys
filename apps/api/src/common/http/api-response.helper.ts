import { ApiResponse, ERROR_CODES } from '@jys/shared';

/**
 * 统一响应包装（契约见 packages/shared ApiResponse）。
 * 业务代码必须经此返回，禁止各 Controller 自造响应形状。
 */
export function ok<T>(data: T, message = 'ok'): ApiResponse<T> {
  return { code: 'OK', message, data };
}

export function fail(code: string, message: string): ApiResponse<null> {
  return { code, message, data: null };
}

/** 业务异常：抛出后由全局异常过滤器转成 ApiResponse（错误码必须在 ERROR_CODES 分段表内） */
export class BizError extends Error {
  constructor(
    readonly code: keyof typeof ERROR_CODES | string,
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export const bizErrors = {
  timeout: () => new BizError('NET_TIMEOUT', '请求超时（NET-1004）', 504),
  internal: () => new BizError('SYS_INTERNAL', '系统内部错误（SYS-5000）', 500),
};
