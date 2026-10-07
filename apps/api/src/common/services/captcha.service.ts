import { Injectable } from '@nestjs/common';
import svgCaptcha from 'svg-captcha';
import { createHash, randomUUID } from 'node:crypto';
import { RedisService } from './redis.service';

export interface CaptchaChallenge {
  captchaId: string;
  svg: string; // 前端直接内嵌渲染
}

/**
 * 图形验证码（NFR-06 防撞库）：4 位字符、5 分钟有效、一次性校验（不区分大小写）。
 * 答案以 SHA-256 摘要存 Redis，泄露库也无法反推。
 */
@Injectable()
export class CaptchaService {
  private static TTL_SECONDS = 300;

  constructor(private readonly redis: RedisService) {}

  async create(): Promise<CaptchaChallenge> {
    const { data, text } = svgCaptcha.create({ size: 4, ignoreChars: '0o1iIl', noise: 2 });
    const captchaId = randomUUID();
    await this.redis.setex(`auth:captcha:${captchaId}`, CaptchaService.TTL_SECONDS, sha256(text.toLowerCase()));
    return { captchaId, svg: data };
  }

  /** 校验并销毁（一次性）；通过返回 true */
  async verify(captchaId: string, text: string): Promise<boolean> {
    const key = `auth:captcha:${captchaId}`;
    const stored = await this.redis.get(key);
    if (!stored) return false;
    await this.redis.del(key); // 一次性
    return stored === sha256((text ?? '').toLowerCase());
  }
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
