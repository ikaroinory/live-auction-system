import ReactDOM from 'react-dom/client'
import './assets/styles/index.scss'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { Layout, Menu } from './components/ui'
import { Home } from './pages/Home'

import Me from './pages/Me'
import { MeOrders } from './pages/Me/MeOrders'
import { MeBids } from './pages/Me/MeBids'
import { AvatarEdit } from './pages/Me/AvatarEdit'
import { Login } from './pages/Login'
import { useUserStore } from './store/useUserStore'
import { useEffect } from 'react'
import { LiveRoom } from './pages/LiveRoom'
import ProfileEdit from './pages/Me/ProfileEdit'
import { MenuItemProps } from './components/ui/menu/menu-item'
import React from 'react'

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { fetchUser, isLoading } = useUserStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        加载中...
      </div>
    )
  }

  return <>{children}</>
}

function MainFramework() {
  const style = {
    fontSize: 16,
    fontWeight: 600,
    margin: '12px 0',
  }

  const menuItem: MenuItemProps[] = [
    {
      name: <div style={style}>首页</div>,
      navigation: '/home',
    },
    {
      name: <div style={style}>我</div>,
      navigation: '/me',
    },
  ]

  return (
    <Layout>
      <Layout.Main>
        <Outlet />
      </Layout.Main>

      <Layout.Footer>
        <Menu items={menuItem} />
      </Layout.Footer>
    </Layout>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainFramework />,
    children: [
      { index: true, element: <Navigate to={'/home'} replace /> },

      { path: '/home', element: <Home /> },
      { path: '/me', element: <Me /> },
    ],
  },

  { path: '/login', element: <Login /> },

  { path: '/me/avatar', element: <AvatarEdit /> },
  { path: '/me/profile', element: <ProfileEdit /> },
  { path: '/me/bids', element: <MeBids /> },
  { path: '/me/orders', element: <MeOrders /> },

  { path: '/live/:id', element: <LiveRoom /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppInitializer>
      <RouterProvider router={router} />
    </AppInitializer>
  </React.StrictMode>
)
