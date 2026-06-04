import api from './api'
import type { Product, ProductFormData, ProductStatus } from '@/types'

export const productService = {
  getList: async (params?: {
    page?: number
    pageSize?: number
    status?: ProductStatus
    creatorId?: string
  }): Promise<{ list: Product[]; total: number }> => {
    const response = await api.get('/products', { params })
    return response.data
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  create: async (data: ProductFormData): Promise<Product> => {
    const response = await api.post('/products', data)
    return response.data
  },

  update: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  updateStatus: async (id: string, status: ProductStatus): Promise<void> => {
    await api.patch(`/products/${id}/status`, { status })
  },

  toggleExplaining: async (id: string, start: boolean = true): Promise<{
    success: boolean
    message: string
    prevExplainingProductId: string | null
    roomId: string | null
  }> => {
    const response = await api.patch(`/products/${id}/explaining`, { start })
    return response.data
  },

  getCurrentExplaining: async (): Promise<{
    success: boolean
    productId: string | null
    roomId: string | null
  }> => {
    const response = await api.get('/products/explaining')
    return response.data
  },

  startAuction: async (id: string): Promise<Product> => {
    const response = await api.patch(`/products/${id}/start-auction`)
    return response.data
  },

  endAuction: async (id: string): Promise<Product> => {
    const response = await api.patch(`/products/${id}/end-auction`)
    return response.data
  }
}