import api from './api'
import type { Product, ProductFormData } from '@/types'

export const productService = {
  getList: async (params?: {
    page?: number
    pageSize?: number
    status?: number
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

  updateStatus: async (id: string, status: number): Promise<void> => {
    await api.patch(`/products/${id}/status`, { status })
  },

  toggleExplaining: async (id: string): Promise<void> => {
    await api.patch(`/products/${id}/explaining`)
  }
}
