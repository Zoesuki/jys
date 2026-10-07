import { IsEmail, IsIn, Matches, MinLength } from 'class-validator';

export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const PASSWORD_RULE_MESSAGE = '密码需 8 位以上，且包含字母、数字与符号';

/** POST /auth/register：提交注册（→ 待激活，激活码邮件已发送；状态机 4.1） */
export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @MinLength(8, { message: PASSWORD_RULE_MESSAGE })
  @Matches(PASSWORD_RULE, { message: PASSWORD_RULE_MESSAGE })
  password!: string;
}

/** POST /auth/activate：邮箱验证码激活（待激活 → 已激活_未入会） */
export class ActivateDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @Matches(/^\d{6}$/, { message: '激活码为 6 位数字' })
  code!: string;
}

/** POST /auth/login：图形验证码 + 失败锁定（NFR-06） */
export class LoginDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  password!: string;

  captchaId!: string;

  captchaText!: string;

  rememberMe?: boolean;
}

/** POST /auth/email-code：验证码发送（scene 决定模板与占用校验；P9-23 10 分钟/60 秒） */
export class EmailCodeDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsIn(['register', 'reset'], { message: '验证码场景无效' })
  scene!: 'register' | 'reset';
}

/** POST /auth/forgot-password */
export class ForgotPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;
}

/** POST /auth/reset-password */
export class ResetPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @Matches(/^\d{6}$/, { message: '验证码为 6 位数字' })
  code!: string;

  @MinLength(8, { message: PASSWORD_RULE_MESSAGE })
  @Matches(PASSWORD_RULE, { message: PASSWORD_RULE_MESSAGE })
  newPassword!: string;

  confirmPassword!: string;
}

/** POST /auth/admin/2fa/verify（NFR-07） */
export class Admin2faVerifyDto {
  @Matches(/^\d{6}$/, { message: '验证码为 6 位数字' })
  code!: string;
}
