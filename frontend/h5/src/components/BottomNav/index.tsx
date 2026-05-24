import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TabBar
} from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  ShopbagOutline,
  UserOutline,
} from 'antd-mobile-icons';
import './BottomNav.scss';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      key: '/home',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/bids',
      title: '我的出价',
      icon: <UnorderedListOutline />,
    },
    {
      key: '/orders',
      title: '我的订单',
      icon: <ShopbagOutline />,
    },
    {
      key: '/me',
      title: '我',
      icon: <UserOutline />,
    },
  ];

  return (
    <TabBar
      className="bottom-tab-bar"
      activeKey={location.pathname}
      onChange={(key) => navigate(key, { replace:true })}
    >
      {tabs.map((tab) => (
        <TabBar.Item
          key={tab.key}
          icon={tab.icon}
          title={tab.title}
        />
      ))}
    </TabBar>
  );
};
