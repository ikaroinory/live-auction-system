import api from './api';
import type { Auction, AuctionFormData } from '@/types';

export const auctionService = {
  getList: async (params?: {
    page?: number;
    pageSize?: number;
    status?: number;
  }): Promise<{ list: Auction[]; total: number }> => {
    const response = await api.get('/auctions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Auction> => {
    const response = await api.get(`/auctions/${id}`);
    return response.data;
  },

  create: async (data: AuctionFormData): Promise<Auction> => {
    const response = await api.post('/auctions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<AuctionFormData>): Promise<Auction> => {
    const response = await api.put(`/auctions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/auctions/${id}`);
  },

  start: async (id: number): Promise<void> => {
    await api.post(`/auctions/${id}/start`);
  },

  stop: async (id: number): Promise<void> => {
    await api.post(`/auctions/${id}/stop`);
  },
};
