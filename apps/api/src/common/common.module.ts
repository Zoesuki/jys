import { Global, Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { MailService } from './services/mail.service';
import { PasswordService } from './services/password.service';
import { CaptchaService } from './services/captcha.service';

/** 通用基建：Redis/邮件/密码/图形验证码（全部模块可用） */
@Global()
@Module({
  providers: [RedisService, MailService, PasswordService, CaptchaService],
  exports: [RedisService, MailService, PasswordService, CaptchaService],
})
export class CommonModule {}
