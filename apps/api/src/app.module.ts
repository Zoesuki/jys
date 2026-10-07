import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HealthController } from './modules/health/health.controller';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
