import { getData } from './http';

/** 健康检查（骨架联调用例：GET /api/health） */
export function getHealth() {
  return getData<{ status: string; time: string }>('/health');
}
