#!/usr/bin/env bash
# 本地部署脚本（架构文档 §2.4）：服务器上执行——构建 → 迁移 → 切流 → 健康检查
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 1/4 拉取最新代码"
git pull --ff-only

echo "==> 2/4 构建镜像"
docker compose build

echo "==> 3/4 数据库迁移（Prisma，实施后启用）"
# docker compose run --rm api pnpm -F @jys/api prisma migrate deploy

echo "==> 4/4 重启服务并做健康检查"
docker compose up -d
for i in $(seq 1 30); do
  if curl -fsS http://localhost/api/health >/dev/null 2>&1; then
    echo "✓ 健康检查通过"
    exit 0
  fi
  sleep 2
done
echo "✗ 健康检查超时，回滚到上一镜像（docker compose rollback 需按环境配置）" >&2
exit 1
