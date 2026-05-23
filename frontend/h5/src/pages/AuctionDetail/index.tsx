import { useParams, useNavigate } from 'react-router-dom';
import { NavBar, Button, Card, Empty } from 'antd-mobile';
import { useAuctionRoomStore } from '../../store/useAuctionRoomStore';
import './AuctionDetail.scss';

export const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAuction } = useAuctionRoomStore();

  if (!currentAuction) {
    return (
      <div className="auction-detail-page page-container">
        <NavBar onBack={() => navigate(-1)}>竞拍详情</NavBar>
        <div className="loading-container">
          <Empty description="竞拍不存在" />
        </div>
      </div>
    );
  }

  return (
    <div className="auction-detail-page page-container">
      <NavBar onBack={() => navigate(-1)}>竞拍详情</NavBar>
      
      <div className="detail-content">
        <Card title="商品信息">
          <div className="info-item">
            <span className="label">商品名称</span>
            <span className="value">{currentAuction.title}</span>
          </div>
          <div className="info-item">
            <span className="label">商品描述</span>
            <span className="value">{currentAuction.description}</span>
          </div>
        </Card>

        <Card title="竞拍规则">
          <div className="info-item">
            <span className="label">起拍价</span>
            <span className="value">¥{currentAuction.startPrice.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <span className="label">加价幅度</span>
            <span className="value">¥{currentAuction.minIncrement.toFixed(2)}</span>
          </div>
          {currentAuction.maxPrice && (
            <div className="info-item">
              <span className="label">封顶价</span>
              <span className="value">¥{currentAuction.maxPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="info-item">
            <span className="label">竞拍时长</span>
            <span className="value">{currentAuction.durationSeconds}秒</span>
          </div>
          <div className="info-item">
            <span className="label">延时机制</span>
            <span className="value">自动延长{currentAuction.autoExtendSeconds}秒</span>
          </div>
        </Card>

        <div className="action-section safe-area-bottom">
          <Button 
            block 
            color="primary" 
            size="large"
            onClick={() => navigate(`/live/${id}`)}
          >
            进入竞拍
          </Button>
        </div>
      </div>
    </div>
  );
};
