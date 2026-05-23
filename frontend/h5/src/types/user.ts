export interface User {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  vipLevel: number;
  vipName?: string;
  createdAt: string;
}

export interface LoginParams {
  phone: string;
  code: string;
}
