# AGENTS.md — 吉悠社成员中心 · AI Agent 工程规范

> 本文件是所有 AI Agent 与人类协作者在本仓库工作的**强制规范**。与 `docs/架构设计文档.md` 冲突时以架构文档为准，发现冲突应上报主控而非自行取舍。

## 1. 项目速览

- **产品**：吉悠社成员中心（游戏兴趣社群平台：论坛/成员/活动/后台治理/等级经验）
- **需求基线**：PRD v1.2 · SRS v1.1 · UI 契约 v1.1（`prototype/` 冻结原型，2026-10-07 冻结）
- **技术栈**：Vue 3 + Vite + Element Plus + Tailwind + Pinia + TanStack Query ｜ NestJS + Prisma ｜ MySQL 8 + Redis 7 ｜ 本地部署（Docker Compose）
- **仓库**：pnpm Monorepo

```
apps/web          前端 SPA（src/pages 按原型 G/M/O/A 四路由域；src/design-system 冻结令牌）
apps/api          NestJS（src/modules/{auth,user,membership,forum,moderation,activity,team,tournament,rewards,notification,analytics,settings}）
packages/shared   DTO 类型 / 错误码 / 角色枚举（前后端唯一来源）
deploy/           nginx.conf · deploy.sh（本地部署）
docs/             PRD · SRS · 架构设计文档 · 页面清单
prototype/        冻结原型（UI 契约，只读参照物）
```

## 2. 不可违反的约束（红线）

1. **冻结原型是 UI 契约**：页面结构、交互流程、设计令牌值（`--jys-*`）不得擅改；视觉改动走变更确认；
2. **权限以服务端为准**（NFR-09）：每个新接口必须挂 RolesGuard + 资源级校验；前端路由守卫只是展示控制；
3. **账务只增不减**（SRS 4.9）：经验值/积分流水禁止 UPDATE/DELETE；报名满员判定必须用 MySQL 事务 + 唯一约束，Redis 只做读加速；
4. **隐私红线**（NFR-11）：邮箱等隐私字段不出现在公开接口；密码/验证码/Token 永不写日志；
5. **禁止过度设计**：不引入微服务/消息队列/K8s/ES；演进动作以架构文档 §6 的触发条件为准；
6. **纯业务代码禁止先斩后奏**：本仓库只允许骨架与按模块认领的业务实现。

## 3. 代码规范

**后端（NestJS）**
- 模块目录 = SRS 模块（见 `apps/api/src/modules/`）；每个 Controller 方法标注需求追溯注释（如 `// FR-B2`）；
- 入参一律 DTO + class-validator；响应一律经 `common/http/api-response.helper.ts` 的 `ok()/fail()`（`ApiResponse` 来自 shared）；
- 业务错误抛 `BizError`（错误码必须在 `packages/shared` 分段表内），统一由全局异常过滤器输出；
- 跨模块调用走对方模块导出的 Service 接口，禁止直查他模块的表；异步副作用用领域事件（EventEmitter2）。

**前端（Vue）**
- `<script setup lang="ts">` 组合式 API；页面文件与原型页面一一对应（G1→`pages/guest/HomePage.vue`…）；
- 服务端数据一律 TanStack Query（列表 staleTime 30s / 详情 60s）；Pinia 仅会话/字典/未读数（见 `stores/session.ts`）；
- 请求一律走 `api/http.ts` 的 `getData/postData`（封装已含 401/403/重试/错误码 toast，不得绕过）；
- 样式优先使用 Tailwind 令牌类（`bg-jys-page`、`text-jys-text-2` 等），令牌值改动 = 变更确认。

## 4. 常用命令

```bash
pnpm install                                   # 安装
docker compose -f docker-compose.dev.yml up -d # MySQL 8 + Redis 7
pnpm dev:api                                   # 后端 :3000（/api/health）
pnpm dev:web                                   # 前端 :5173
pnpm lint / typecheck / test / build           # CI 四门槛（本地等价命令）
./deploy/deploy.sh                             # 服务器部署（构建→迁移→切流→健康检查）
```

## 5. git 分支策略与多 Agent 并行规则

### 5.1 分支模型（简化 trunk-based）

- `main`：保护分支，始终可发布。合并条件 = CI 四绿 + ≥1 个 approve + PR 描述映射 SRS 编号；
- `feat/<module>-<topic>`：短生命周期功能分支（如 `feat/forum-post-crud`），从最新 main 切出、合并前 rebase；
- `hotfix/*`：线上修复直出 main 并打 tag；版本以 `v*.*.*` tag 标记；无 develop/release 长分支。

### 5.2 多 Agent 目录所有权

| Agent 认领 | 独占目录 | 共享只读 |
| --- | --- | --- |
| 前端-游客域 | `apps/web/src/pages/guest/` | 设计系统层、api/http.ts、stores |
| 前端-成员域 | `apps/web/src/pages/member/` | 同上 |
| 前端-组织者/后台域 | `apps/web/src/pages/{organizer,admin}/` | 同上 |
| 后端-<模块> | `apps/api/src/modules/<mod>/` | shared 类型、common 基建 |
| **主控** | `packages/shared/` · Prisma 迁移 · 设计令牌 · 根配置 · 本文件 | 全部 |

1. Agent 只允许改动自己独占目录 + 自己的路由/菜单注册点；越界 PR 直接打回；
2. 需要新字段/新接口 → 先提「契约变更 PR」（仅含 shared 类型与迁移，迁移编号由主控发放），合并后再继续业务；
3. 每个 Agent 同时只允许 1 个 open PR；合并顺序由主控串行化（同模块串行、跨模块并行）；
4. 冲突由 PR 作者解决、主控复核；禁止 force-push main；
5. 提交信息遵循 Conventional Commits（`feat/fix/docs/chore(refactor(scope): ...`），PR 描述必须含 SRS 需求编号映射。

### 5.3 验收门槛（每个 PR）

- `pnpm lint / typecheck / test / build` 四绿（CI 平台未接入前，本地执行并附输出截图/日志）；
- 不引入红线违例（见 §2）；UI 改动附对齐冻结原型的截图对比。
