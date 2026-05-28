import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Typography,
  Toast,
  Space,
} from '@douyinfe/semi-ui';
import { auctionService } from '@/services';
import './Create.scss';

const { Title, Text } = Typography;

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = () => {
    const url = prompt('请输入图片URL:');
    if (url && images.length < 4) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      Toast.success('商品添加成功');
      navigate('/product/list');
    } catch (error: any) {
      Toast.error(error.response?.data?.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auction-form-container">
      <Title heading={4} style={{ marginBottom: 24 }}>
        添加商品
      </Title>

      <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="auction-form-section">
          <div className="auction-form-section-title">商品信息</div>
          
          <Form.Input
            field="name"
            label="商品名称"
            placeholder="请输入商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
            style={{ marginBottom: 20 }}
          />

          <Form.TextArea
            field="description"
            label="商品描述"
            placeholder="请输入商品详细描述"
            rules={[{ required: true, message: '请输入商品描述' }]}
            style={{ marginBottom: 20 }}
          />

          <Form.InputNumber
            field="price"
            label="商品价格"
            placeholder="0.00"
            prefix="¥"
            min={0}
            step={0.01}
            precision={2}
            rules={[
              { required: true, message: '请输入商品价格' },
              { type: 'number', min: 0, message: '价格不能为负数' },
            ]}
            style={{ marginBottom: 20, width: '50%' }}
          />

          <Form.Label>商品图片（最多4张）</Form.Label>
          <div className="image-upload-grid">
            {images.map((url, index) => (
              <div key={index} className="image-upload-item">
                <img src={url} alt={`商品图片 ${index + 1}`} />
                <Button
                  size="small"
                  theme="solid"
                  type="danger"
                  onClick={() => handleRemoveImage(index)}
                  style={{ position: 'absolute', top: 4, right: 4 }}
                >
                  ×
                </Button>
              </div>
            ))}
            {images.length < 4 && (
              <div className="image-upload-item" onClick={handleImageUpload}>
                <div className="image-upload-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <Text type="tertiary" size="small">上传图片</Text>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="auction-form-actions">
          <Button onClick={() => navigate('/product/list')}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            添加商品
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProductCreate;
