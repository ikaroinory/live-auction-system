import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, NavBar, Toast } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { authAPI } from '../../services/api';
import { CameraOutline } from 'antd-mobile-icons';
import './AvatarEdit.scss';
import { Layout } from '@/components/ui';

export const AvatarEdit = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || '/default-avatar.svg');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user]);

  const handleUploadAndSave = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setIsSaved(false);

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const updatedUser = await authAPI.updateAvatar(dataUrl);
      setUser(updatedUser);
      setPreviewUrl(updatedUser.avatar);
      setIsSaved(true);
      Toast.show('头像已更新');
    } catch (error: any) {
      Toast.show(error.response?.data?.message || '头像上传失败');
      setIsSaved(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUploadAndSave(file);
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
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
    <Layout>
      <Layout.Header>
        <NavBar onBack={() => navigate(-1)} />
      </Layout.Header>
      
      <Layout.Main>
        <div className="avatar-preview-container">
          {isUploading && (
            <div className="upload-overlay">
              <div className="upload-spinner" />
              <span>上传中...</span>
            </div>
          )}
          <img
            src={previewUrl || '/default-avatar.svg'}
            alt="头像预览"
            className="avatar-preview-image"
          />
        </div>

        <div className="action-list">
          <div className="action-item" onClick={handleUpload} disabled={isUploading}>
            <CameraOutline className="action-icon" />
            <span className="action-text">更换头像</span>
            <span className="action-arrow">›</span>
          </div>

          <div className="action-item" onClick={handleSaveToGallery}>
            <span className="action-icon save-icon">↓</span>
            <span className="action-text">保存头像</span>
            <span className="action-arrow">›</span>
          </div>
        </div>

        <div className="save-button-container">
          <Button
            block
            color="primary"
            size="large"
            disabled={isSaved}
            onClick={() => navigate(-1)}
          >
            {isSaved ? '已保存' : '保存头像'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
      </Layout.Main>
    </Layout>
  );
};

export default AvatarEdit;
