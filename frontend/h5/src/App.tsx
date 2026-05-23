import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { LiveRoom } from './pages/LiveRoom';
import { AuctionDetail } from './pages/AuctionDetail';
import { MyBids } from './pages/My/MyBids';
import { MyOrders } from './pages/My/MyOrders';
import My from './pages/My';
import { Login } from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/live/:id" element={<LiveRoom />} />
        <Route path="/my/bids" element={<MyBids />} />
        <Route path="/my/orders" element={<MyOrders />} />
        <Route path="/my" element={<My />} />
        <Route path="/profile" element={<My />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
