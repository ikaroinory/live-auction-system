import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/styles/index.scss'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { Layout } from './components/ui'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { Auction } from './types/auction'
import Me from './pages/Me'
import { MeOrders } from './pages/Me/MeOrders'
import { MeBids } from './pages/Me/MeBids'
import { Login } from './pages/Login'
import { useUserStore } from './store/useUserStore'
import { useEffect } from 'react'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { fetchUser, isLoading } = useUserStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        加载中...
      </div>
    )
  }

  return <>{children}</>
}

function MainFramework() {
  return (
    <Layout>
      <Layout.Main><Outlet /></Layout.Main>
      <Layout.Footer><BottomNav /></Layout.Footer>
    </Layout>
  )
}

// 模拟竞拍数据
const mockAuctions: Auction[] = [
  {
    id: 1,
    sellerId: 1001,
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
    id: 2,
    sellerId: 1002,
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
    id: 3,
    sellerId: 1003,
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
]

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainFramework />,
    children: [
      { index: true, element: <Navigate to={"/home"} replace /> },

      { path: "/home", element: <Home auctions={mockAuctions} /> },
      { path: "/bids", element: <MeBids /> },
      { path: "/orders", element: <MeOrders /> },
      { path: "/me", element: <Me /> },
      { path: "/profile", element: <Navigate to={"/me"} replace /> },
      { path: "/my", element: <Navigate to={"/me"} replace /> }
    ]
  },

  { path: "/login", element: <Login /> }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppInitializer>
      <RouterProvider router={router} />
    </AppInitializer>
  </React.StrictMode>
)
