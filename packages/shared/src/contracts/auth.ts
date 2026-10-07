/** 认证契约类型（docs/接口契约.md §2.1；前端 session store 与后端 JWT 载荷共用） */
import type { ExtraRole, UserStatus } from './enums';

/** JWT access token 载荷（POST /auth/login 响应 token） */
export interface JwtPayload {
  sub: number;
  email: string;
  roles: ExtraRole[];
  status: UserStatus;
  type: 'access' | 'refresh';
  jti?: string;
}

/** GET /auth/me 与 login 响应中的会话对象（等级/段位由后端按账务汇总计算） */
export interface SessionUser {
  id: number;
  email: string;
  nickname: string;
  roles: ExtraRole[];
  status: UserStatus;
  xpTotal: number;
  pointTotal: number;
  level: number;
  tierName: string;
  admin2faPassed: boolean;
}

/** POST /auth/login 与 /auth/refresh 响应 */
export interface AuthTokenPair {
  token: string;
  refreshToken: string;
  expiresIn: number;
  session: SessionUser;
}
