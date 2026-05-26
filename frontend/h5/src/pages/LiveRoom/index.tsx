import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
import { ChevronLeftIcon, HistoryIcon, ShareIcon, LikeIcon, GiftIcon, CloseIcon } from '../../components/ui/icons';
import { VideoPlayer } from './components/VideoPlayer';
import { CurrentPrice } from './components/CurrentPrice';
import { BidHistory } from './components/BidHistory';
import { formatPrice } from '../../utils/format';
import './LiveRoom.scss';
import styles from './styles.module.scss'
import clsx from 'clsx';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'message' | 'join';
}

interface AnimationItem {
  id: string;
  type: 'like' | 'gift';
  content: string;
  left: number;
}

export const LiveRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auctionId = Number(id);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [animations, setAnimations] = useState<AnimationItem[]>([]);
  const [onlineCount] = useState(40000);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
    Toast.show(isFollowed ? '已取消关注' : '关注成功');
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !user) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name || '我',
      content: chatInput,
      type: 'message',
    };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const showEffects = (type: 'like' | 'gift') => {
    const newAnimation: AnimationItem = {
      id: Date.now().toString(),
      type: type,
      content: type === 'like' ? '❤️' : '🎉',
      left: Math.random() * 60 + 20,
    };
    setAnimations(prev => [...prev, newAnimation]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== newAnimation.id));
    }, 1000);
  };

  const handleShare = () => {
    Toast.show('分享链接已复制');
  };

  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      { id: '1', userId: '1', userName: '梦尘', content: '5999元苹果17 256G', type: 'message' },
      { id: '2', userId: '2', userName: '幸福是什么', content: '希望一发入魂，中个手机', type: 'message' },
      { id: '3', userId: '3', userName: '朱Z', content: '5999元苹果17 256G', type: 'message' },
      { id: '4', userId: '4', userName: 'Sum_41', content: '关注了主播', type: 'join' },
      { id: '5', userId: '5', userName: '菠萝睡不醒', content: '5999元苹果17 256G', type: 'message' },
    ];
    setChatMessages(mockMessages);

    const interval = setInterval(() => {
      const randomUsers = ['我勒个恋狗啊', '恨', 'Ninety__n', '我。。'];
      const randomContents = [
        '这个多少钱',
        '主播好厉害',
        '冲冲冲',
        '666',
        '太牛了',
        '想要这个',
      ];
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: Math.random().toString(),
        userName: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        content: randomContents[Math.floor(Math.random() * randomContents.length)],
        type: Math.random() > 0.9 ? 'join' : 'message',
      };
      setChatMessages(prev => [...prev.slice(-20), newMessage]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
        </div>

        <div className={ styles.headerBar }>
          <div className={ styles.info }>
            <div className="host-avatar">🎙️</div>
            <div className="host-info">
              <div className="host-name">骚男 😎</div>
              <div className="host-stats">142.9万本场点赞</div>
            </div>
            <button className={`follow-button ${isFollowed ? 'followed' : ''}`} onClick={handleFollow}>
              {isFollowed ? '已关注' : '关注'}
            </button>
          </div>

          <BubbleButton onClick={handleGoBack}><CloseIcon size={20} /></BubbleButton>
        </div>

        <div className="chat-section">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={msg.type === 'join' ? 'chat-join' : 'chat-message'}>
              {msg.type === 'join' ? (
                <span className="chat-join-text">
                  <span className="chat-name">{msg.userName}</span> 加入了直播间
                </span>
              ) : (
                <>
                  <div className="chat-avatar">
                    {msg.userName.charAt(0)}
                  </div>
                  <div className="chat-content">
                    <span className="chat-name">{msg.userName}</span>
                    <span className="chat-text">{msg.content}</span>
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="ranking-section">
          <RankingList rankings={rankings} />
        </div>

        <div className="bid-section safe-area-bottom">
          <div className={ styles.actionBar }>
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="说点什么..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              />
            </div>
            <BubbleButton className={ clsx(styles.actionButton, styles.like) } onClick={ () => showEffects('like') }><LikeIcon size={20} /></BubbleButton>
            <BubbleButton className={ clsx(styles.actionButton, styles.gift) } onClick={ () => showEffects('gift') }><GiftIcon size={20} /></BubbleButton>
            <BubbleButton className={ clsx(styles.actionButton, styles.history) } onClick={ () => setShowBidHistory(!showBidHistory) }><HistoryIcon size={20} /></BubbleButton>
            <BubbleButton className={ clsx(styles.actionButton, styles.share) } onClick={handleShare}><ShareIcon size={18} /></BubbleButton>
          </div>
        </div>


        <div className="gift-animation-container">
          {animations.map((anim) => (
            <div
              key={anim.id}
              className={anim.type === 'like' ? 'like-animation' : 'gift-animation'}
              style={{ left: `${anim.left}%`, bottom: '180px' }}
            >
              {anim.content}
            </div>
          ))}
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
