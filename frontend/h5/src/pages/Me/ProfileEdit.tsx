import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, Toast } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { CameraIcon, ChevronRightIcon, Layout, List } from '@/components/ui';
import './ProfileEdit.scss';

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const [profileData, setProfileData] = useState({
    nickname: user?.nickname || '',
    bio: '',
    gender: '男',
    birthday: user?.birthday || '2002-03-25',
    location: '中国·广东·深圳',
    douyinId: 'ikaroinory',
  });

  const handleSave = () => {
    setUser({
      ...user!,
      nickname: profileData.nickname,
    });
    Toast.show('资料已保存');
    navigate(-1);
  };

  const menuItems = [
    { label: '名字', value: profileData.nickname, key: 'nickname' },
    { label: '简介', value: profileData.bio || 'hypocrisy.', key: 'bio' },
    { label: '性别', value: profileData.gender, key: 'gender' },
    { label: '生日', value: profileData.birthday, key: 'birthday' },
    { label: '所在地', value: profileData.location, key: 'location' },
    { label: '抖音号', value: profileData.douyinId, key: 'douyinId' },
  ];

  return (
    <Layout>
      <Layout.Header>
        <NavBar onBack={() => navigate(-1)} rightContent={<button className="save-btn" onClick={handleSave}>保存</button>} />
      </Layout.Header>
      
      <Layout.Main>
        <div className="cover-section">
          <div className="cover-image">
            <button className="change-cover-btn">
              <CameraIcon />
              更换封面
            </button>
          </div>
          
          <div className="avatar-container">
            <div className="avatar-wrapper">
              <img 
                src={user?.avatar || '/default-avatar.svg'} 
                alt="头像" 
                className="avatar-image"
              />
              <div className="change-avatar-btn">
                <CameraIcon />
                <span>更换头像</span>
              </div>
            </div>
            <div className="completion-status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              资料完成度 100%
            </div>
          </div>
        </div>

        <List className="profile-form">
          {menuItems.map((item) => (
            <List.Item 
              key={item.key} 
              onClick={() => Toast.show(`编辑${item.label}`)}
              label={item.label}
              value={item.value}
              extra={<ChevronRightIcon />}
            />
          ))}
        </List>

        <List style={{ margin: '0 16px' }}>
          <List.Item 
            label="服务挂件"
            value="直播预告、公开群"
            extra={<ChevronRightIcon />}
          />
          <List.Item 
            label="挂件中心"
            value="管理头像挂件"
            extra={<ChevronRightIcon />}
          />
        </List>
      </Layout.Main>
    </Layout>
  );
};

export default ProfileEdit;