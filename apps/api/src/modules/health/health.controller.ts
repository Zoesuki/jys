import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@jys/shared';

@Controller('health')
export class HealthController {
  @Get()
  health(): ApiResponse<{ status: string; time: string }> {
    return { code: 'OK', message: 'ok', data: { status: 'up', time: new Date().toISOString() } };
  }
}
