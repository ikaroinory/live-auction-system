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
  | 'PONG';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
  timestamp: number;
}

export interface JoinRoomPayload {
  auctionId: number;
  userId: number;
}

export interface BidPayload {
  auctionId: number;
  userId: number;
  price: number;
}

export interface PriceUpdatePayload {
  auctionId: number;
  currentPrice: number;
  bidderId: number;
  bidderName: string;
}

export interface RankingUpdatePayload {
  auctionId: number;
  rankings: Array<{
    userId: number;
    username: string;
    price: number;
    rank: number;
  }>;
}

export interface CountdownTickPayload {
  auctionId: number;
  remainingMs: number;
}

export interface AuctionEndPayload {
  auctionId: number;
  finalPrice: number;
  winnerId: number;
  winnerName: string;
}
