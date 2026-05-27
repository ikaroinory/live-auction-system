import { create } from 'zustand'
import type { Auction, RankingItem, Bid } from '@live-auction/shared'

interface AuctionRoomState {
  currentAuction: Auction | null
  currentPrice: number
  rankings: RankingItem[]
  myBids: Bid[]
  bidHistory: Bid[]
  remainingMs: number
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  isLeading: boolean
  lastBidTime: number

  setCurrentAuction: (auction: Auction | null) => void
  updatePrice: (price: number) => void
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
  rankings: [],
  myBids: [],
  bidHistory: [],
  remainingMs: 0,
  connectionStatus: 'disconnected',
  isLeading: false,
  lastBidTime: 0,

  setCurrentAuction: (auction) => set({ currentAuction: auction }),
  updatePrice: (price) => set({ currentPrice: price, lastBidTime: Date.now() }),
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
      rankings: [],
      myBids: [],
      bidHistory: [],
      remainingMs: 0,
      connectionStatus: 'disconnected',
      isLeading: false,
      lastBidTime: 0,
    }),
}))
