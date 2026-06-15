import { Outlet, useNavigate, useLocation } from 'react-router'
import { Layout, Avatar, Dropdown, Nav, Button, Image } from '@douyinfe/semi-ui'
import { IconHome, IconTickCircle, IconGift, IconExit, IconMoon, IconSun } from '@douyinfe/semi-icons'
import { useUserStore } from '@/store'
import { useThemeMode } from '@/hooks/useThemeMode'
import styles from './Layout.module.scss'
import { NavItemProps } from '@douyinfe/semi-ui/lib/es/navigation'

const { Sider, Header, Content } = Layout

type NavigationItem = NavItemProps & { path: string }
const navItems: NavigationItem[] = [
  { itemKey: 'dashboard', text: '数据概览', icon: <IconHome />, path: 'dashboard' },
  { itemKey: 'products', text: '商品管理', icon: <IconGift />, path: 'products/list' },
  { itemKey: 'orders', text: '订单管理', icon: <IconTickCircle />, path: 'orders/list' }
]

const LayoutComponent: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()
  const { mode, toggleMode } = useThemeMode()

  const handleLogout = () => {
    logout()
    navigate('/login')
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
            <div>
              <Avatar size="small" src={user?.avatar} style={{ cursor: 'pointer' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout style={{ height: 'calc(100dvh - 64px)' }}>
        <Sider>
          <Nav
            style={{ height: '100%' }}
            selectedKeys={[location.pathname.slice(1).split('/')[0]]}
            items={navItems}
            onSelect={(data) => navigate(navItems.find((e) => data.itemKey === e.itemKey)?.path || 'dashboard')}
          />
        </Sider>
        <Content className={styles.mainContainer}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutComponent
