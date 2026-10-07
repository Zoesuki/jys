/** 分页契约（接口契约.md §1.3） */
export interface PageParams {
  page?: number; // 默认 1
  pageSize?: number; // 默认 20，最大 100
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
