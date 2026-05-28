import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button } from '@douyinfe/semi-ui';
import {
  IconHome,
  IconLive,
  IconTicket,
  IconGift,
  IconExit,
} from '@douyinfe/semi-icons';
import { useUserStore } from '@/store';
import './Layout.scss';

const { Sider, Header, Content } = Layout;

const menuItems = [
  {
    node: 'item',
    text: '数据概览',
    icon: <IconHome size="large" />,
    path: '/dashboard',
  },
  {
    node: 'item',
    text: '竞拍管理',
    icon: <IconLive size="large" />,
    path: '/auction/list',
  },
  {
    node: 'item',
    text: '订单管理',
    icon: <IconTicket size="large" />,
    path: '/order/list',
  },
  {
    node: 'item',
    text: '商品管理',
    icon: <IconGift size="large" />,
    path: '/product/list',
  },
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

  const getSelectedKeys = () => {
    const path = location.pathname;
    const item = menuItems.find((item) => path.startsWith(item.path));
    return item ? [item.path] : [];
  };

  const userMenu = (
    <Menu>
      <Menu.Item onClick={handleLogout} icon={<IconExit />}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="admin-layout">
      <Sider className="admin-sider">
        <div className="admin-logo">直播竞拍管理</div>
        <Menu
          className="admin-menu"
          selectedKeys={getSelectedKeys()}
          onClick={(data) => handleMenuClick(data.itemKey as string)}
        >
          {menuItems.map((item) => (
            <Menu.Item key={item.path} icon={item.icon}>
              {item.text}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header className="admin-header">
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            {menuItems.find((item) => location.pathname.startsWith(item.path))?.text || '后台管理'}
          </div>
          <Dropdown render={userMenu} position="bottomRight">
            <Avatar
              size="small"
              src={user?.avatar}
              style={{ cursor: 'pointer' }}
            >
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
