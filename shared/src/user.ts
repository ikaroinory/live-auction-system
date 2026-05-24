export interface User {
  id: string;
  phone: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  birthday?: string;
  location?: string;
  douyinId?: string;
  createdAt: string;
}

export interface UserSlim {
  id: string;
  phone: string;
  nickname?: string;
}

export interface LoginParams {
  phone: string;
  code: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export interface UpdateProfileParams {
  nickname?: string;
  bio?: string;
  gender?: string;
  birthday?: string;
  location?: string;
  douyinId?: string;
}