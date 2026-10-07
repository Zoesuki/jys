# 吉悠社成员中心 · 全栈工程

基于冻结原型（`prototype/`，UI 契约 v1.1）与架构设计（`docs/架构设计文档.md`）的 Monorepo。

## 结构

```
apps/web          Vue 3 + Vite + Element Plus + Tailwind（路由域对齐原型 G/M/O/A）
apps/api          NestJS（REST /api，模块化单体）
packages/shared   DTO 类型 / 错误码 / 角色枚举（前后端唯一来源，主控独占）
```

## 快速开始

```bash
pnpm install
docker compose -f docker-compose.dev.yml up -d   # MySQL 8 + Redis 7
cp apps/api/.env.example apps/api/.env
pnpm dev:api        # http://localhost:3000/api/health
pnpm dev:web        # http://localhost:5173
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm build` | 全量构建（shared → api → web） |
| `pnpm typecheck` | 类型检查 |
| `pnpm test` | 单测 |
| `pnpm lint` | ESLint |

## 规则

- 分支：`main` 保护，`feat/<module>-<topic>` 短分支，合并需 CI 四绿 + 审核（详见架构文档 §5）；
- `packages/shared`、数据库迁移、设计令牌为主控独占，改动需契约变更 PR；
- 冻结原型（`prototype/`）是 UI 契约，页面结构/令牌值改动需走变更确认。
