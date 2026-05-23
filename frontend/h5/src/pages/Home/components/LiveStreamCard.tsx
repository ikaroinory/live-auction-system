import { useState, useEffect } from 'react';
import { Button } from 'antd-mobile';
import type { Auction } from '../../../types/auction';
import { VideoPlayer } from '../../LiveRoom/components/VideoPlayer';
import './LiveStreamCard.css';

interface LiveStreamCardProps {
  auction: Auction;
  isActive: boolean;
  onEnterLiveRoom: () => void;
  onViewDetails: () => void;
}

export const LiveStreamCard = ({
  auction,
  isActive,
  onEnterLiveRoom,
  onViewDetails,
}: LiveStreamCardProps) => {
  const [viewerCount] = useState(Math.floor(Math.random() * 10000) + 1000);
  const [isLive] = useState(true);

  return (
    <div className={`live-stream-card ${isActive ? 'active' : ''}`}>
      <div className="video-container">
        <VideoPlayer />
        
        <div className="live-badge">
          <span className="live-dot"></span>
          <span className="live-text">LIVE</span>
        </div>

        <div className="viewer-count">
          👁 {viewerCount.toLocaleString()}
        </div>

        <div className="video-actions">
          <div className="action-button" onClick={onViewDetails}>
            <span className="action-icon">📋</span>
            <span className="action-label">详情</span>
          </div>
          <div className="action-button" onClick={onEnterLiveRoom}>
            <span className="action-icon">🎯</span>
            <span className="action-label">参与</span>
          </div>
        </div>
      </div>

      <div className="auction-info">
        <div className="auction-header">
          <h2 className="auction-title">{auction.title}</h2>
          {isLive && (
            <span className="auction-status">
              🔴 直播中
            </span>
          )}
        </div>

        <p className="auction-description">
          {auction.description || '暂无描述'}
        </p>

        <div className="auction-details">
          <div className="detail-item">
            <span className="detail-label">当前价</span>
            <span className="detail-value price">¥{auction.startPrice.toFixed(2)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">加价幅度</span>
            <span className="detail-value">¥{auction.minIncrement.toFixed(2)}</span>
          </div>
          {auction.maxPrice && (
            <div className="detail-item">
              <span className="detail-label">封顶价</span>
              <span className="detail-value">¥{auction.maxPrice.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <Button 
            color="primary" 
            size="large" 
            block
            onClick={onEnterLiveRoom}
          >
            进入直播间参与竞拍
          </Button>
          <Button 
            color="default" 
            size="large" 
            block
            onClick={onViewDetails}
          >
            查看详情
          </Button>
        </div>
      </div>
    </div>
  );
};
