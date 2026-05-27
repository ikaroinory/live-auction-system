import { useEffect, useRef, useCallback } from 'react'
import { websocketService } from '../services/websocket'

interface UseWebSocketOptions {
  auctionId?: number
  userId?: number
  autoConnect?: boolean
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { auctionId, userId, autoConnect = true } = options
  const hasJoinedRef = useRef(false)

  const connect = useCallback(() => {
    websocketService.connect()
  }, [])

  const disconnect = useCallback(() => {
    if (auctionId && userId && hasJoinedRef.current) {
      websocketService.leaveRoom(auctionId, userId)
      hasJoinedRef.current = false
    }
    websocketService.disconnect()
  }, [auctionId, userId])

  const joinRoom = useCallback(() => {
    if (auctionId && userId) {
      websocketService.joinRoom(auctionId, userId)
      hasJoinedRef.current = true
    }
  }, [auctionId, userId])

  const leaveRoom = useCallback(() => {
    if (auctionId && userId) {
      websocketService.leaveRoom(auctionId, userId)
      hasJoinedRef.current = false
    }
  }, [auctionId, userId])

  const submitBid = useCallback(
    (price: number) => {
      if (auctionId && userId) {
        return websocketService.submitBid(auctionId, userId, price)
      }
      return false
    },
    [auctionId, userId]
  )

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      if (auctionId && userId && hasJoinedRef.current) {
        websocketService.leaveRoom(auctionId, userId)
      }
      if (autoConnect) {
        websocketService.disconnect()
      }
    }
  }, [autoConnect, connect, auctionId, userId])

  useEffect(() => {
    if (auctionId && userId && autoConnect) {
      joinRoom()
    }
  }, [auctionId, userId, autoConnect, joinRoom])

  return {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    submitBid,
  }
}
