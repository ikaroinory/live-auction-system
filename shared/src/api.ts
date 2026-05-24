export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
