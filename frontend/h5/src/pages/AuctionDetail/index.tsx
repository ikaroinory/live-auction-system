import { useParams, useNavigate, useEffect, useState } from 'react';
import { NavBar, Button, Card, Empty, Loading } from 'antd-mobile';
import { auctionAPI } from '../../services/api';
import type { AuctionDetail as AuctionDetailType } from '@live-auction/shared';
import './AuctionDetail.scss';

export const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<AuctionDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadAuction = async () => {
        try {
          const data = await auctionAPI.getAuctionDetail(id);
          setAuction(data);
        } catch (error) {
          console.error('Failed to load auction detail:', error);
        } finally {
          setLoading(false);
        }
      };
      loadAuction();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="auction-detail-page page-container">
        <NavBar onBack={() => navigate(-1)}>竞拍详情</NavBar>
        <div className="loading-container">
          <Loading />
        </div>
      </div>
    );
  }

  if (!auction) {
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
            <span className="value">{auction.title}</span>
          </div>
          <div className="info-item">
            <span className="label">商品描述</span>
            <span className="value">{auction.description}</span>
          </div>
        </Card>

        <Card title="竞拍规则">
          <div className="info-item">
            <span className="label">起拍价</span>
            <span className="value">¥{auction.startPrice.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <span className="label">加价幅度</span>
            <span className="value">¥{auction.minIncrement.toFixed(2)}</span>
          </div>
          {auction.maxPrice && (
            <div className="info-item">
              <span className="label">封顶价</span>
              <span className="value">¥{auction.maxPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="info-item">
            <span className="label">竞拍时长</span>
            <span className="value">{auction.durationSeconds}秒</span>
          </div>
          <div className="info-item">
            <span className="label">延时机制</span>
            <span className="value">自动延长{auction.autoExtendSeconds}秒</span>
          </div>
        </Card>

        <div className="action-section safe-area-bottom">
          <Button block color="primary" size="large" onClick={() => navigate(`/live/${id}`)}>
            进入竞拍
          </Button>
        </div>
      </div>
    </div>
  );
};
