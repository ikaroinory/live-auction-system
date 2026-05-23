import { Card } from 'antd-mobile';
import type { Auction } from '../../types/auction';
import './AuctionCard.css';

interface AuctionCardProps {
  auction: Auction;
  onClick?: () => void;
}

export const AuctionCard = ({ auction, onClick }: AuctionCardProps) => {
  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '未开始';
      case 1: return '进行中';
      case 2: return '已结束';
      case 3: return '已取消';
      default: return '未知';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return '#909399';
      case 1: return '#67C23A';
      case 2: return '#E6A23C';
      case 3: return '#F56C6C';
      default: return '#909399';
    }
  };

  return (
    <div className="auction-card" onClick={onClick}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{auction.title}</span>
            <span 
              className="status-tag"
              style={{ color: getStatusColor(auction.status) }}
            >
              {getStatusText(auction.status)}
            </span>
          </div>
        }
      >
        <div className="auction-info">
          <div className="info-row">
            <span className="label">当前价</span>
            <span className="value price">¥{auction.startPrice.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span className="label">加价幅度</span>
            <span className="value">¥{auction.minIncrement.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
