export interface User {
  id: number | string;
  phone: string;
  nickname?: string;
  avatar?: string;
  vipLevel: number;
  vipName?: string;
  createdAt: string;
}

export interface LoginParams {
  phone: string;
  code: string;
}
