import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useUserStore } from '@/store';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import AuctionList from '@/pages/Auction/List';
import AuctionCreate from '@/pages/Auction/Create';
import AuctionDetail from '@/pages/Auction/Detail';
import OrderList from '@/pages/Order/List';
import ProductList from '@/pages/Product/List';
import ProductCreate from '@/pages/Product/Create';
import Layout from '@/components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="auction/list" element={<AuctionList />} />
          <Route path="auction/create" element={<AuctionCreate />} />
          <Route path="auction/:id" element={<AuctionDetail />} />
          <Route path="order/list" element={<OrderList />} />
          <Route path="product/list" element={<ProductList />} />
          <Route path="product/create" element={<ProductCreate />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
