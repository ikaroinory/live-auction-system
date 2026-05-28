import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Layout, Avatar, Dropdown, Button } from '@douyinfe/semi-ui';
import { IconHome, IconLive, IconTickCircle, IconGift, IconExit } from '@douyinfe/semi-icons';
import { useUserStore } from '@/store';
import './Layout.scss';

const { Sider, Header, Content } = Layout;

const menuItems = [
  {
    text: '数据概览',
    icon: <IconHome size="large" />,
    path: '/dashboard'
  },
  {
    text: '竞拍管理',
    icon: <IconLive size="large" />,
    path: '/auction/list'
  },
  {
    text: '订单管理',
    icon: <IconTickCircle size="large" />,
    path: '/order/list'
  },
  {
    text: '商品管理',
    icon: <IconGift size="large" />,
    path: '/product/list'
  }
];

const LayoutComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
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
        <div className="admin-logo">直播竞拍管理</div>
        <div className="admin-menu">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              block
              type={isActive(item.path) ? 'primary' : 'tertiary'}
              theme={isActive(item.path) ? 'solid' : 'borderless'}
              icon={item.icon}
              onClick={() => handleMenuClick(item.path)}
              style={{
                justifyContent: 'flex-start',
                marginBottom: 8,
                padding: '12px 16px'
              }}
            >
              {item.text}
            </Button>
          ))}
        </div>
      </Sider>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header className="admin-header">
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            {menuItems.find((item) => location.pathname.startsWith(item.path))?.text || '后台管理'}
          </div>
          <Dropdown render={userMenu} position="bottomRight">
            <Avatar size="small" src={user?.avatar} style={{ cursor: 'pointer' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Dropdown>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </div>
    </div>
  );
};

export default LayoutComponent;
