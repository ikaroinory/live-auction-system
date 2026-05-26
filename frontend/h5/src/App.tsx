
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { LiveRoom } from './pages/LiveRoom';
import { AuctionDetail } from './pages/AuctionDetail';
import { MeBids } from './pages/Me/MeBids';
import { MeOrders } from './pages/Me/MeOrders';
import { ProfileEdit } from './pages/Me/ProfileEdit';
import Me from './pages/Me';
import { Login } from './pages/Login';
import { useUserStore } from './store/useUserStore';
import { liveRoomAPI } from './services/api';
import type { LiveRoomWithStreamer } from '@live-auction/shared';

function App() {
  const { fetchUser, isLoading } = useUserStore();
  const [liveRooms, setLiveRooms] = useState<LiveRoomWithStreamer[]>([]);
  const [liveRoomsLoading, setLiveRoomsLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const loadLiveRooms = async () => {
      try {
        const data = await liveRoomAPI.getLiveRooms();
        setLiveRooms(data);
      } catch (error) {
        console.error('Failed to load live rooms:', error);
      } finally {
        setLiveRoomsLoading(false);
      }
    };
    loadLiveRooms();
  }, []);

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
        <Route path="/" element={<Home liveRooms={liveRooms} loading={liveRoomsLoading} />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/live/:id" element={<LiveRoom />} />
        <Route path="/me/bids" element={<MeBids />} />
        <Route path="/me/orders" element={<MeOrders />} />
        <Route path="/me/profile" element={<ProfileEdit />} />
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
