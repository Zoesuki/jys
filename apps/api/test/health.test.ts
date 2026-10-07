import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import { HealthController } from '../src/modules/health/health.controller';

describe('HealthController', () => {
  it('GET /api/health returns OK envelope', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    const ctrl = moduleRef.get(HealthController);
    const res = ctrl.health();
    expect(res.code).toBe('OK');
    expect(res.data?.status).toBe('up');
  });
});
