import { create } from 'zustand';
import type { User } from '../types/user';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

// 模拟用户数据
const mockUser: User = {
  id: 10001,
  username: 'user001',
  nickname: '竞拍达人',
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  phone: '138****8888',
  vipLevel: 3,
  vipName: '黄金会员',
  createdAt: '2023-01-01T00:00:00Z',
};

export const useUserStore = create<UserState>((set) => ({
  user: mockUser,
  isLoggedIn: true,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  login: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));
