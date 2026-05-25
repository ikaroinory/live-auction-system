import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  UnorderedListOutline, 
  ShopbagOutline,
  SettingsIcon,
  HistoryIcon,
  Menu
} from '@/components/ui';
import { useUserStore } from '../../store/useUserStore';
import './Me.scss';

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
      name: '我的出价',
      path: '/me/bids',
    },
    {
      icon: <ShopbagOutline />,
      title: '我的订单',
      name: '我的订单',
      path: '/me/orders',
    },
    {
      icon: <HistoryIcon />,
      title: '浏览历史',
      name: '浏览历史',
      path: '/me/history',
    },
    {
      icon: <SettingsIcon />,
      title: '设置',
      name: '设置',
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

      {/* 菜单列表 - 抖音风格 */}
      <Menu style={{ color:'white' }} items={menuItems} />
      <div className="menu-section">

        {/* 登录/登出按钮 */}
        <div className="action-section">
          {user ? (
            <button className="logout-btn" onClick={handleLogout}>
              退出登录
            </button>
          ) : (
            <button className="login-btn" onClick={handleLogin}>
              立即登录
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Me;