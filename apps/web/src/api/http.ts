import axios, { AxiosError } from 'axios';
import { ElMessage } from 'element-plus';
import type { ApiResponse } from '@jys/shared';

/**
 * 全局请求封装（架构文档 §4.4 错误处理）。
 * - 统一 baseURL（/api，开发经 Vite 代理）
 * - 自动携带 Authorization 与 X-Request-Id
 * - 响应拦截：401 → 登录页带 redirect；403 → 无权提示；网络错误重试一次；业务码非 OK → 码表 toast
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api',
  timeout: 15_000,
});

const RETRY_FLAG = '__retried';

http.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('jys.session') ?? 'null');
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  config.headers['X-Request-Id'] = crypto.randomUUID();
  return config;
});

http.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResponse;
    if (body && typeof body === 'object' && 'code' in body && body.code !== 'OK') {
      ElMessage.error(body.message || `请求失败（${body.code}）`);
      return Promise.reject(new Error(body.code));
    }
    return res;
  },
  async (err: AxiosError) => {
    const config = err.config as (typeof err.config & { [RETRY_FLAG]?: boolean }) | undefined;
    // 网络层错误（无响应）自动重试一次
    if (config && !err.response && !config[RETRY_FLAG]) {
      config[RETRY_FLAG] = true;
      return http.request(config);
    }
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem('jys.session');
      const redirect = encodeURIComponent(location.pathname + location.search);
      location.href = `/guest/login?redirect=${redirect}`;
      return Promise.reject(err);
    }
    if (status === 403) {
      ElMessage.error('没有执行该操作的权限');
      return Promise.reject(err);
    }
    ElMessage.error(status ? `请求失败（HTTP ${status}）` : '网络异常，请稍后重试');
    return Promise.reject(err);
  },
);

/** GET 快捷封装：直接返回 ApiResponse.data（非 OK 已在拦截器中拒绝） */
export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await http.get<ApiResponse<T>>(url, { params });
  return res.data.data as T;
}

export async function postData<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.post<ApiResponse<T>>(url, body);
  return res.data.data as T;
}
