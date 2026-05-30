import { useSWRConfig } from 'swr'
import { useCustomSWR } from './useSWRConfig'
import { auctionService } from '@/services'
import type { Auction, AuctionFormData } from '@/types'

interface AuctionListParams {
  page?: number
  pageSize?: number
  status?: number
}

interface AuctionListResponse {
  list: Auction[]
  total: number
}

export function useAuctionList(params?: AuctionListParams) {
  const key = params
    ? `/auctions?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()}`
    : '/auctions'

  return useCustomSWR<AuctionListResponse>(key)
}

export function useAuction(id?: number) {
  const key = id ? `/auctions/${id}` : null

  return useCustomSWR<Auction>(key)
}

export function useAuctionMutations() {
  const { mutate } = useSWRConfig()

  const createAuction = async (data: AuctionFormData) => {
    const result = await auctionService.create(data)
    mutate((key) => typeof key === 'string' && key.startsWith('/auctions'))
    return result
  }

  const updateAuction = async (id: number, data: Partial<AuctionFormData>) => {
    const result = await auctionService.update(id, data)
    mutate(`/auctions/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/auctions'))
    return result
  }

  const deleteAuction = async (id: number) => {
    await auctionService.delete(id)
    mutate((key) => typeof key === 'string' && key.startsWith('/auctions'))
  }

  const startAuction = async (id: number) => {
    await auctionService.start(id)
    mutate(`/auctions/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/auctions'))
  }

  const stopAuction = async (id: number) => {
    await auctionService.stop(id)
    mutate(`/auctions/${id}`)
    mutate((key) => typeof key === 'string' && key.startsWith('/auctions'))
  }

  return {
    createAuction,
    updateAuction,
    deleteAuction,
    startAuction,
    stopAuction
  }
}
