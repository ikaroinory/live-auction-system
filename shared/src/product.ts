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
  description: string | null
  image: string
  startingPrice: number
  fixedIncrement: number
  maxPrice: number | null
  tags: string[]
  durationMinutes: number
  extendSeconds: number
  auctionStatus: ProductAuctionStatus
  auctionStartTime: string | null
  auctionEndTime: string | null
  currentBidPrice: number | null
  bidCount: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ProductResponse extends Product {
  creator?: {
    id: string
    nickname: string | null
    avatar: string | null
  }
}

export interface ProductParams {
  page?: number
  pageSize?: number
  status?: string
  creatorId?: string
}

export interface PagedProductResponse {
  list: ProductResponse[]
  total: number
  page: number
  pageSize: number
}

export interface ExplainingProductResponse {
  success: boolean
  productId: string | null
  roomId: string | null
}

export interface CreateProductRequest {
  name: string
  description?: string
  image: string
  startingPrice: number
  fixedIncrement: number
  maxPrice?: number
  durationMinutes: number
  extendSeconds?: number
  tags?: string[]
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  image?: string
  startingPrice?: number
  fixedIncrement?: number
  maxPrice?: number
  durationMinutes?: number
  extendSeconds?: number
  tags?: string[]
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

export interface Bid {
  id: string
  productId: string
  userId: string
  price: number
  createdAt: string
}

export interface BidResponse extends Bid {
  user?: {
    id: string
    nickname: string | null
    phone: string
    avatar: string | null
  }
}

export interface PagedBidResponse {
  list: BidResponse[]
  total: number
  page: number
  pageSize: number
}

export interface CreateBidRequest {
  productId: string
  price: number
}

export interface BidParams {
  page?: number
  pageSize?: number
  productId?: string
  userId?: string
}