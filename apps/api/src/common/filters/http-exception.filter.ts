import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse, ERROR_CODES } from '@jys/shared';
import type { Response, Request } from 'express';

/**
 * 全局异常过滤器：一切错误统一为 {code, message, requestId}（架构文档 §4.4）。
 * HttpException → 取其状态码与信息；未捕获异常 → SYS-5000，细节只进日志不外泄。
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = (req.headers['x-request-id'] as string) ?? req.requestId ?? '';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiResponse<null>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string' ? payload : ((payload as { message?: string }).message ?? exception.message);
      body = { code: statusToCode(status), message, data: null, requestId };
    } else {
      // 未预期异常：全量进日志（pino 接入后含堆栈），对外只给 SYS-5000
      body = {
        code: ERROR_CODES.SYS_INTERNAL,
        message: '系统内部错误（SYS-5000）',
        data: null,
        requestId,
      };
    }
    res.status(status).json(body);
  }
}

function statusToCode(status: number): string {
  switch (status) {
    case HttpStatus.UNAUTHORIZED:
      return 'AUTH-1001';
    case HttpStatus.FORBIDDEN:
      return 'AUTH-1005';
    case HttpStatus.NOT_FOUND:
      return 'SYS-5001';
    case HttpStatus.BAD_REQUEST:
      return 'SYS-5002';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'AUTH-1004';
    default:
      return ERROR_CODES.SYS_INTERNAL;
  }
}
