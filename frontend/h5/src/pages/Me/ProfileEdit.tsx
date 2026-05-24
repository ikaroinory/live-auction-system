import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { authAPI } from '../../services/api';
import { Gender } from '@live-auction/shared';
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon, Layout, List, BubbleButton } from '@/components/ui';
import './ProfileEdit.scss';

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const [profileData, setProfileData] = useState({
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    gender: user?.gender || Gender.MALE,
    birthday: user?.birthday || '',
    location: user?.location || '',
    douyinId: user?.douyinId || '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nickname: user.nickname || '',
        bio: user.bio || '',
        gender: user.gender || Gender.MALE,
        birthday: user.birthday || '',
        location: user.location || '',
        douyinId: user.douyinId || '',
      });
    }
  }, [user]);

  const getGenderDisplay = (g?: Gender) => {
    switch (g) {
      case Gender.MALE:
        return '男';
      case Gender.FEMALE:
        return '女';
      default:
        return '未知';
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = await authAPI.updateProfile(profileData);
      setUser(updatedUser);
      Toast.show('资料已保存');
      navigate(-1);
    } catch (error: any) {
      Toast.show(error.message || '保存失败');
    }
  };

  const menuItems = [
    { label: '名字', value: profileData.nickname || '未设置', key: 'nickname' },
    { label: '简介', value: profileData.bio || 'hypocrisy.', key: 'bio' },
    { label: '性别', value: getGenderDisplay(profileData.gender), key: 'gender' },
    { label: '生日', value: profileData.birthday || '2002-03-25', key: 'birthday' },
    { label: '所在地', value: profileData.location || '中国·广东·深圳', key: 'location' },
    { label: '抖音号', value: profileData.douyinId || 'ikaroinory', key: 'douyinId' },
  ];

  return (
    <Layout>
      <Layout.Main>
        <div className="top-bar">
          <BubbleButton onClick={() => navigate(-1)}><ChevronLeftIcon /></BubbleButton>
        </div>
        
        <div className="cover-section">
          <div className="cover-image" />
          
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