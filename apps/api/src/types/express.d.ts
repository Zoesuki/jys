import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      /** 由 RequestIdMiddleware 注入（优先 Nginx X-Request-Id） */
      requestId?: string;
    }
  }
}

// 仅为触发 express 类型扩展导入
export type _ExpressRequest = Request;
