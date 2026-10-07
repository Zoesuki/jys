# 构建阶段
FROM node:20-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm install --frozen-lockfile=false
RUN pnpm -F @jys/shared build && pnpm -F @jys/api build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
