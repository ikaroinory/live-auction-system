import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, NavBar, Toast, Radio, Space } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { authAPI } from '../../services/api';
import './AvatarEdit.scss';

const AVATAR_OPTIONS = [
  '/default-avatar.svg',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=8',
];

export const AvatarEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '/default-avatar.svg');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await authAPI.updateAvatar(selectedAvatar);
      setUser(updatedUser);
      Toast.show('头像更新成功');
      navigate(-1);
    } catch (error: any) {
      Toast.show(error.response?.data?.message || '头像更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-edit-page">
      <NavBar onBack={() => navigate(-1)}>修改头像</NavBar>

      <div className="avatar-edit-content">
        <div className="avatar-preview">
          <Avatar src={selectedAvatar} style={{ '--size': '120px' }} />
        </div>

        <div className="avatar-options">
          <div className="options-title">选择头像</div>
          <Radio.Group
            value={selectedAvatar}
            onChange={setSelectedAvatar}
          >
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((avatar) => (
                <div
                  key={avatar}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <Avatar src={avatar} style={{ '--size': '60px' }} />
                  {selectedAvatar === avatar && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          </Radio.Group>
        </div>

        <div className="save-button">
          <Button
            block
            color="primary"
            size="large"
            loading={loading}
            onClick={handleSave}
          >
            保存头像
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEdit;
