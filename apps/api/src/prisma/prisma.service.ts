import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** PrismaClient 依赖注入封装（账务/业务模块统一经此访问 DB） */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // 连接失败不阻塞启动（健康检查可见降级），首个查询时抛错暴露问题
    await this.$connect().catch((err) => console.error('[prisma] connect failed:', err.message));
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
