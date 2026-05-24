import { io, Socket } from 'socket.io-client';
import { useAuctionRoomStore } from '../store/useAuctionRoomStore';
import { useNotificationStore } from '../store/useNotificationStore';
import type { 
  WebSocketMessage, 
  JoinRoomPayload, 
  BidPayload,
  PriceUpdatePayload,
  RankingUpdatePayload,
  CountdownTickPayload,
  AuctionEndPayload
} from '@live-auction/shared';

const WS_URL = import.meta.env.VITE_WS_URL || '/ws';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentAuctionId: number | null = null;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const store = useAuctionRoomStore.getState();
    store.setConnectionStatus('connecting');

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      store.setConnectionStatus('connected');
      
      if (this.currentAuctionId) {
        this.reconnectAttempts;
      }
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      store.setConnectionStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      store.setConnectionStatus('error');
      this.reconnectAttempts++;
    });

    this.setupMessageHandlers();
  }

  private setupMessageHandlers() {
    if (!this.socket) return;

    const auctionStore = useAuctionRoomStore.getState();
    const notificationStore = useNotificationStore.getState();

    this.socket.on('PRICE_UPDATE', (message: WebSocketMessage<PriceUpdatePayload>) => {
      auctionStore.updatePrice(message.payload.currentPrice);
    });

    this.socket.on('RANKING_UPDATE', (message: WebSocketMessage<RankingUpdatePayload>) => {
      auctionStore.updateRankings(message.payload.rankings);
    });

    this.socket.on('COUNTDOWN_TICK', (message: WebSocketMessage<CountdownTickPayload>) => {
      auctionStore.setRemainingTime(message.payload.remainingMs);
    });

    this.socket.on('AUCTION_EXTENDED', () => {
      notificationStore.addNotification({
        type: 'warning',
        message: '竞拍时间已延长！',
        duration: 3000,
      });
    });

    this.socket.on('AUCTION_ENDED', (message: WebSocketMessage<AuctionEndPayload>) => {
      notificationStore.addNotification({
        type: 'info',
        message: `竞拍结束！最终成交价: ¥${message.payload.finalPrice}`,
        duration: 5000,
      });
    });

    this.socket.on('BID_SUCCESS', () => {
      notificationStore.addNotification({
        type: 'success',
        message: '出价成功！',
        duration: 2000,
      });
    });

    this.socket.on('BID_FAILED', (message: WebSocketMessage<{ reason: string }>) => {
      notificationStore.addNotification({
        type: 'error',
        message: message.payload.reason,
        duration: 3000,
      });
    });
  }

  joinRoom(auctionId: number, userId: number) {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.currentAuctionId = auctionId;
    const payload: JoinRoomPayload = { auctionId, userId };
    this.socket.emit('JOIN_ROOM', payload);
  }

  leaveRoom(auctionId: number, userId: number) {
    if (!this.socket?.connected) return;

    this.socket.emit('LEAVE_ROOM', { auctionId, userId });
    this.currentAuctionId = null;
  }

  submitBid(auctionId: number, userId: number, price: number) {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    const payload: BidPayload = { auctionId, userId, price };
    this.socket.emit('SUBMIT_BID', payload);
    return true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();
