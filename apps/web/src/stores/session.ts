import { defineStore } from 'pinia';
import { Role } from '@jys/shared';

const STORAGE_KEY = 'jys.session';

interface SessionState {
  token: string | null;
  role: Role | null;
  /** 后台二次验证（NFR-07）通过标记，仅内存态 */
  admin2faPassed: boolean;
}

/**
 * 会话态（架构文档 §4.1）：Pinia 只管会话/字典/未读数，服务端数据一律走 TanStack Query。
 * 权限以服务端为准（NFR-09），此处角色仅驱动前端展示控制。
 */
export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    token: localStorage.getItem(STORAGE_KEY) ? (JSON.parse(localStorage.getItem(STORAGE_KEY)!).token ?? null) : null,
    role: null,
    admin2faPassed: false,
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
  },
  actions: {
    setSession(token: string, role: Role) {
      this.token = token;
      this.role = role;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
    },
    clearSession() {
      this.token = null;
      this.role = null;
      this.admin2faPassed = false;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});
