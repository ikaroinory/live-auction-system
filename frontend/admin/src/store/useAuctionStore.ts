import { create } from 'zustand'
import type { Auction } from '@/types'

interface AuctionState {
  auctions: Auction[]
  currentAuction: Auction | null
  setAuctions: (auctions: Auction[]) => void
  addAuction: (auction: Auction) => void
  updateAuction: (id: number, updates: Partial<Auction>) => void
  setCurrentAuction: (auction: Auction | null) => void
}

export const useAuctionStore = create<AuctionState>((set) => ({
  auctions: [],
  currentAuction: null,
  setAuctions: (auctions) => set({ auctions }),
  addAuction: (auction) => set((state) => ({ auctions: [...state.auctions, auction] })),
  updateAuction: (id, updates) =>
    set((state) => ({
      auctions: state.auctions.map((a) => (a.id === id ? { ...a, ...updates } : a))
    })),
  setCurrentAuction: (auction) => set({ currentAuction: auction })
}))
