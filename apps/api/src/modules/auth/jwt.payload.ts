import { ExtraRole } from '@jys/shared';

export interface JwtPayload {
  sub: number; // user.id
  email: string;
  roles: ExtraRole[];
  status: string;
  type: 'access' | 'refresh';
  /** 仅 refresh token 有：轮换/吊销定位 */
  jti?: string;
}
