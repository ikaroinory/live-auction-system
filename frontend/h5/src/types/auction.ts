export interface Auction {
  id: number;
  sellerId: number;
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
  winnerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  userId: number;
  price: number;
  createdAt: string;
}

export interface RankingItem {
  userId: number;
  username: string;
  price: number;
  rank: number;
  isCurrentUser?: boolean;
}
