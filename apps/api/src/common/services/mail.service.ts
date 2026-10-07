import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

export interface MailResult {
  delivered: boolean;
  /** 开发环境（SMTP_HOST 为空）时回显验证码，便于无邮件服务器联调；生产恒为 undefined */
  devCode?: string;
}

/**
 * 邮件服务（本地部署形态：SMTP 配置化，见架构文档 §1.6）。
 * SMTP_HOST 为空 → 开发模式：验证码打印到日志并随响应回显（devCode），生产必须配置 SMTP。
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT ?? 587) === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      });
    } else {
      this.logger.warn('[mail] SMTP_HOST 未配置，开发模式：邮件仅打印日志（验证码随响应 devCode 回显）');
    }
  }

  async send(to: string, subject: string, text: string, devCode?: string): Promise<MailResult> {
    if (!this.transporter) {
      this.logger.log(`[MAIL:DEV] to=${to} subject=${subject} body=${text}`);
      return { delivered: false, devCode: process.env.NODE_ENV === 'production' ? undefined : devCode };
    }
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER ?? 'noreply@jyouclub.cn',
        to,
        subject,
        text,
      });
      return { delivered: true };
    } catch (err) {
      this.logger.error(`[mail] 发送失败 to=${to}: ${(err as Error).message}`);
      throw err;
    }
  }
}
