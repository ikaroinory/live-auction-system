export interface Auction {
  id: number;
  sellerId: number;
  title: string;
  description: string;
  images: string[];
  startPrice: number;
  minIncrement: number;
  maxPrice?: number;
  durationSeconds: number;
  autoExtendSeconds: number;
  status: 0 | 1 | 2 | 3;
  startTime?: string;
  endTime?: string;
  finalPrice?: number;
  winnerId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionFormData {
  title: string;
  description: string;
  images: string[];
  startPrice: number;
  minIncrement: number;
  maxPrice?: number;
  durationSeconds: number;
  autoExtendSeconds: number;
}

export interface RuleConfig {
  startPrice: number;
  minIncrement: number;
  maxPrice?: number;
  durationSeconds: number;
  autoExtendSeconds: number;
  maxBidsPerUser?: number;
  enableAutoExtend: boolean;
}
