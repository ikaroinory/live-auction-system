import { UserSlim } from './user';

export interface Auction {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  images: string[];
  startPrice: number;
  minIncrement: number;
  maxPrice: number | null;
  durationSeconds: number;
  autoExtendSeconds: number;
  status: 0 | 1 | 2 | 3;
  startTime: string | null;
  endTime: string | null;
  finalPrice: number | null;
  winnerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionWithSeller extends Auction {
  seller: UserSlim;
  winner?: UserSlim;
  _count: { bids: number };
}

export interface AuctionDetail extends Auction {
  seller: UserSlim;
  winner?: UserSlim;
  bids: BidWithUser[];
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  price: number;
  createdAt: string;
}

export interface BidWithUser extends Bid {
  user: UserSlim;
}

export interface RankingItem {
  userId: string;
  username?: string;
  phone?: string;
  price: number;
  rank: number;
  isCurrentUser?: boolean;
}

export type AuctionStatus = 0 | 1 | 2 | 3; // 0:未开始 1:进行中 2:已结束 3:已取消

export interface CreateAuctionParams {
  title: string;
  description?: string;
  images?: string[];
  startPrice: number;
  minIncrement: number;
  maxPrice?: number;
  durationSeconds: number;
  autoExtendSeconds?: number;
}
