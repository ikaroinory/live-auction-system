export enum ProductStatus {
  Pending = 0,        // 待上架
  Published = 1       // 已上架
}

export interface Product {
  id: string
  creatorId: string
  name: string
  image: string
  startingPrice: number
  fixedIncrement: number
  maxPrice?: number
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
  startingPrice: number
  fixedIncrement?: number
  maxPrice?: number
  lateCompensation?: boolean
  freeShipping?: boolean
  shippingInsurance?: boolean
  auction?: boolean
}

export interface ProductWithAuctionRule extends Product {
  fixedIncrement: number
  durationSeconds: number
  autoExtendSeconds: number
}

export interface ProductFormDataWithAuctionRule extends ProductFormData {
  fixedIncrement: number
  maxPrice?: number
  durationSeconds: number
  autoExtendSeconds: number
}
