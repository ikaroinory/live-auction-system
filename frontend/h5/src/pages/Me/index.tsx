import { List, Button } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { 
  UnorderedListOutline, 
  ShopbagOutline,
  SetOutline,
  ClockCircleOutline
} from 'antd-mobile-icons';
import { useUserStore } from '../../store/useUserStore';
import './Me.scss';
import { Avatar } from '@/components/ui';

export const Me = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const handleAvatarClick = () => {
    if (user) {
      navigate('/me/avatar');
    }
  };

  const handleNicknameClick = () => {
    if (user) {
      navigate('/me/profile');
    }
  };

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
      icon: <ClockCircleOutline />,
      title: '浏览历史',
      path: '/me/history',
    },
    {
      icon: <SetOutline />,
      title: '设置',
      path: '/me/settings',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const displayName = user?.nickname || user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  const avatarUrl = user?.avatar || '/default-avatar.svg';

  return (
    <div className="me-page">
      {/* 用户信息头部 */}
      <div className="user-header">
        <div className="user-info" onClick={handleAvatarClick}>
          <Avatar url={ avatarUrl }  defaultUrl='/default-avatar.svg' />
          <div className="user-details">
            <div 
              className="user-name" 
              onClick={(e) => { e.stopPropagation(); handleNicknameClick(); }}
            >
              {displayName || '未登录'}
            </div>
            {user && (
              <div className="user-phone">
                {user.phone}
              </div>
            )}
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">{user ? '12' : '-'}</div>
            <div className="stat-label">出价次数</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{user ? '3' : '-'}</div>
            <div className="stat-label">成功竞拍</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{user ? '8' : '-'}</div>
            <div className="stat-label">浏览记录</div>
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
              clickable={!!user}
              onClick={() => user && navigate(item.path)}
            >
              {item.title}
            </List.Item>
          ))}
        </List>

        {/* 登录/登出按钮 */}
        <div style={{ padding: '20px' }}>
          {user ? (
            <Button 
              block 
              color="danger" 
              fill="outline"
              onClick={handleLogout}
            >
              退出登录
            </Button>
          ) : (
            <Button 
              block 
              color="primary" 
              onClick={handleLogin}
            >
              立即登录
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Me;
