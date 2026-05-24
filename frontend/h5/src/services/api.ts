
import axios from 'axios';
import type {
  User,
  LoginParams,
  LoginResult,
  Auction,
  AuctionWithSeller,
  AuctionDetail,
  CreateAuctionParams,
} from '@live-auction/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) =&gt; {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) =&gt; {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) =&gt; {
    return response.data;
  },
  (error) =&gt; {
    const message = error.response?.data?.message || error.message || '请求失败';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  smsLogin: (params: LoginParams): Promise&lt;LoginResult&gt; =&gt; {
    return apiClient.post('/v1/auth/sms-login', params);
  },
  getCurrentUser: (): Promise&lt;User&gt; =&gt; {
    return apiClient.get('/v1/auth/me');
  },
};

export const auctionAPI = {
  getAuctions: (status?: number): Promise&lt;AuctionWithSeller[]&gt; =&gt; {
    return apiClient.get('/v1/auctions', { params: status ? { status } : undefined });
  },
  getAuctionDetail: (id: string): Promise&lt;AuctionDetail&gt; =&gt; {
    return apiClient.get(`/v1/auctions/${id}`);
  },
  createAuction: (params: CreateAuctionParams): Promise&lt;Auction&gt; =&gt; {
    return apiClient.post('/v1/auctions', params);
  },
};

export default apiClient;
