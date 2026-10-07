/** SRS 2.3 权限矩阵五角色（唯一来源：packages/shared） */
export enum Role {
  Guest = 'guest',
  Member = 'member',
  Moderator = 'moderator',
  Organizer = 'organizer',
  Admin = 'admin',
}

export * from './contracts/index';

/** 错误码分段表（延续原型 NET-1004 风格；完整表随模块实施扩充） */
export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH-1001',
  AUTH_LOCKED: 'AUTH-1002',
  AUTH_CAPTCHA_REQUIRED: 'AUTH-1003',
  FORUM_BOARD_FORBIDDEN: 'FORUM-2001',
  NET_TIMEOUT: 'NET-1004',
  SYS_INTERNAL: 'SYS-5000',
} as const;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** 统一响应包装：全局异常过滤器与前端拦截器的契约 */
export interface ApiResponse<T = unknown> {
  code: string; // 'OK' 或错误码
  message: string;
  data: T | null;
  requestId?: string;
}
