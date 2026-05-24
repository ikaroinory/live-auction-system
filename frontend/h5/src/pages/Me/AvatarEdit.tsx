import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, NavBar, Toast } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { authAPI } from '../../services/api';
import { CameraOutline } from 'antd-mobile-icons';
import './AvatarEdit.scss';

export const AvatarEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || '/default-avatar.svg');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!previewUrl || previewUrl === '/default-avatar.svg') {
      Toast.show('请先上传头像');
      return;
    }

    setIsUploading(true);
    try {
      const updatedUser = await authAPI.updateAvatar(previewUrl);
      setUser(updatedUser);
      Toast.show('头像更新成功');
      navigate(-1);
    } catch (error: any) {
      Toast.show(error.response?.data?.message || '头像更新失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveToGallery = () => {
    if (!previewUrl || previewUrl === '/default-avatar.svg') {
      Toast.show('没有可保存的头像');
      return;
    }

    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = 'avatar.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Toast.show('头像已保存');
  };

  return (
    <div className="avatar-edit-page">
      <NavBar
        onBack={() => navigate(-1)}
        rightContent={
          <button className="nav-close" onClick={() => navigate(-1)}>
            ×
          </button>
        }
      />

      <div className="avatar-preview-container">
        <img
          src={previewUrl}
          alt="头像预览"
          className="avatar-preview-image"
        />
      </div>

      <div className="action-list">
        <div className="action-item" onClick={handleUpload}>
          <CameraOutline className="action-icon" />
          <span className="action-text">更换头像</span>
          <span className="action-arrow">›</span>
        </div>

        <div className="action-item" onClick={handleSaveToGallery}>
          <span className="action-icon save-icon">↓</span>
          <span className="action-text">保存头像</span>
          <span className="action-arrow">›</span>
        </div>

        <div className="action-item">
          <span className="action-icon qrcode-icon">▦</span>
          <span className="action-text">查看抖音码</span>
          <span className="action-arrow">›</span>
        </div>
      </div>

      <div className="save-button-container">
        <Button
          block
          color="primary"
          size="large"
          loading={isUploading}
          onClick={handleSave}
        >
          保存头像
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
    </div>
  );
};

export default AvatarEdit;
