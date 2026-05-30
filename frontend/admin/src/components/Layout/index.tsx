import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import { Layout, Avatar, Dropdown, Nav, Button, Image } from '@douyinfe/semi-ui'
import { IconHome, IconTickCircle, IconGift, IconExit, IconMoon, IconSun } from '@douyinfe/semi-icons'
import { useUserStore } from '@/store'
import { useThemeMode } from '@/hooks/useThemeMode'
import styles from './Layout.module.scss'

const { Sider, Header, Content } = Layout

const navItems = [
  { itemKey: 'dashboard', text: '数据概览', icon: <IconHome />, path: '/dashboard' },
  { itemKey: 'product', text: '商品管理', icon: <IconGift />, path: '/product/list' },
  { itemKey: 'order', text: '订单管理', icon: <IconTickCircle />, path: '/order/list' }
]

const LayoutComponent: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()
  const { mode, toggleMode } = useThemeMode()

  const handleSelect = (data: { itemKey: string | number }) => {
    const item = navItems.find((i) => i.itemKey === String(data.itemKey))
    if (item) {
      navigate(item.path)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getCurrentKey = () => {
    const item = navItems.find((i) => location.pathname.startsWith(i.path))
    return item?.itemKey || 'dashboard'
  }

  const userMenu = (
    <div style={{ padding: 8 }}>
      <Button block type="tertiary" icon={<IconExit />} onClick={handleLogout} theme="borderless">
        退出登录
      </Button>
    </div>
  )

  return (
    <Layout>
      <Header className={styles.adminHeader}>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>
          <Image
            width={71.5}
            height={26}
            src="https://lf3-cm.ecombdstatic.com/obj/ecom-ecop/17096098894949d6dd9382c07d1c9b5ec5cc115a6a3eaa8855.png"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button theme="borderless" icon={mode === 'dark' ? <IconSun /> : <IconMoon />} onClick={toggleMode} />
          <Dropdown render={userMenu} position="bottomRight">
            <Avatar size="small" src={user?.avatar} style={{ cursor: 'pointer' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Dropdown>
        </div>
      </Header>
      <Layout style={{ height: 'calc(100dvh - 64px)' }}>
        <Sider>
          <Nav style={{ height: '100%' }} selectedKeys={[getCurrentKey()]} items={navItems} onSelect={handleSelect} />
        </Sider>
        <Content className={styles.mainContainer}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutComponent
