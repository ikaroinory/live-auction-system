
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { LiveRoom } from './pages/LiveRoom';
import { AuctionDetail } from './pages/AuctionDetail';
import { MeBids } from './pages/Me/MeBids';
import { MeOrders } from './pages/Me/MeOrders';
import Me from './pages/Me';
import { Login } from './pages/Login';
import { useUserStore } from './store/useUserStore';
import { auctionAPI } from './services/api';
import type { AuctionWithSeller } from '@live-auction/shared';

function App() {
  const { fetchUser, isLoading } = useUserStore();
  const [auctions, setAuctions] = useState&lt;AuctionWithSeller[]&gt;([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);

  useEffect(() =&gt; {
    fetchUser();
  }, [fetchUser]);

  useEffect(() =&gt; {
    const loadAuctions = async () =&gt; {
      try {
        const data = await auctionAPI.getAuctions();
        setAuctions(data);
      } catch (error) {
        console.error('Failed to load auctions:', error);
      } finally {
        setAuctionsLoading(false);
      }
    };
    loadAuctions();
  }, []);

  if (isLoading) {
    return (
      &lt;div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}&gt;
        加载中...
      &lt;/div&gt;
    );
  }

  return (
    &lt;BrowserRouter&gt;
      &lt;Routes&gt;
        &lt;Route path="/" element={&lt;Home auctions={auctions} loading={auctionsLoading} /&gt;} /&gt;
        &lt;Route path="/auction/:id" element={&lt;AuctionDetail /&gt;} /&gt;
        &lt;Route path="/live/:id" element={&lt;LiveRoom /&gt;} /&gt;
        &lt;Route path="/me/bids" element={&lt;MeBids /&gt;} /&gt;
        &lt;Route path="/me/orders" element={&lt;MeOrders /&gt;} /&gt;
        &lt;Route path="/me" element={&lt;Me /&gt;} /&gt;
        &lt;Route path="/profile" element={&lt;Navigate to="/me" replace /&gt;} /&gt;
        &lt;Route path="/my" element={&lt;Navigate to="/me" replace /&gt;} /&gt;
        &lt;Route path="/my/bids" element={&lt;Navigate to="/me/bids" replace /&gt;} /&gt;
        &lt;Route path="/my/orders" element={&lt;Navigate to="/me/orders" replace /&gt;} /&gt;
        &lt;Route path="/login" element={&lt;Login /&gt;} /&gt;
        &lt;Route path="*" element={&lt;Navigate to="/" replace /&gt;} /&gt;
      &lt;/Routes&gt;
    &lt;/BrowserRouter&gt;
  );
}

export default App;
