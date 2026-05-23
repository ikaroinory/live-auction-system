import { useParams, useNavigate } from 'react-router-dom';
import { NavBar, Toast } from 'antd-mobile';
import { useAuctionRoomStore } from '../../store/useAuctionRoomStore';
import { useUserStore } from '../../store/useUserStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useCountdown } from '../../hooks/useCountdown';
import { useBidAnimation } from '../../hooks/useBidAnimation';
import { Countdown } from '../../components/Countdown';
import { RankingList } from '../../components/RankingList';
import { BidButton } from '../../components/BidButton';
import { ToastNotification } from '../../components/ToastNotification';
import { formatPrice } from '../../utils/format';
import './LiveRoom.css';

export const LiveRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auctionId = Number(id);

  const { user } = useUserStore();
  const { 
    currentAuction, 
    currentPrice, 
    rankings, 
    remainingMs,
    connectionStatus,
    isLeading,
    updatePrice,
  } = useAuctionRoomStore();

  const { submitBid } = useWebSocket({
    auctionId,
    userId: user?.id,
    autoConnect: true,
  });

  const { remainingMs: displayMs } = useCountdown(remainingMs);

  const { isAnimating, animationType, playSuccess, playFail } = useBidAnimation();

  const handleBid = () => {
    if (!user) {
      Toast.show('请先登录');
      navigate('/login');
      return;
    }

    if (!currentAuction) {
      Toast.show('竞拍信息加载中');
      return;
    }

    const nextPrice = currentPrice + currentAuction.minIncrement;
    const success = submitBid(nextPrice);

    if (success) {
      playSuccess();
      updatePrice(nextPrice);
      Toast.show(`出价 ${formatPrice(nextPrice)} 成功！`);
    } else {
      playFail();
      Toast.show('出价失败，请稍后重试');
    }
  };

  if (!currentAuction) {
    return (
      <div className="live-room-page page-container">
        <NavBar onBack={() => navigate(-1)}>加载中...</NavBar>
        <div className="loading-container">
          <div className="loading">正在加载竞拍信息...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-room-page page-container">
      <NavBar onBack={() => navigate(-1)}>{currentAuction.title}</NavBar>
      
      <div className="room-content">
        <div className="video-section">
          <div className="video-placeholder">
            <div className="video-overlay">
              <span>直播间</span>
            </div>
          </div>
        </div>

        <div className="auction-info-section">
          <div className="current-price">
            <span className="label">当前价格</span>
            <span className="price">{formatPrice(currentPrice)}</span>
          </div>

          <div className="countdown-section">
            <span className="label">剩余时间</span>
            <Countdown 
              remainingMs={displayMs} 
              onComplete={() => {
                Toast.show('竞拍已结束');
              }}
            />
          </div>

          {isLeading && (
            <div className="leading-indicator">
              🎉 您当前领先！
            </div>
          )}

          <div className="connection-status">
            <span className={`status-dot ${connectionStatus}`}></span>
            <span className="status-text">
              {connectionStatus === 'connected' ? '已连接' : 
               connectionStatus === 'connecting' ? '连接中...' : '未连接'}
            </span>
          </div>
        </div>

        <div className="ranking-section">
          <RankingList rankings={rankings} />
        </div>

        <div className="bid-section safe-area-bottom">
          <BidButton
            onClick={handleBid}
            nextPrice={currentPrice + currentAuction.minIncrement}
            disabled={connectionStatus !== 'connected' || remainingMs <= 0}
            isAnimating={isAnimating}
            animationType={animationType}
          />
        </div>
      </div>

      <ToastNotification />
    </div>
  );
};
