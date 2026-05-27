export interface Auction {
  id: string
  sellerId: string
  title: string
  description: string
  images: string[]
  startPrice: number
  minIncrement: number
  maxPrice: number | null
  durationSeconds: number
  autoExtendSeconds: number
  status: 0 | 1 | 2 | 3
  startTime: string | null
  endTime: string | null
  finalPrice: number | null
  winnerId: string | null
  createdAt: string
  updatedAt: string
}

export interface Bid {
  id: string
  auctionId: string
  userId: string
  price: number
  createdAt: string
}

export interface RankingItem {
  userId: string
  username?: string
  phone?: string
  price: number
  rank: number
  isCurrentUser?: boolean
}
