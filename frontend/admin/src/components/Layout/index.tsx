import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Layout, Avatar, Dropdown, Nav, Button } from '@douyinfe/semi-ui';
import { IconHome, IconLive, IconTickCircle, IconGift, IconExit, IconMoon, IconSun } from '@douyinfe/semi-icons';
import { useUserStore } from '@/store';
import { useThemeMode } from '@/hooks/useThemeMode';
import './Layout.scss';

const { Sider, Header, Content } = Layout;

const navItems = [
  { itemKey: 'dashboard', text: '数据概览', icon: <IconHome />, path: '/dashboard' },
  { itemKey: 'auction', text: '竞拍管理', icon: <IconLive />, path: '/auction/list' },
  { itemKey: 'order', text: '订单管理', icon: <IconTickCircle />, path: '/order/list' },
  { itemKey: 'product', text: '商品管理', icon: <IconGift />, path: '/product/list' }
];

const LayoutComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();
  const { mode, toggleMode } = useThemeMode();

  const handleSelect = (data: { itemKey: string | number }) => {
    const item = navItems.find((i) => i.itemKey === String(data.itemKey));
    if (item) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentKey = () => {
    const item = navItems.find((i) => location.pathname.startsWith(i.path));
    return item?.itemKey || 'dashboard';
  };

  const userMenu = (
    <div style={{ padding: 8 }}>
      <Button block type="tertiary" icon={<IconExit />} onClick={handleLogout} theme="borderless">
        退出登录
      </Button>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sider className="admin-sider">
        <Nav
          selectedKeys={[getCurrentKey()]}
          items={navItems}
          onSelect={handleSelect}
          header={{
            text: '直播竞拍管理'
          }}
          bodyStyle={{ flex: 1 }}
        />
      </Sider>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header className="admin-header">
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            {navItems.find((item) => location.pathname.startsWith(item.path))?.text || '后台管理'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              theme="borderless"
              icon={mode === 'dark' ? <IconSun /> : <IconMoon />}
              onClick={toggleMode}
            />
            <Dropdown render={userMenu} position="bottomRight">
              <Avatar size="small" src={user?.avatar} style={{ cursor: 'pointer' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </div>
    </div>
  );
};

export default LayoutComponent;
