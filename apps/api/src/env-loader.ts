/**
 * 轻量 .env 加载器（避免引入 dotenv 依赖）：读取 apps/api/.env（开发环境），
 * 只填充 process.env 中尚不存在的键（真实环境变量优先）；生产容器由 Compose 注入环境变量。
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}
