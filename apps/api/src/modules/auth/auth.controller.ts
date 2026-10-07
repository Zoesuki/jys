import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from '@jys/shared';
import { ok } from '../../common/http/api-response.helper';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import { Public } from '../../common/guards/decorators';
import { AuthService } from './auth.service';
import { JwtPayload } from './jwt.payload';
import {
  ActivateDto,
  Admin2faVerifyDto,
  EmailCodeDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dtos';

/** 接口契约 docs/接口契约.md §2.1（12 端点）；权限以全局守卫+本文件装饰器为准 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** 图形验证码（NFR-06 防撞库） */
  @Public()
  @Post('captcha')
  @HttpCode(HttpStatus.OK)
  async captcha(): Promise<ApiResponse<{ captchaId: string; svg: string }>> {
    return ok(await this.auth.createCaptcha());
  }

  /** 提交注册 → 待激活 + 自动发送激活码（状态机 4.1；P9-20 7 天未激活释放邮箱） */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ApiResponse<{ email: string; devCode?: string }>> {
    return ok(await this.auth.register(dto));
  }

  /** 验证码发送（scene=register 重发激活码 / scene=reset 重置密码；10 分钟有效 / 60 秒冷却 P9-23） */
  @Public()
  @Post('email-code')
  @HttpCode(HttpStatus.OK)
  async emailCode(@Body() dto: EmailCodeDto): Promise<ApiResponse<{ devCode?: string }>> {
    return ok(await this.auth.sendEmailCode(dto));
  }

  /** 激活（待激活 → 已激活_未入会） */
  @Public()
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Body() dto: ActivateDto): Promise<ApiResponse<null>> {
    await this.auth.activate(dto);
    return ok(null, '激活成功，请登录');
  }

  /** 登录（图形验证码 + 5 次失败锁 15 分钟 NFR-06；封禁禁止登录；rememberMe 延长 refresh） */
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ApiResponse<{ token: string; refreshToken: string; expiresIn: number; session: unknown }>> {
    return ok(await this.auth.login(dto));
  }

  /** 刷新令牌（轮换：旧 refresh 立即失效） */
  @Public()
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }): Promise<ApiResponse<{ token: string; refreshToken: string; expiresIn: number; session: unknown }>> {
    return ok(await this.auth.refresh(body.refreshToken));
  }

  /** 登出（吊销当前 refresh 白名单） */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: JwtPayload): Promise<ApiResponse<null>> {
    await this.auth.logout(user);
    return ok(null, '已登出');
  }

  /** 当前会话（角色/状态/等级段位/2FA 标记） */
  @Get('me')
  async me(@CurrentUser() user: JwtPayload): Promise<ApiResponse<unknown>> {
    return ok(await this.auth.me(user));
  }

  /** 忘记密码（防枚举：恒成功响应；P9-15 安全类邮件不受订阅开关限制） */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ApiResponse<{ devCode?: string }>> {
    return ok(await this.auth.forgotPassword(dto));
  }

  /** 重置密码（全端下线 + 清除失败锁定计数） */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ApiResponse<null>> {
    await this.auth.resetPassword(dto);
    return ok(null, '密码已重置，请使用新密码登录');
  }

  /** 管理后台二次验证码发送（NFR-07；邮箱打码回显） */
  @Post('admin/2fa/code')
  @HttpCode(HttpStatus.OK)
  async admin2faCode(@CurrentUser() user: JwtPayload): Promise<ApiResponse<{ maskedEmail: string; devCode?: string }>> {
    return ok(await this.auth.admin2faSendCode(user));
  }

  /** 管理后台二次验证（通过后 12h 内访问后台接口；5 次失败锁 15 分钟） */
  @Post('admin/2fa/verify')
  @HttpCode(HttpStatus.OK)
  async admin2faVerify(@CurrentUser() user: JwtPayload, @Body() dto: Admin2faVerifyDto): Promise<ApiResponse<null>> {
    await this.auth.admin2faVerify(user, dto);
    return ok(null, '二次验证通过');
  }
}
