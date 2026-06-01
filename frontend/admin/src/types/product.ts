export enum ProductStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED'
}

export enum ProductAuctionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ENDED = 'ENDED'
}

export enum ProductTag {
  LATE_COMPENSATION = 'LATE_COMPENSATION',
  FREE_SHIPPING = 'FREE_SHIPPING',
  SHIPPING_INSURANCE = 'SHIPPING_INSURANCE',
  AUCTION = 'AUCTION'
}

export interface Product {
  id: string
  creatorId: string
  name: string
  image: string
  startingPrice: number
  fixedIncrement: number
  maxPrice?: number
  tags: ProductTag[]
  isExplaining: boolean
  durationMinutes: number
  extendSeconds: number
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
  tags?: ProductTag[]
  durationMinutes?: number
  extendSeconds?: number
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