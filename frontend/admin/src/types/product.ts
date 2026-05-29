export type ProductStatus = 0 | 1 | 2

export interface Product {
  id: number
  sellerId: number
  name: string
  description: string
  images: string[]
  price: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  description: string
  images: string[]
  price: number
}

export interface ProductWithAuctionRule extends Product {
  startPrice: number
  minIncrement: number
  maxPrice?: number
  durationSeconds: number
  autoExtendSeconds: number
}

export interface ProductFormDataWithAuctionRule extends ProductFormData {
  startPrice: number
  minIncrement: number
  maxPrice?: number
  durationSeconds: number
  autoExtendSeconds: number
}
