import axios from 'axios'
import type {
  User,
  LoginParams,
  LoginResult,
  Auction,
  AuctionWithSeller,
  AuctionDetail,
  CreateAuctionParams,
  UpdateProfileParams,
  LiveRoom,
  LiveRoomWithStreamer,
  CreateLiveRoomParams,
  UpdateLiveRoomParams,
  LiveRoomFollowWithDetails,
  ProductParams,
  ExplainingProductResponse,
  Product,
} from '@live-auction/shared'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export const authAPI = {
  smsLogin: (params: LoginParams): Promise<LoginResult> => {
    return apiClient.post('/v1/auth/sms-login', params)
  },
  getCurrentUser: (): Promise<User> => {
    return apiClient.get('/v1/auth/me')
  },
  updateAvatar: (avatar: string): Promise<User> => {
    return apiClient.put('/v1/auth/avatar', { avatar })
  },
  updateProfile: (params: UpdateProfileParams): Promise<User> => {
    return apiClient.put('/v1/auth/profile', params)
  },
}

export const auctionAPI = {
  getAuctions: (status?: number): Promise<AuctionWithSeller[]> => {
    return apiClient.get('/v1/auctions', { params: status ? { status } : undefined })
  },
  getAuctionDetail: (id: string): Promise<AuctionDetail> => {
    return apiClient.get(`/v1/auctions/${id}`)
  },
  createAuction: (params: CreateAuctionParams): Promise<Auction> => {
    return apiClient.post('/v1/auctions', params)
  },
}

export const liveRoomAPI = {
  getLiveRooms: (status?: number): Promise<LiveRoomWithStreamer[]> => {
    return apiClient.get('/v1/live-rooms', { params: status ? { status } : undefined })
  },
  getLiveRoomDetail: (
    id: string
  ): Promise<LiveRoomWithStreamer & { isFollowed?: boolean; auctions?: unknown[] }> => {
    return apiClient.get(`/v1/live-rooms/${id}`)
  },
  createLiveRoom: (params: CreateLiveRoomParams): Promise<LiveRoom> => {
    return apiClient.post('/v1/live-rooms', params)
  },
  updateLiveRoom: (id: string, params: UpdateLiveRoomParams): Promise<LiveRoom> => {
    return apiClient.put(`/v1/live-rooms/${id}`, params)
  },
  followLiveRoom: (id: string): Promise<{ message: string; follow: LiveRoomFollowWithDetails }> => {
    return apiClient.post(`/v1/live-rooms/${id}/follow`)
  },
  unfollowLiveRoom: (id: string): Promise<{ message: string }> => {
    return apiClient.post(`/v1/live-rooms/${id}/unfollow`)
  },
  getMyFollowedLiveRooms: (): Promise<LiveRoomFollowWithDetails[]> => {
    return apiClient.get('/v1/live-rooms/my/followed')
  },
}

export const productAPI = {
  getProducts: (params?: ProductParams): Promise<{ list: Product[]; total: number; page: number; pageSize: number }> => {
    return apiClient.get('/v1/products', { params })
  },
  getProductDetail: (id: string): Promise<Product> => {
    return apiClient.get(`/v1/products/${id}`)
  },
  getCurrentExplaining: (): Promise<ExplainingProductResponse> => {
    return apiClient.get('/v1/products/explaining')
  },
}

export default apiClient
