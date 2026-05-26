import { useState } from 'react';
import type { LiveRoomWithStreamer } from '@live-auction/shared';
import { VideoPlayer } from '../../LiveRoom/components/VideoPlayer';
import { FloatTag } from '@/components/ui';
import clsx from 'clsx';
import styles from './styles.module.scss';

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
      className={ styles.main }
      onClick={ handleClick }
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <VideoPlayer />

      <div className={ styles.container }>
        <FloatTag>点击进入直播间</FloatTag>

        <div className={ styles.informationContainer }>
          <div className={ clsx(styles.informationContainerItem, styles.labelContainer) }>
            <div className={ clsx(styles.label, styles.livingLabel) }>直播中</div>
            { liveRoom.isFollowed && (
              <div className={ clsx(styles.label, styles.followedLabel) }>我的关注</div>
            ) }
          </div>
          <div className={ clsx(styles.informationContainerItem, styles.liveRoomTitle)}>@{ liveRoom.streamer.nickname }</div>
          <div className={ clsx(styles.informationContainerItem, styles.liveRoomDescription)}>{ liveRoom.description }</div>
        </div>
      </div>
    </div>
  );
};
