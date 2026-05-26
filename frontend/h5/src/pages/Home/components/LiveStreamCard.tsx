import { useState } from 'react';
import type { LiveRoomWithStreamer } from '@live-auction/shared';
import { VideoPlayer } from '../../LiveRoom/components/VideoPlayer';
import { FloatTag } from '@/components/ui';
import './LiveStreamCard.scss';

interface LiveStreamCardProps {
  liveRoom: LiveRoomWithStreamer;
  isActive: boolean;
  onEnterLiveRoom: () => void;
}

export const LiveStreamCard = ({
  liveRoom,
  isActive,
  onEnterLiveRoom,
}: LiveStreamCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (isActive) {
      onEnterLiveRoom();
    }
  };

  return (
    <div 
      className={`live-stream-card ${isActive ? 'active' : ''} ${isPressed ? 'pressed' : ''}`}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div className="video-container">
        <VideoPlayer />

        {/* 底部信息区域 */}
        <div className="video-overlay">
          <div className="auction-info">
            <FloatTag>点击进入直播间</FloatTag>

            <div style={{ width: '100%' }}>
              <div className="auction-header">
                <h2 className="auction-title">{liveRoom.title}</h2>
              </div>

              <div className="stream-indicator">
                <div className="stream-dot"></div>
                <span>正在直播</span>
              </div>

              <p className="auction-description">
                {liveRoom.description || '精彩直播，不容错过'}
              </p>

              <div className="auction-details">
                <div className="detail-item">
                  <span className="detail-label">主播</span>
                  <span className="detail-value">{liveRoom.streamer.nickname || liveRoom.streamer.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">关注</span>
                  <span className="detail-value">{liveRoom._count.followers}人</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">商品</span>
                  <span className="detail-value">{liveRoom._count.auctions}件</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
