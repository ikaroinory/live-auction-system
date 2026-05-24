import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toast } from 'antd-mobile';
import { useAuctionRoomStore } from '../../store/useAuctionRoomStore';
import { useUserStore } from '../../store/useUserStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useCountdown } from '../../hooks/useCountdown';
import { useBidAnimation } from '../../hooks/useBidAnimation';
import { Countdown } from '../../components/Countdown';
import { RankingList } from '../../components/RankingList';
import { BidButton } from '../../components/BidButton';
import { ToastNotification } from '../../components/ToastNotification';
import { BubbleButton } from '../../components/ui';
import { ChevronLeftIcon, HistoryIcon } from '../../components/ui/icons';
import { VideoPlayer } from './components/VideoPlayer';
import { CurrentPrice } from './components/CurrentPrice';
import { BidHistory } from './components/BidHistory';
import { formatPrice } from '../../utils/format';
import './LiveRoom.scss';

export const LiveRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auctionId = Number(id);
  const [showBidHistory, setShowBidHistory] = useState(false);

  const { user } = useUserStore();
  const { 
    currentAuction, 
    currentPrice, 
    rankings, 
    remainingMs,
    connectionStatus,
    isLeading,
    updatePrice,
    bidHistory,
    addBidToHistory,
    setCurrentAuction,
    setBidHistory,
  } = useAuctionRoomStore();

  const { submitBid } = useWebSocket({
    auctionId,
    userId: user?.id,
    autoConnect: true,
  });

  const { remainingMs: displayMs } = useCountdown(remainingMs);

  const { isAnimating, animationType, playSuccess, playFail } = useBidAnimation();

  useEffect(() => {
    const mockAuction = {
      id: id || '1',
      sellerId: 'seller-1',
      title: '限量版潮玩手办',
      description: '全新限量版手办，全球仅1000件',
      images: [],
      startPrice: 0,
      minIncrement: 10,
      maxPrice: null,
      durationSeconds: 300,
      autoExtendSeconds: 15,
      status: 1,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 300000).toISOString(),
      finalPrice: null,
      winnerId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentAuction(mockAuction);
    
    const mockBids = [
      { id: '3', auctionId: id || '1', userId: 'user-3', price: 30, createdAt: new Date(Date.now() - 60000).toISOString() },
      { id: '2', auctionId: id || '1', userId: 'user-2', price: 20, createdAt: new Date(Date.now() - 120000).toISOString() },
      { id: '1', auctionId: id || '1', userId: 'user-1', price: 10, createdAt: new Date(Date.now() - 180000).toISOString() },
    ];
    setBidHistory(mockBids);
    
    updatePrice(30);
    useAuctionRoomStore.setState({ remainingMs: 300000 });
  }, [id, setCurrentAuction, setBidHistory, updatePrice]);

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
      
      const newBid = {
        id: Date.now().toString(),
        auctionId: id || '1',
        userId: user.id,
        price: nextPrice,
        createdAt: new Date().toISOString(),
      };
      addBidToHistory(newBid);
      
      Toast.show(`出价 ${formatPrice(nextPrice)} 成功！`);
    } else {
      playFail();
      Toast.show('出价失败，请稍后重试');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!currentAuction) {
    return (
      <div className="live-room-page">
        <div className="loading-container">
          <div className="loading">正在加载竞拍信息...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-room-page">
      <div className="room-content">
        <div className="video-section">
          <VideoPlayer />
          <div className="video-overlay-info">
            <h1 className="auction-title">{currentAuction.title}</h1>
          </div>
        </div>

        <div className="back-button-section">
          <BubbleButton onClick={handleGoBack}>
            <ChevronLeftIcon size={24} />
          </BubbleButton>
        </div>

        <div className="connection-status">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span className="status-text">
            {connectionStatus === 'connected' ? '已连接' : 
             connectionStatus === 'connecting' ? '连接中...' : '未连接'}
          </span>
        </div>

        <div className="ranking-section">
          <RankingList rankings={rankings} />
        </div>

        <div className="auction-info-section">
          <CurrentPrice price={currentPrice} />

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

        <div className="bid-history-section">
          <BubbleButton onClick={() => setShowBidHistory(!showBidHistory)}>
            <HistoryIcon size={24} />
          </BubbleButton>
        </div>
      </div>

      {showBidHistory && (
        <div className="bid-history-modal" onClick={() => setShowBidHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <BidHistory bids={bidHistory} />
            <button 
              className="close-modal"
              onClick={() => setShowBidHistory(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      <ToastNotification />
    </div>
  );
};
