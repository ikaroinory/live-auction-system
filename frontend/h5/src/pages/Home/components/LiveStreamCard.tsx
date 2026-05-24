import { useState } from 'react';
import type { AuctionWithSeller } from '@live-auction/shared';
import { VideoPlayer } from '../../LiveRoom/components/VideoPlayer';
import './LiveStreamCard.scss';

interface LiveStreamCardProps {
  auction: AuctionWithSeller;
  isActive: boolean;
  onEnterLiveRoom: () => void;
}

export const LiveStreamCard = ({
  auction,
  isActive,
  onEnterLiveRoom,
}: LiveStreamCardProps) => {
  return (
    <div className={`live-stream-card ${isActive ? 'active' : ''}`}>
      <div className="video-container">
        <VideoPlayer />

        {/* 底部信息区域 */}
        <div className="video-overlay">
          <div className="auction-info">
            <div className="auction-header">
              <h2 className="auction-title">{auction.title}</h2>
            </div>

            <p className="auction-description">
              {auction.description || '精品好物，限时竞拍'}
            </p>

            <div className="auction-details">
              <div className="detail-item">
                <span className="detail-label">当前价格</span>
                <span className="detail-value price">¥{auction.startPrice.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">加价</span>
                <span className="detail-value">¥{auction.minIncrement.toFixed(2)}</span>
              </div>
              {auction.maxPrice && (
                <div className="detail-item">
                  <span className="detail-label">封顶</span>
                  <span className="detail-value">¥{auction.maxPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
