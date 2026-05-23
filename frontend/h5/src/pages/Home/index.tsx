import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd-mobile';
import { BottomNav } from '../../components/BottomNav';
import { LiveStreamCard } from './components/LiveStreamCard';
import type { Auction } from '../../types/auction';
import './Home.css';

interface HomeProps {
  auctions?: Auction[];
  loading?: boolean;
}

export const Home = ({ auctions = [], loading = false }: HomeProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeAuctions = auctions.filter(a => a.status === 1);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && !isTransitioning) {
      setCurrentIndex((prev) => {
        const next = Math.min(prev + 1, activeAuctions.length - 1);
        return next;
      });
      setIsTransitioning(true);
    }
    
    if (isDownSwipe && !isTransitioning) {
      setCurrentIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        return next;
      });
      setIsTransitioning(true);
    }
  }, [touchStart, touchEnd, isTransitioning, activeAuctions.length]);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const currentAuction = activeAuctions[currentIndex];

  const handleEnterLiveRoom = () => {
    if (currentAuction) {
      navigate(`/live/${currentAuction.id}`);
    }
  };

  const handleViewDetails = () => {
    if (currentAuction) {
      navigate(`/auction/${currentAuction.id}`);
    }
  };

  if (loading) {
    return (
      <div className="home-page page-container">
        <div className="loading-container">
          <span className="loading-text">加载中...</span>
        </div>
      </div>
    );
  }

  if (activeAuctions.length === 0) {
    return (
      <div className="home-page page-container">
        <div className="empty-container">
          <Empty 
            description="暂无直播中的竞拍" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="home-page page-container" ref={containerRef}>
      <div 
        className="live-streams-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="live-streams-wrapper"
          style={{
            transform: `translateY(${-currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.3s ease-out' : 'none'
          }}
        >
          {activeAuctions.map((auction, index) => (
            <div key={auction.id} className="live-stream-item">
              <LiveStreamCard
                auction={auction}
                isActive={index === currentIndex}
                onEnterLiveRoom={handleEnterLiveRoom}
                onViewDetails={handleViewDetails}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="page-indicator">
        <span className="current-page">{currentIndex + 1}</span>
        <span className="separator">/</span>
        <span className="total-pages">{activeAuctions.length}</span>
      </div>

      <div className="swipe-hint">
        <span className="hint-text">上滑查看更多直播</span>
      </div>

      <BottomNav />
    </div>
  );
};
