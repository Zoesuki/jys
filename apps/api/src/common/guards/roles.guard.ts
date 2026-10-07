import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExtraRole } from '@jys/shared';
import { REQUIRE_2FA_KEY, ROLES_KEY } from './decorators';
import { RedisService } from '../services/redis.service';
import { JwtPayload } from '../../modules/auth/jwt.payload';

/**
 * 角色/2FA 守卫（APP_GUARD 注册，JwtAuthGuard 之后执行）：
 * - @Roles(...)：角色交集校验（SRS 2.3 权限矩阵；服务端资源级校验仍在 Service，NFR-09）
 * - @Require2FA()：管理后台接口须通过邮箱二次验证（NFR-07，Redis 标记 12h）
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ExtraRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const require2fa = this.reflector.getAllAndOverride<boolean>(REQUIRE_2FA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length && !require2fa) return true;

    const user = context.switchToHttp().getRequest().user as JwtPayload | undefined;
    if (!user) {
      throw new ForbiddenException({ code: 'AUTH-1001', message: '未登录' });
    }

    if (requiredRoles?.length) {
      const ok = requiredRoles.some((r) => user.roles.includes(r));
      if (!ok) {
        throw new ForbiddenException({ code: 'AUTH-1005', message: '没有执行该操作的权限' });
      }
    }
    if (require2fa) {
      const passed = await this.redis.get(`auth:2fa:ok:${user.sub}`);
      if (!passed) {
        throw new ForbiddenException({
          code: 'AUTH-1010',
          message: '管理后台需要二次验证，请先完成邮箱验证码校验',
        });
      }
    }
    return true;
  }
}
