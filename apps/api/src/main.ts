import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  // 全局规范：requestId 贯穿（AppModule 注册）+ 统一异常响应（架构文档 §4.4/§4.5）
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();
