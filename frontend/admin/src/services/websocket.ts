import { io, Socket } from 'socket.io-client'
import type { WebSocketMessage, AuctionEndPayload } from '@live-auction/shared'

const WS_URL = ''

class WebSocketService {
  private socket: Socket | null = null
  private isConnected = false
  private onAuctionEnd: ((payload: AuctionEndPayload) => void) | null = null

  connect() {
    if (this.socket) {
      this.disconnect()
    }

    console.log('[Admin WebSocket] Connecting...')
    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      pingInterval: 20000,
      pingTimeout: 10000,
    })

    this.socket.on('connect', () => {
      console.log('[Admin WebSocket] Connected')
      this.isConnected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Admin WebSocket] Disconnected:', reason)
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('[Admin WebSocket] Connection error:', error)
      this.isConnected = false
    })

    this.setupMessageHandlers()
  }

  private setupMessageHandlers() {
    if (!this.socket) return

    this.socket.off('AUCTION_ENDED')
    this.socket.on('AUCTION_ENDED', (message: WebSocketMessage<AuctionEndPayload>) => {
      console.log('[Admin WebSocket] Auction ended:', message.payload)
      if (this.onAuctionEnd) {
        this.onAuctionEnd(message.payload)
      }
    })
  }

  joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.error('[Admin WebSocket] Not connected')
      return
    }
    this.socket.emit('JOIN_ROOM', { auctionId: roomId, userId: '' })
  }

  setOnAuctionEnd(callback: (payload: AuctionEndPayload) => void) {
    this.onAuctionEnd = callback
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
  }

  isSocketConnected(): boolean {
    return this.isConnected && !!this.socket?.connected
  }
}

export const websocketService = new WebSocketService()
