import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, Toast } from 'antd-mobile'
import { useUserStore } from '../../store/useUserStore'
import { authAPI } from '../../services/api'
import { CameraIcon, ChevronRightIcon, DownloadIcon, Layout } from '@/components/ui'
import './AvatarEdit.scss'

export const AvatarEdit = () => {
  const navigate = useNavigate()
  const { user, setUser } = useUserStore()
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || '/default-avatar.svg')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadAndSave = async (file: File) => {
    setIsUploading(true)

    const reader = new FileReader()

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string)
        }
        reader.onerror = () => {
          reject(new Error('图片读取失败'))
        }
        reader.readAsDataURL(file)
      })

      setPreviewUrl(dataUrl)

      const updatedUser = await authAPI.updateAvatar(dataUrl)
      setUser(updatedUser)
      setPreviewUrl(updatedUser.avatar)
      Toast.show('头像已更新')
    } catch (error) {
      const message = error instanceof Error ? error.message : '头像上传失败'
      Toast.show(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleUploadAndSave(file)
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleSaveToGallery = () => {
    if (!previewUrl || previewUrl === '/default-avatar.svg') {
      Toast.show('没有可保存的头像')
      return
    }

    const link = document.createElement('a')
    link.href = previewUrl
    link.download = 'avatar.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    Toast.show('头像已保存')
  }

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
            <CameraIcon className="action-icon" />
            <span className="action-text">更换头像</span>
            <ChevronRightIcon className="action-arrow" />
          </div>

          <div className="action-item" onClick={handleSaveToGallery}>
            <DownloadIcon className="action-icon" />
            <span className="action-text">保存头像</span>
            <ChevronRightIcon className="action-arrow" />
          </div>
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
  )
}

export default AvatarEdit
