import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { LiveRoom } from './pages/LiveRoom';
import { AuctionDetail } from './pages/AuctionDetail';
import { MeBids } from './pages/Me/MeBids';
import { MeOrders } from './pages/Me/MeOrders';
import Me from './pages/Me';
import { Login } from './pages/Login';
import { useUserStore } from './store/useUserStore';
import type { Auction } from './types/auction';

// 模拟竞拍数据
const mockAuctions: Auction[] = [
  {
    id: '1',
    sellerId: '1001',
    title: '全新 iPhone 15 Pro Max 256GB',
    description: '官方正品，原封未拆，支持全国联保，颜色为钛金属原色',
    images: [],
    startPrice: 0,
    minIncrement: 100,
    maxPrice: 9999,
    durationSeconds: 1800,
    autoExtendSeconds: 15,
    status: 1,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 1800000).toISOString(),
    finalPrice: null,
    winnerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    sellerId: '1002',
    title: '限量版潮玩盲盒套装',
    description: '包含5个热门系列盲盒，均为隐藏款，收藏价值极高',
    images: [],
    startPrice: 99,
    minIncrement: 10,
    maxPrice: 999,
    durationSeconds: 3600,
    autoExtendSeconds: 15,
    status: 1,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    finalPrice: null,
    winnerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    sellerId: '1003',
    title: '戴森 V15 吸尘器',
    description: '全新未拆封，激光探测，智能除尘，续航60分钟',
    images: [],
    startPrice: 500,
    minIncrement: 50,
    maxPrice: 4999,
    durationSeconds: 2700,
    autoExtendSeconds: 15,
    status: 1,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2700000).toISOString(),
    finalPrice: null,
    winnerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function App() {
  const { fetchUser, isLoading } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        加载中...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home auctions={mockAuctions} />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/live/:id" element={<LiveRoom />} />
        <Route path="/me/bids" element={<MeBids />} />
        <Route path="/me/orders" element={<MeOrders />} />
        <Route path="/me" element={<Me />} />
        <Route path="/profile" element={<Navigate to="/me" replace />} />
        <Route path="/my" element={<Navigate to="/me" replace />} />
        <Route path="/my/bids" element={<Navigate to="/me/bids" replace />} />
        <Route path="/my/orders" element={<Navigate to="/me/orders" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
