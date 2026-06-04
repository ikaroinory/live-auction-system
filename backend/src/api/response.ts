export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PagedResponse<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface UserResponse {
  id: string
  phone: string
  nickname: string | null
  avatar: string | null
  bio: string | null
  gender: number | null
  birthday: string | undefined
  location: string
  douyinId: string | null
  createdAt: string
}

export interface ProductResponse {
  id: string
  name: string
  description: string | null
  image: string
  startingPrice: number
  fixedIncrement: number
  maxPrice: number | null
  durationMinutes: number
  extendSeconds: number
  tags: string[]
  status: string
  isExplaining: boolean
  auctionStatus: string
  auctionStartTime: string | null
  auctionEndTime: string | null
  currentBidPrice: number | null
  bidCount: number
  creatorId: string
  creator?: {
    id: string
    nickname: string | null
    avatar: string | null
  }
  createdAt: string
}

export interface AuctionResponse {
  id: string
  productId: string
  reservePrice: number
  currentPrice: number
  status: string
  startTime: string
  endTime: string
  fixedIncrement: number
  currentWinnerId: string | null
  product?: {
    id: string
    name: string
    image: string
    startingPrice: number
    description?: string
    tags?: string[]
  }
  currentWinner?: {
    id: string
    nickname: string | null
    avatar: string | null
  }
  createdAt: string
}

export interface BidResponse {
  id: string
  auctionId: string
  userId: string
  amount: number
  user?: {
    id: string
    nickname: string | null
    avatar: string | null
  }
  createdAt: string
}

export interface LiveRoomResponse {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  status: string
  hostId: string
  startedAt: string | null
  endedAt: string | null
  host?: {
    id: string
    nickname: string | null
    avatar: string | null
  }
  createdAt: string
}
