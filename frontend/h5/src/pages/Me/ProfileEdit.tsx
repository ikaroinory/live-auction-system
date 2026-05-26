import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Input } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { authAPI } from '../../services/api';
import { Gender } from '../../../../../shared/src/user';
import { CameraIcon, ChevronLeftIcon, ChevronRightIcon, Layout, List, BubbleButton, Dialog } from '@/components/ui';
import './ProfileEdit.scss';

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    gender: user?.gender || Gender.MALE,
    birthday: user?.birthday || '',
    location: user?.location || '',
    douyinId: user?.douyinId || '',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || '/default-avatar.svg');
  const [isUploading, setIsUploading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalTitle, setEditModalTitle] = useState('');
  const [editModalValue, setEditModalValue] = useState('');
  const [editModalKey, setEditModalKey] = useState('');
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [birthdayModalVisible, setBirthdayModalVisible] = useState(false);
  const [tempGender, setTempGender] = useState<Gender>(profileData.gender);
  const [tempBirthday, setTempBirthday] = useState(profileData.birthday || '');

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
      setTempGender(user.gender || Gender.MALE);
      setTempBirthday(user.birthday || '');
      if (user.avatar) {
        setPreviewUrl(user.avatar);
      }
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

  const genderOptions = [
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
    setTempGender(profileData.gender);
    setGenderModalVisible(true);
  };

  const selectGender = (g: Gender) => {
    setTempGender(g);
  };

  const handleGenderConfirm = async () => {
    const newData = { ...profileData, gender: tempGender };
    setProfileData(newData);
    setGenderModalVisible(false);
    try {
      const updatedUser = await authAPI.updateProfile(newData);
      setUser(updatedUser);
      Toast.show('已保存');
    } catch (error: any) {
      Toast.show(error.message || '保存失败');
    }
  };

  const handleEditBirthday = () => {
    setTempBirthday(profileData.birthday || '');
    setBirthdayModalVisible(true);
  };

  const handleBirthdayConfirm = async () => {
    const newData = { ...profileData, birthday: tempBirthday };
    setProfileData(newData);
    setBirthdayModalVisible(false);
    try {
      const updatedUser = await authAPI.updateProfile(newData);
      setUser(updatedUser);
      Toast.show('已保存');
    } catch (error: any) {
      Toast.show(error.message || '保存失败');
    }
  };

  const handleEditLocation = () => {
    showEditModal('所在地', profileData.location, 'location');
  };

  const handleEditDouyinId = () => {
    showEditModal('抖音号', profileData.douyinId, 'douyinId');
  };

  const handleModalConfirm = async () => {
    const newData = { ...profileData, [editModalKey]: editModalValue };
    setProfileData(newData);
    setEditModalVisible(false);
    try {
      const updatedUser = await authAPI.updateProfile(newData);
      setUser(updatedUser);
      Toast.show('已保存');
    } catch (error: any) {
      Toast.show(error.message || '保存失败');
    }
  };

  const handleUploadAndSave = async (file: File) => {
    setIsUploading(true);

    const reader = new FileReader();

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('图片读取失败'));
        };
        reader.readAsDataURL(file);
      });

      setPreviewUrl(dataUrl);

      const updatedUser = await authAPI.updateAvatar(dataUrl);
      setUser(updatedUser);
      setPreviewUrl(updatedUser.avatar);
      Toast.show('头像已更新');
    } catch (error: any) {
      Toast.show(error.message || '头像上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUploadAndSave(file);
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
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
        </div>
        
        <div className="cover-section">
          <div className="cover-image" />
          
          <div className="avatar-container">
            <div className="avatar-wrapper">
              <img 
                src={previewUrl || '/default-avatar.svg'} 
                alt="头像" 
                className="avatar-image"
              />
              <div className="change-avatar-btn" onClick={handleAvatarUpload}>
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

        <Dialog
          visible={genderModalVisible}
          title="选择性别"
          content={
            <div className="gender-options">
              {genderOptions.map((opt) => (
                <div 
                  key={opt.value} 
                  className={`gender-option ${tempGender === opt.value ? 'active' : ''}`}
                  onClick={() => selectGender(opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          }
          onConfirm={handleGenderConfirm}
          onCancel={() => setGenderModalVisible(false)}
          confirmText="保存"
          cancelText="取消"
        />

        <Dialog
          visible={birthdayModalVisible}
          title="选择生日"
          content={
            <Input
              value={tempBirthday}
              onChange={(val) => setTempBirthday(val)}
              placeholder="请输入生日，格式：YYYY-MM-DD"
            />
          }
          onConfirm={handleBirthdayConfirm}
          onCancel={() => setBirthdayModalVisible(false)}
          confirmText="保存"
          cancelText="取消"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
          style={{ display: 'none' }}
        />

        {isUploading && (
          <div className="upload-overlay">
            <div className="upload-spinner" />
            <span>上传中...</span>
          </div>
        )}
      </Layout.Main>
    </Layout>
  );
};

export default ProfileEdit;