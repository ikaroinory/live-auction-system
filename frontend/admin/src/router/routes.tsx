import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute } from './ProtectedRoute'
import Dashboard from '@/pages/Dashboard'
import ProductList from '@/pages/Product/List'
import ProductCreate from '@/pages/Product/Create'
import ProductEdit from '@/pages/Product/Edit'
import OrderList from '@/pages/Order/List'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'

export const routers = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      { path: 'dashboard', element: <Dashboard /> },

      { path: 'products/list', element: <ProductList /> },
      { path: 'products/create', element: <ProductCreate /> },
      { path: 'products/:id', element: <ProductEdit /> },

      { path: 'orders/list', element: <OrderList /> }
    ]
  },

  { path: 'login', element: <Login /> }
])
