import { createRouter, createWebHistory } from 'vue-router';
import { Role } from '@jys/shared';

/**
 * 路由域对齐冻结原型 41 页（prototype/页面清单.md）。
 * meta.roles 仅为展示层守卫；服务端逐接口鉴权才是权限边界（NFR-09）。
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/guest/home' },
    {
      path: '/guest',
      children: [
        { path: 'home', component: () => import('@/pages/guest/HomePage.vue'), meta: { trace: 'PRD 4.1 / SRS FR-A2' } },
        // G2–G11 逐页注册（版块/帖子/日历/活动/成员/搜索/登录/注册/找回）
      ],
    },
    {
      path: '/member',
      meta: { roles: [Role.Member, Role.Moderator, Role.Organizer, Role.Admin] },
      children: [
        { path: 'profile', component: () => import('@/pages/member/ProfilePage.vue') },
        // M2–M15 逐页注册
      ],
    },
    {
      path: '/organizer',
      meta: { roles: [Role.Organizer, Role.Admin] },
      children: [
        // O1–O4 逐页注册
      ],
    },
    {
      path: '/admin',
      meta: { roles: [Role.Admin], requires2FA: true },
      children: [
        { path: 'dashboard', component: () => import('@/pages/admin/DashboardPage.vue') },
        // A1–A11 逐页注册；A2 看板前需后台二次验证（NFR-07）
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/guest/home' },
  ],
});

// TODO(auth 模块实施时)：全局守卫读取会话态校验 meta.roles 与 requires2FA
export default router;
