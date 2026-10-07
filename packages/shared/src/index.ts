/** SRS 2.3 权限矩阵五角色（唯一来源：packages/shared） */
export enum Role {
  Guest = 'guest',
  Member = 'member',
  Moderator = 'moderator',
  Organizer = 'organizer',
  Admin = 'admin',
}

export * from './contracts/index';

/** 错误码分段表（延续原型 NET-1004 风格；完整表随模块实施扩充，契约见 docs/接口契约.md §1.4） */
export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH-1001',
  AUTH_LOCKED: 'AUTH-1002',
  AUTH_CAPTCHA: 'AUTH-1003',
  AUTH_TOO_MANY: 'AUTH-1004',
  AUTH_FORBIDDEN: 'AUTH-1005',
  AUTH_EMAIL_TAKEN: 'AUTH-1006',
  AUTH_CODE_TOO_FREQUENT: 'AUTH-1007',
  AUTH_CODE_INVALID: 'AUTH-1008',
  AUTH_ACTIVATION_REQUIRED: 'AUTH-1009',
  AUTH_STATUS_FORBIDDEN: 'AUTH-1010',
  AUTH_EMAIL_NOT_FOUND: 'AUTH-1011',
  AUTH_PASSWORD_MISMATCH: 'AUTH-1012',
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
