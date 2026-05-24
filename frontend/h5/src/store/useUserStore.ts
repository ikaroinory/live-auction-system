import { create } from 'zustand';
import type { User } from '@live-auction/shared';
import { authAPI } from '../services/api';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  
  login: (user) => set({ user, isLoggedIn: true }),
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isLoggedIn: false });
  },
  
  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, isLoggedIn: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    
    try {
      const userData = await authAPI.getCurrentUser();
      set({ user: userData, isLoggedIn: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },
}));
