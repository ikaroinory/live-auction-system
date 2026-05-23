import { List, Avatar, Space, Tag } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { 
  UserOutline, 
  UnorderedListOutline, 
  ShopbagOutline,
  SettingOutline,
  HistoryOutline
} from 'antd-mobile-icons';
import { useUserStore } from '../../store/useUserStore';
import './Me.scss';

export const Me = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const menuItems = [
    {
      icon: <UnorderedListOutline />,
      title: '我的出价',
      path: '/me/bids',
    },
    {
      icon: <ShopbagOutline />,
      title: '我的订单',
      path: '/me/orders',
    },
    {
      icon: <HistoryOutline />,
      title: '浏览历史',
      path: '/me/history',
    },
    {
      icon: <SettingOutline />,
      title: '设置',
      path: '/me/settings',
    },
  ];

  const getVipColor = (level: number) => {
    const colors = ['#909399', '#409EFF', '#67C23A', '#E6A23C', '#F56C6C'];
    return colors[Math.min(level - 1, colors.length - 1)];
  };

  return (
    <div className="me-page">
      {/* 用户信息头部 */}
      <div className="user-header">
        <div className="user-info">
          <Avatar 
            src={user?.avatar} 
            style={{ '--size': '80px' }}
          />
          <div className="user-details">
            <div className="user-name">
              {user?.nickname || user?.username}
            </div>
            <div className="user-phone">
              {user?.phone}
            </div>
            <div className="user-vip">
              <Tag 
                color={user ? getVipColor(user.vipLevel) : '#909399'} 
                fill="outline"
              >
                {user?.vipName || '普通会员'}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="menu-section">
        <List>
          {menuItems.map((item) => (
            <List.Item
              key={item.path}
              prefix={item.icon}
              clickable
              onClick={() => navigate(item.path)}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
      </div>

      {/* 统计信息 */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-number">12</div>
          <div className="stat-label">出价次数</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">3</div>
          <div className="stat-label">成功竞拍</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">8</div>
          <div className="stat-label">浏览记录</div>
        </div>
      </div>
    </div>
  );
};

export default Me;
