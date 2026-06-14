import { io, Socket } from 'socket.io-client'
import { useAuctionRoomStore } from '../store/useAuctionRoomStore'
import { useNotificationStore } from '../store/useNotificationStore'
import type {
  WebSocketMessage,
  JoinRoomPayload,
  BidPayload,
  PriceUpdatePayload,
  RankingUpdatePayload,
  CountdownTickPayload,
  AuctionEndPayload,
  ExplainingUpdatePayload,
  ProductUpdatePayload,
} from '@live-auction/shared'

const WS_URL = ''
const HEARTBEAT_INTERVAL = 30000
const HEARTBEAT_TIMEOUT = 10000

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private currentAuctionId: string | null = null
  private currentRoomId: string | null = null
  private onExplainingUpdate: ((payload: ExplainingUpdatePayload) => void) | null = null
  private onProductUpdate: ((payload: ProductUpdatePayload) => void) | null = null
  private isConnected = false
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  private lastHeartbeatTime = 0

  connect() {
    if (this.socket) {
      this.disconnect()
    }

    const store = useAuctionRoomStore.getState()
    store.setConnectionStatus('connecting')
    this.isConnected = false
    this.lastHeartbeatTime = Date.now()

    console.log(`[WebSocket] Connecting to ${WS_URL || 'default path'}`)
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      pingInterval: 20000,
      pingTimeout: 10000,
    })

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected')
      this.reconnectAttempts = 0
      this.isConnected = true
      this.lastHeartbeatTime = Date.now()
      store.setConnectionStatus('connected')

      if (this.currentAuctionId) {
        const payload: JoinRoomPayload = { auctionId: this.currentAuctionId, userId: '' }
        this.socket?.emit('JOIN_ROOM', payload)
      }

      if (this.currentRoomId) {
        this.socket?.emit('JOIN_ROOM', { auctionId: this.currentRoomId, userId: '' })
      }

      this.startHeartbeat()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason)
      this.isConnected = false
      this.stopHeartbeat()
      store.setConnectionStatus('disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error)
      this.isConnected = false
      this.stopHeartbeat()
      store.setConnectionStatus('error')
      this.reconnectAttempts++
    })

    this.setupMessageHandlers()
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.socket) {
        console.debug('[WebSocket] Sending heartbeat')
        this.socket.emit('PING')
        
        if (this.heartbeatTimeoutTimer) {
          clearTimeout(this.heartbeatTimeoutTimer)
        }
        
        this.heartbeatTimeoutTimer = setTimeout(() => {
          console.warn('[WebSocket] Heartbeat timeout, no PONG received')
        }, HEARTBEAT_TIMEOUT)
      }
    }, HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  private setupMessageHandlers() {
    if (!this.socket) return

    const auctionStore = useAuctionRoomStore.getState()
    const notificationStore = useNotificationStore.getState()

    this.socket.off('PRICE_UPDATE')
    this.socket.on('PRICE_UPDATE', (message: WebSocketMessage<PriceUpdatePayload>) => {
      auctionStore.updatePrice(message.payload.currentPrice)
    })

    this.socket.off('RANKING_UPDATE')
    this.socket.on('RANKING_UPDATE', (message: WebSocketMessage<RankingUpdatePayload>) => {
      auctionStore.updateRankings(message.payload.rankings)
    })

    this.socket.off('COUNTDOWN_TICK')
    this.socket.on('COUNTDOWN_TICK', (message: WebSocketMessage<CountdownTickPayload>) => {
      auctionStore.setRemainingTime(message.payload.remainingMs)
    })

    this.socket.off('AUCTION_EXTENDED')
    this.socket.on('AUCTION_EXTENDED', () => {
      notificationStore.addNotification({
        type: 'warning',
        message: '竞拍时间已延长！',
        duration: 3000,
      })
    })

    this.socket.off('AUCTION_ENDED')
    this.socket.on('AUCTION_ENDED', (message: WebSocketMessage<AuctionEndPayload>) => {
      notificationStore.addNotification({
        type: 'info',
        message: `竞拍结束！最终成交价: ¥${message.payload.finalPrice}`,
        duration: 5000,
      })
    })

    this.socket.off('BID_SUCCESS')
    this.socket.on('BID_SUCCESS', () => {
      notificationStore.addNotification({
        type: 'success',
        message: '出价成功！',
        duration: 2000,
      })
    })

    this.socket.off('BID_FAILED')
    this.socket.on('BID_FAILED', (message: WebSocketMessage<{ reason: string }>) => {
      notificationStore.addNotification({
        type: 'error',
        message: message.payload.reason,
        duration: 3000,
      })
    })

    this.socket.off('EXPLAINING_UPDATE')
    this.socket.on('EXPLAINING_UPDATE', (message: WebSocketMessage<ExplainingUpdatePayload>) => {
      if (this.onExplainingUpdate) {
        this.onExplainingUpdate(message.payload)
      }
    })

    this.socket.off('PRODUCT_UPDATE')
    this.socket.on('PRODUCT_UPDATE', (message: WebSocketMessage<ProductUpdatePayload>) => {
      if (this.onProductUpdate) {
        this.onProductUpdate(message.payload)
      }
    })

    this.socket.off('PONG')
    this.socket.on('PONG', () => {
      this.lastHeartbeatTime = Date.now()
      console.debug('[WebSocket] Received PONG')
      if (this.heartbeatTimeoutTimer) {
        clearTimeout(this.heartbeatTimeoutTimer)
        this.heartbeatTimeoutTimer = null
      }
    })
  }

  joinRoom(auctionId: string, userId: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[WebSocket] Not connected')
      return
    }

    this.currentAuctionId = auctionId
    const payload: JoinRoomPayload = { auctionId, userId }
    this.socket.emit('JOIN_ROOM', payload)
  }

  joinLiveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[WebSocket] Not connected')
      return
    }

    this.currentRoomId = roomId
    this.socket.emit('JOIN_ROOM', { auctionId: roomId, userId: '' })
  }

  leaveRoom(auctionId: string, userId: string) {
    if (!this.socket || !this.isConnected) return

    this.socket.emit('LEAVE_ROOM', { auctionId, userId })
    this.currentAuctionId = null
  }

  leaveLiveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return

    this.socket.emit('LEAVE_ROOM', { auctionId: roomId, userId: '' })
    this.currentRoomId = null
  }

  setOnExplainingUpdate(callback: (payload: ExplainingUpdatePayload) => void) {
    this.onExplainingUpdate = callback
  }

  setOnProductUpdate(callback: (payload: ProductUpdatePayload) => void) {
    this.onProductUpdate = callback
  }

  submitBid(auctionId: string, userId: string, price: number) {
    if (!this.socket || !this.isConnected) {
      console.error('[WebSocket] Not connected')
      return false
    }

    const payload: BidPayload = { auctionId, userId, price }
    this.socket.emit('SUBMIT_BID', payload)
    return true
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.currentAuctionId = null
    this.currentRoomId = null
  }

  isSocketConnected(): boolean {
    return this.isConnected && !!this.socket?.connected
  }
}

export const websocketService = new WebSocketService()
