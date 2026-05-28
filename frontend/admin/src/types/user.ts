export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'seller';
  avatar?: string;
  createdAt: string;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
