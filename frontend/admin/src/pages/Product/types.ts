import { ProductAuctionStatus, ProductStatus, ProductTag } from '@/types'

export enum ProductTagType {
  LateCompensation,
  FreeShipping,
  ShippingInsurance,
  Auction
}

export type ProductItem = {
  id: number
  productId?: string
  name: string
  image?: string
  tags?: ProductTagType[]
  startingPrice?: number
  fixedIncrement?: number
  maxPrice?: number
  currentPrice?: number
  bidCount?: number
  status?: ProductStatus
  tags?: ProductTag[]
  isExplaining?: boolean
  auctionStatus?: ProductAuctionStatus
  auctionStartTime?: string
  auctionEndTime?: string
}