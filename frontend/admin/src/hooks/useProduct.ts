import { useSWRConfig } from 'swr'
import { useCustomSWR } from './useSWRConfig'
import { productService } from '@/services'
import type { Product, ProductFormData, ProductStatus } from '@/types'

interface ProductListParams {
  page?: number
  pageSize?: number
  status?: ProductStatus
}

interface ProductListResponse {
  list: Product[]
  total: number
}

export function useProductList(params?: ProductListParams) {
  const key = params
    ? `/products?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()}`
    : '/products'

  const swrResult = useCustomSWR<ProductListResponse>(key)
  
  return {
    ...swrResult,
    refresh: () => swrResult.mutate()
  }
}

export function useProduct(id?: string) {
  const key = id ? `/products/${id}` : null

  return useCustomSWR<Product>(key)
}

export function useProductMutations() {
  const { mutate } = useSWRConfig()

  const createProduct = async (data: ProductFormData) => {
    const result = await productService.create(data)
    mutate((key) => typeof key === 'string' && key.startsWith('/products'))
    return result
  }

  const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
    const result = await productService.update(id, data)
    mutate(`/products/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/products'))
    return result
  }

  const deleteProduct = async (id: string) => {
    await productService.delete(id)
    mutate((key) => typeof key === 'string' && key.startsWith('/products'))
  }

  const updateProductStatus = async (id: string, status: ProductStatus) => {
    await productService.updateStatus(id, status)
    mutate(`/products/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/products'))
  }

  const toggleExplaining = async (id: string) => {
    await productService.toggleExplaining(id)
    mutate(`/products/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/products'))
  }

  const startAuction = async (id: string) => {
    await productService.startAuction(id)
    mutate(`/products/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/products'))
  }

  const endAuction = async (id: string) => {
    await productService.endAuction(id)
    mutate(`/products/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/products'))
  }

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    toggleExplaining,
    startAuction,
    endAuction
  }
}