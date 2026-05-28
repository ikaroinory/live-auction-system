import React, { useState } from 'react';
import { useNavigate } from 'react-router';
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
import { IconPlus, IconMinus, IconUpload } from '@douyinfe/semi-icons';
import { auctionService } from '@/services';
import type { AuctionFormData } from '@/types';
import './Create.scss';

const { Title, Text } = Typography;

const AuctionCreate: React.FC = () => {
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
      const formData: AuctionFormData = {
        ...values,
        images,
        durationSeconds: values.durationSeconds || 3600,
        autoExtendSeconds: values.autoExtendSeconds || 15,
      };

      await auctionService.create(formData);
      Toast.success('竞拍发布成功');
      navigate('/auction/list');
    } catch (error: any) {
      Toast.error(error.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  const setDurationPreset = (seconds: number) => {
    const event = new CustomEvent('setFieldValue', {
      detail: { durationSeconds: seconds },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="auction-form-container">
      <Title heading={4} style={{ marginBottom: 24 }}>
        发布新竞拍
      </Title>

      <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="auction-form-section">
          <div className="auction-form-section-title">商品信息</div>
          
          <Form.TextArea
            field="title"
            label="商品标题"
            placeholder="请输入商品标题"
            rules={[{ required: true, message: '请输入商品标题' }]}
            style={{ marginBottom: 20 }}
          />

          <Form.TextArea
            field="description"
            label="商品描述"
            placeholder="请输入商品详细描述"
            rules={[{ required: true, message: '请输入商品描述' }]}
            style={{ marginBottom: 20 }}
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
                  <IconUpload size={24} />
                  <Text type="tertiary" size="small">上传图片</Text>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="auction-form-section">
          <div className="auction-form-section-title">竞拍规则配置</div>
          
          <div className="auction-form-grid">
            <Form.InputNumber
              field="startPrice"
              label="起拍价"
              placeholder="0.00"
              prefix="¥"
              min={0}
              step={0.01}
              precision={2}
              rules={[
                { required: true, message: '请输入起拍价' },
                { type: 'number', min: 0, message: '起拍价不能为负数' },
              ]}
            />

            <Form.InputNumber
              field="minIncrement"
              label="最小加价幅度"
              placeholder="1.00"
              prefix="¥"
              min={0.01}
              step={0.01}
              precision={2}
              rules={[
                { required: true, message: '请输入最小加价幅度' },
                { type: 'number', min: 0.01, message: '加价幅度必须大于0' },
              ]}
            />

            <Form.InputNumber
              field="maxPrice"
              label="封顶价（可选）"
              placeholder="不设置封顶"
              prefix="¥"
              min={0}
              step={1}
              precision={2}
            />

            <Form.InputNumber
              field="autoExtendSeconds"
              label="延时时间"
              placeholder="15"
              suffix="秒"
              min={0}
              max={60}
              rules={[
                { type: 'number', min: 0, message: '延时时间不能为负数' },
                { type: 'number', max: 60, message: '延时时间不能超过60秒' },
              ]}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <Form.InputNumber
              field="durationSeconds"
              label="竞拍时长"
              placeholder="3600"
              suffix="秒"
              min={60}
              style={{ width: '100%' }}
              rules={[
                { required: true, message: '请输入竞拍时长' },
                { type: 'number', min: 60, message: '竞拍时长至少60秒' },
              ]}
            />
            <div className="duration-presets">
              <button
                type="button"
                className="duration-preset-btn"
                onClick={() => setDurationPreset(60)}
              >
                1分钟
              </button>
              <button
                type="button"
                className="duration-preset-btn"
                onClick={() => setDurationPreset(300)}
              >
                5分钟
              </button>
              <button
                type="button"
                className="duration-preset-btn"
                onClick={() => setDurationPreset(900)}
              >
                15分钟
              </button>
              <button
                type="button"
                className="duration-preset-btn"
                onClick={() => setDurationPreset(1800)}
              >
                30分钟
              </button>
              <button
                type="button"
                className="duration-preset-btn"
                onClick={() => setDurationPreset(3600)}
              >
                1小时
              </button>
              <button
                type="button"
                className="duration-preset-btn"
                onClick={() => setDurationPreset(7200)}
              >
                2小时
              </button>
            </div>
          </div>

          <Card style={{ marginTop: 24, background: '#f8f9fa' }}>
            <Title heading={6}>规则说明</Title>
            <ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 1.8 }}>
              <li>起拍价：用户出价的起始价格</li>
              <li>最小加价幅度：每次出价必须高于当前价格的最小增幅</li>
              <li>封顶价：竞拍最高价格限制（可选）</li>
              <li>延时时间：竞拍结束前有人出价时，自动延长的时间</li>
              <li>竞拍时长：竞拍持续的总时长</li>
            </ul>
          </Card>
        </div>

        <div className="auction-form-actions">
          <Button onClick={() => navigate('/auction/list')}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
          >
            发布竞拍
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AuctionCreate;
