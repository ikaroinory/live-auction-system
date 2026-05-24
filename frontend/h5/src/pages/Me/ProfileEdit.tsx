import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Picker, DatePicker, Input } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { authAPI } from '../../services/api';
import { Gender } from '../../../../../shared/src/user';
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon, Layout, List, BubbleButton, Dialog } from '@/components/ui';
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

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalValue, setEditModalValue] = useState('');
  const [editModalKey, setEditModalKey] = useState('');

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

  const genderColumns = [
    { label: '男', value: Gender.MALE },
    { label: '女', value: Gender.FEMALE },
    { label: '未知', value: Gender.UNKNOWN },
  ];

  const showEditModal = (title: string, value: string, key: string) => {
    setEditModalTitle(title);
    setEditModalValue(value);
    setEditModalKey(key);
    setEditModalVisible(true);
  };

  const handleEditNickname = () => {
    showEditModal('名字', profileData.nickname, 'nickname');
  };

  const handleEditBio = () => {
    showEditModal('简介', profileData.bio, 'bio');
  };

  const handleEditGender = () => {
    Picker.show({
      columns: [genderColumns],
      value: [profileData.gender],
      onConfirm: (val) => {
        setProfileData({ ...profileData, gender: val[0] as Gender });
      },
    });
  };

  const handleEditBirthday = () => {
    DatePicker.show({
      defaultValue: profileData.birthday ? new Date(profileData.birthday) : new Date(),
      max: new Date(),
      onConfirm: (val) => {
        const dateStr = val.toISOString().split('T')[0];
        setProfileData({ ...profileData, birthday: dateStr });
      },
    });
  };

  const handleEditLocation = () => {
    showEditModal('所在地', profileData.location, 'location');
  };

  const handleEditDouyinId = () => {
    showEditModal('抖音号', profileData.douyinId, 'douyinId');
  };

  const handleModalConfirm = () => {
    setProfileData({ ...profileData, [editModalKey]: editModalValue });
    setEditModalVisible(false);
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
    { label: '名字', value: profileData.nickname, key: 'nickname', onClick: handleEditNickname },
    { label: '简介', value: profileData.bio, key: 'bio', onClick: handleEditBio },
    { label: '性别', value: getGenderDisplay(profileData.gender), key: 'gender', onClick: handleEditGender },
    { label: '生日', value: profileData.birthday, key: 'birthday', onClick: handleEditBirthday },
    { label: '所在地', value: profileData.location, key: 'location', onClick: handleEditLocation },
    { label: '抖音号', value: profileData.douyinId, key: 'douyinId', onClick: handleEditDouyinId },
  ];

  return (
    <Layout>
      <Layout.Main>
        <div className="top-bar">
          <BubbleButton onClick={() => navigate(-1)}>
            <ChevronLeftIcon />
          </BubbleButton>
          <button className="save-btn" onClick={handleSave}>保存</button>
        </div>
        
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
              onClick={item.onClick}
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

        <Dialog
          visible={editModalVisible}
          title={editModalTitle}
          content={
            <Input
              value={editModalValue}
              onChange={(val) => setEditModalValue(val)}
              placeholder={`请输入${editModalTitle}`}
            />
          }
          onConfirm={handleModalConfirm}
          onCancel={() => setEditModalVisible(false)}
          confirmText="确定"
          cancelText="取消"
        />
      </Layout.Main>
    </Layout>
  );
};

export default ProfileEdit;