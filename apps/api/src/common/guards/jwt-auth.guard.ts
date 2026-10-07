import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ERROR_CODES } from '@jys/shared';
import { IS_PUBLIC_KEY } from './decorators';
import { JwtPayload } from '../../modules/auth/jwt.payload';

/**
 * 全局 JWT 守卫（APP_GUARD 注册）：默认要求登录，@Public() 放行（架构文档 §4.3）。
 * 越权/未登录统一输出 AUTH 段错误码（NFR-09）。
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException({ code: ERROR_CODES.AUTH_INVALID_CREDENTIALS, message: '未登录或登录已过期' });
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token, { secret: process.env.JWT_SECRET ?? 'dev-secret' });
      if (payload.type !== 'access') {
        throw new UnauthorizedException({ code: ERROR_CODES.AUTH_INVALID_CREDENTIALS, message: '无效的访问令牌' });
      }
      req.user = payload as never;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException({ code: ERROR_CODES.AUTH_INVALID_CREDENTIALS, message: '未登录或登录已过期' });
    }
  }
}
