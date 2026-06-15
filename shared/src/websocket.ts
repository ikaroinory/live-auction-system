export type WebSocketMessageType =
  | 'JOIN_ROOM'
  | 'LEAVE_ROOM'
  | 'SUBMIT_BID'
  | 'BID_SUCCESS'
  | 'BID_FAILED'
  | 'PRICE_UPDATE'
  | 'RANKING_UPDATE'
  | 'COUNTDOWN_TICK'
  | 'AUCTION_EXTENDED'
  | 'AUCTION_ENDED'
  | 'AUCTION_CANCELLED'
  | 'PING'
  | 'PONG'
  | 'EXPLAINING_UPDATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_STATUS_CHANGED';

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: number;
}

export interface JoinRoomPayload {
  auctionId: string;
  userId: string;
}

export interface BidPayload {
  auctionId: string;
  userId: string;
  price: number;
}

export interface PriceUpdatePayload {
  auctionId: string;
  currentPrice: number;
  bidderId: string;
  bidderName: string;
  bidCount: number;
}

export interface RankingUpdatePayload {
  auctionId: string;
  rankings: Array<{
    userId: string;
    username?: string;
    phone?: string;
    price: number;
    rank: number;
  }>;
}

export interface CountdownTickPayload {
  auctionId: string;
  remainingMs: number;
}

export interface AuctionEndPayload {
  auctionId: string;
  finalPrice: number;
  winnerId: string;
  winnerName: string;
}

export interface BidSuccessPayload {
  auctionId: string;
  userId: string;
  price: number;
  username?: string;
}

export interface BidFailedPayload {
  auctionId: string;
  userId: string;
  reason: string;
}

export interface AuctionExtendedPayload {
  auctionId: string;
  newEndTime: string;
}

export interface ExplainingUpdatePayload {
  roomId: string;
  productId: string | null;
}

export interface ProductUpdatePayload {
  roomId: string;
  productId: string;
  auctionStatus: string;
}

export interface ProductStatusChangedPayload {
  productId: string;
  creatorId: string;
  status: string;
}
