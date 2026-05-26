import { useState } from 'react';
import type { LiveRoomWithStreamer } from '@live-auction/shared';
import { VideoPlayer } from '../../LiveRoom/components/VideoPlayer';
import { FloatTag } from '@/components/ui';
import './LiveStreamCard.scss';
import styles from './styles.module.scss'

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
              <div style={{ display: 'flex' }}>
                <div className={ styles.label }>直播中</div>
                { liveRoom.isFollowed && (
                  <div className={ styles.followedLabel }>我的关注</div>
                ) }
              </div>
              <div className="auction-title">@{ liveRoom.streamer.nickname }</div>
              <div className="auction-description">{ liveRoom.description }</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
