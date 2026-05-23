export interface User {
  id: number;
  username: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginParams {
  phone: string;
  code: string;
}
