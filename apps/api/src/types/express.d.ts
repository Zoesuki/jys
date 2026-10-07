import type { Request } from 'express';
import type { JwtPayload } from '../modules/auth/jwt.payload';

declare global {
  namespace Express {
    interface Request {
      /** 由 RequestIdMiddleware 注入（优先 Nginx X-Request-Id） */
      requestId?: string;
      /** 由 JwtAuthGuard 注入的 JWT 载荷 */
      user?: JwtPayload;
    }
  }
}

export type _Keep = Request;
