import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  UnorderedListOutline,
  ShopbagOutline,
  SettingsIcon,
  HistoryIcon,
  Menu,
  Display,
  ChevronRightIcon,
} from '@/components/ui';
import { useUserStore } from '../../store/useUserStore';
import './Me.scss';
import { MenuItemProps } from '@/components/ui/menu/menu-item';

export const Me = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const menuItems: MenuItemProps[] = [
    {
      icon: <UnorderedListOutline />,
      name: '我的出价',
      navigation: '/me/bids',
    },
    {
      icon: <ShopbagOutline />,
      name: '我的订单',
      navigation: '/me/orders',
    },
    {
      icon: <HistoryIcon />,
      name: '浏览历史',
      navigation: '/me/history',
    },
    {
      icon: <SettingsIcon />,
      name: '设置',
      navigation: '/me/settings',
    },
  ];

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.nickname || user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  const avatarUrl = user?.avatar || '/default-avatar.svg';

  return (
    <>
      {/* 用户信息头部 */}
      <div className="user-header">
        <div className="user-info">
          <Avatar url={avatarUrl} defaultUrl="/default-avatar.svg" onClick={handleAvatarClick} />

          <div className="user-details">
            <div className="user-name">
              <div onClick={handleNicknameClick}>{displayName || '未登录'}</div>
            </div>
            {user && <div className="user-id">抖音号：{user.douyinId}</div>}
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex' }}>
          <Display style={{ flex: 1 }}>
            <Display.Item name={'获赞'} count={user ? 700 : '-'} />
            <Display.Item name={'互关'} count={user ? 33 : '-'} />
            <Display.Item name={'关注'} count={user ? 128 : '-'} />
            <Display.Item name={'粉丝'} count={user ? 65 : '-'} />
          </Display>

          <button className="edit-btn" onClick={handleNicknameClick}>
            编辑主页
          </button>
        </div>
      </div>

      <Menu style={{ color: 'white' }} items={menuItems} />

      <div className="menu-section">
        {/* 登录/登出按钮 */}
        <div className="action-section">
          {user ? (
            <button className="logout-btn" onClick={handleLogout}>
              退出登录
            </button>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              立即登录
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Me;
