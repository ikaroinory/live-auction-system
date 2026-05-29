export type ProductStatus = 0 | 1 | 2

export interface Product {
  id: string
  creatorId: string
  name: string
  image: string
  tags: string[]
  startingPrice: number
  fixedIncrement: number
  capPrice?: number
  lateCompensation: boolean
  freeShipping: boolean
  shippingInsurance: boolean
  auction: boolean
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  image: string
  tags?: string[]
  startingPrice: number
  fixedIncrement?: number
  capPrice?: number
  lateCompensation?: boolean
  freeShipping?: boolean
  shippingInsurance?: boolean
  auction?: boolean
}

export interface ProductWithAuctionRule extends Product {
  minIncrement: number
  durationSeconds: number
  autoExtendSeconds: number
}

export interface ProductFormDataWithAuctionRule extends ProductFormData {
  minIncrement: number
  maxPrice?: number
  durationSeconds: number
  autoExtendSeconds: number
}
