import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Redis 访问封装（架构文档 §1.5）。
 * 本地无 Redis 时自动降级为进程内 TTL Map（仅开发环境可用，启动时打印告警）；
 * 生产（本地部署服务器）必须配置 REDIS_URL 使用真实 Redis。
 * 语义覆盖 auth 所需：get/setex/incr/expire/ttl/del/delPattern。
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private memory = new Map<string, { value: string; expiresAt: number | null }>();

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn('[redis] REDIS_URL 未配置，降级为进程内存储（仅开发可用）');
      return;
    }
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
        lazyConnect: false,
      });
      this.client.on('error', (err) => {
        if (!this.client) return;
        this.logger.warn(`[redis] 连接异常，降级为进程内存储：${err.message}`);
        this.client.disconnect();
        this.client = null;
      });
    } catch (err) {
      this.logger.warn(`[redis] 初始化失败，降级为进程内存储：${(err as Error).message}`);
      this.client = null;
    }
  }

  private isLive(): boolean {
    return !!this.client && this.client.status === 'ready';
  }

  async get(key: string): Promise<string | null> {
    if (this.isLive()) return this.client!.get(key);
    const hit = this.memory.get(key);
    if (!hit) return null;
    if (hit.expiresAt !== null && hit.expiresAt < Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return hit.value;
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (this.isLive()) {
      await this.client!.setex(key, seconds, value);
      return;
    }
    this.memory.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
  }

  async incr(key: string): Promise<number> {
    if (this.isLive()) return this.client!.incr(key);
    const cur = Number((await this.get(key)) ?? 0) + 1;
    await this.setex(key, 900, String(cur)); // 无 TTL 的 incr 由调用方补 expire
    this.memory.get(key)!.expiresAt = null;
    return cur;
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (this.isLive()) {
      await this.client!.expire(key, seconds);
      return;
    }
    const hit = this.memory.get(key);
    if (hit) hit.expiresAt = Date.now() + seconds * 1000;
  }

  async ttl(key: string): Promise<number> {
    if (this.isLive()) return this.client!.ttl(key);
    const hit = this.memory.get(key);
    if (!hit) return -2;
    if (hit.expiresAt === null) return -1;
    return Math.max(0, Math.ceil((hit.expiresAt - Date.now()) / 1000));
  }

  async del(key: string): Promise<void> {
    if (this.isLive()) {
      await this.client!.del(key);
      return;
    }
    this.memory.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.isLive()) {
      const keys = await this.client!.keys(pattern);
      if (keys.length) await this.client!.del(...keys);
      return;
    }
    const re = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*') + '$');
    for (const key of [...this.memory.keys()]) if (re.test(key)) this.memory.delete(key);
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }
}
