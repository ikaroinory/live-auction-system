export enum ProductStatus {
  Unpublished = 0,
  Published = 1
}

export enum ProductAuctionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ENDED = 'ENDED'
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
  isExplaining: boolean
  // 竞拍相关字段
  auctionDuration: number
  autoExtendSeconds: number
  auctionStatus: ProductAuctionStatus
  auctionStartTime?: string
  auctionEndTime?: string
  currentBidPrice?: number
  bidCount: number
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
