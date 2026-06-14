import api from './api'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  buyerId: string
  buyerNickname: string | null
  buyerPhone: string
  finalPrice: number
  status: number
  createdAt: string
}

export interface PagedOrderResponse {
  list: OrderItem[]
  total: number
  page: number
  pageSize: number
}

export const orderService = {
  getList: async (params?: { page?: number; pageSize?: number }): Promise<PagedOrderResponse> => {
    const response = await api.get('/orders', { params })
    return response.data
  }
}
