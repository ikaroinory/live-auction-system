
export interface ApiResponse&lt;T = any&gt; {
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

export interface PaginationResult&lt;T&gt; {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
