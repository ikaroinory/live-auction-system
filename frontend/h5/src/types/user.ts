export interface User {
  id: string;
  phone: string;
  nickname?: string;
  avatar?: string;
  createdAt: string;
}

export interface LoginParams {
  phone: string;
  code: string;
}
