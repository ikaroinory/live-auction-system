import type { Bid } from '../../../types/auction.d';
import { formatPrice, formatDate } from '../../../utils/format';

interface BidHistoryProps {
  bids: Bid[];
}

export const BidHistory = ({ bids }: BidHistoryProps) => {
  return (
    <div className="bid-history">
      <h3>出价历史</h3>
      <div className="bid-list">
        {bids.length === 0 ? (
          <div className="empty">暂无出价记录</div>
        ) : (
          bids.map((bid, index) => (
            <div key={bid.id} className="bid-item">
              <div className="rank">#{index + 1}</div>
              <div className="info">
                <div className="price">{formatPrice(bid.price)}</div>
                <div className="time">{formatDate(bid.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
