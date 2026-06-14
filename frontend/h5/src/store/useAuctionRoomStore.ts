import { create } from 'zustand'
import type { RankingItem, Bid } from '@live-auction/shared'

// 定义拍卖房间使用的商品类型，兼容 Product 和实际传递的数据
interface AuctionProduct {
  id: string
  name?: string
  startingPrice: number
  fixedIncrement: number
  maxPrice?: number
  currentBidPrice?: number
  durationMinutes?: number
  createdAt?: string
  updatedAt?: string
}

interface AuctionRoomState {
  currentAuction: AuctionProduct | null
  currentPrice: number
  bidCount: number
  rankings: RankingItem[]
  myBids: Bid[]
  bidHistory: Bid[]
  remainingMs: number
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  isLeading: boolean
  lastBidTime: number

  setCurrentAuction: (auction: AuctionProduct | null) => void
  updatePrice: (price: number) => void
  updateBidCount: (count: number) => void
  updateRankings: (rankings: RankingItem[]) => void
  addMyBid: (bid: Bid) => void
  addBidToHistory: (bid: Bid) => void
  setBidHistory: (bids: Bid[]) => void
  setRemainingTime: (ms: number) => void
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void
  setIsLeading: (isLeading: boolean) => void
  reset: () => void
}

export const useAuctionRoomStore = create<AuctionRoomState>((set) => ({
  currentAuction: null,
  currentPrice: 0,
  bidCount: 0,
  rankings: [],
  myBids: [],
  bidHistory: [],
  remainingMs: 0,
  connectionStatus: 'disconnected',
  isLeading: false,
  lastBidTime: 0,

  setCurrentAuction: (auction) => set({ currentAuction: auction }),
  updatePrice: (price) => set({ currentPrice: price, lastBidTime: Date.now() }),
  updateBidCount: (count) => set({ bidCount: count }),
  updateRankings: (rankings) => set({ rankings }),
  addMyBid: (bid) => set((state) => ({ myBids: [bid, ...state.myBids] })),
  addBidToHistory: (bid) => set((state) => ({ bidHistory: [bid, ...state.bidHistory] })),
  setBidHistory: (bids) => set({ bidHistory: bids }),
  setRemainingTime: (ms) => set({ remainingMs: ms }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setIsLeading: (isLeading) => set({ isLeading }),
  reset: () =>
    set({
      currentAuction: null,
      currentPrice: 0,
      bidCount: 0,
      rankings: [],
      myBids: [],
      bidHistory: [],
      remainingMs: 0,
      connectionStatus: 'disconnected',
      isLeading: false,
      lastBidTime: 0,
    }),
}))
