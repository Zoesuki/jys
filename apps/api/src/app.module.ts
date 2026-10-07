import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [PrismaModule, CommonModule, AuthModule],
  controllers: [HealthController],
  providers: [
    // 全局规范（架构文档 §4.3/§4.4）：统一异常响应 + 认证/角色两级守卫 + 入参校验
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, transform: true }) },
  ],
})
export class AppModule {}
