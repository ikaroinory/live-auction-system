import { useState } from 'react';
import type { Auction } from '../../../types/auction';
import { VideoPlayer } from '../../LiveRoom/components/VideoPlayer';
import './LiveStreamCard.scss';

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

  return (
    <div className={`live-stream-card ${isActive ? 'active' : ''}`}>
      <div className="video-container">
        <VideoPlayer />

        <div className="viewer-count">
          <svg className="viewer-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {viewerCount.toLocaleString()}
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
      </div>
    </div>
  );
};
