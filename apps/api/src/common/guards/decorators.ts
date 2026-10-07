import { SetMetadata } from '@nestjs/common';
import { ExtraRole } from '@jys/shared';

export const IS_PUBLIC_KEY = 'jys:isPublic';
/** 标记无需登录（P0 游客接口）；全局 JwtAuthGuard 据此放行 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'jys:roles';
/** 角色限制（P3/P4/P5）；不标注 = 已登录即可。展示层控制，服务端资源校验仍须在 Service 内 */
export const Roles = (...roles: ExtraRole[]) => SetMetadata(ROLES_KEY, roles);

export const REQUIRE_2FA_KEY = 'jys:require2fa';
/** 管理后台接口须通过二次验证（NFR-07） */
export const Require2FA = () => SetMetadata(REQUIRE_2FA_KEY, true);
