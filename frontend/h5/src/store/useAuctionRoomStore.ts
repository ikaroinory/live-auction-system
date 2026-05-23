import { create } from 'zustand';
import type { Auction, RankingItem, Bid } from '../types/auction';

interface AuctionRoomState {
  currentAuction: Auction | null;
  currentPrice: number;
  rankings: RankingItem[];
  myBids: Bid[];
  remainingMs: number;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isLeading: boolean;
  lastBidTime: number;
  
  setCurrentAuction: (auction: Auction | null) => void;
  updatePrice: (price: number) => void;
  updateRankings: (rankings: RankingItem[]) => void;
  addMyBid: (bid: Bid) => void;
  setRemainingTime: (ms: number) => void;
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  setIsLeading: (isLeading: boolean) => void;
  reset: () => void;
}

export const useAuctionRoomStore = create<AuctionRoomState>((set) => ({
  currentAuction: null,
  currentPrice: 0,
  rankings: [],
  myBids: [],
  remainingMs: 0,
  connectionStatus: 'disconnected',
  isLeading: false,
  lastBidTime: 0,
  
  setCurrentAuction: (auction) => set({ currentAuction: auction }),
  updatePrice: (price) => set({ currentPrice: price, lastBidTime: Date.now() }),
  updateRankings: (rankings) => set({ rankings }),
  addMyBid: (bid) => set((state) => ({ myBids: [bid, ...state.myBids] })),
  setRemainingTime: (ms) => set({ remainingMs: ms }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setIsLeading: (isLeading) => set({ isLeading }),
  reset: () => set({
    currentAuction: null,
    currentPrice: 0,
    rankings: [],
    myBids: [],
    remainingMs: 0,
    connectionStatus: 'disconnected',
    isLeading: false,
    lastBidTime: 0,
  }),
}));
