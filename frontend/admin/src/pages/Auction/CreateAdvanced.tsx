import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Typography, Toast, Divider } from '@douyinfe/semi-ui';
import { auctionService } from '@/services';
import RuleForm from '@/components/Form/RuleForm';
import type { AuctionFormData, RuleConfig } from '@/types';
import styles from './Create.module.scss';

const { Title, Text } = Typography;

interface FormValues {
  title?: string;
  description?: string;
  startPrice?: number;
  minIncrement?: number;
  maxPrice?: number;
  durationSeconds?: number;
}

const AuctionCreateAdvanced: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [basicRule, setBasicRule] = useState<Partial<RuleConfig>>({
    enableAutoExtend: true,
    autoExtendSeconds: 15
  });

  const handleImageUpload = () => {
    const url = prompt('请输入图片URL:');
    if (url && images.length < 4) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRuleChange = (values: Partial<RuleConfig>) => {
    setBasicRule({ ...basicRule, ...values });
  };

  const validateForm = (values: FormValues): string | null => {
    if (!values.title || values.title.trim() === '') {
      return '请输入商品标题';
    }
    if (values.title.length > 100) {
      return '商品标题不能超过100个字符';
    }
    if (!values.description || values.description.trim() === '') {
      return '请输入商品描述';
    }
    if (images.length === 0) {
      return '请至少上传一张商品图片';
    }
    if (values.startPrice !== undefined && values.startPrice < 0) {
      return '起拍价不能为负数';
    }
    if (!values.minIncrement || values.minIncrement <= 0) {
      return '最小加价幅度必须大于0';
    }
    if (values.maxPrice && values.startPrice && values.maxPrice <= values.startPrice) {
      return '封顶价必须大于起拍价';
    }
    if (values.maxPrice && basicRule.minIncrement && values.startPrice && values.maxPrice < values.startPrice + basicRule.minIncrement) {
      return '封顶价必须大于起拍价加最小加价幅度';
    }
    if (!values.durationSeconds || values.durationSeconds < 60) {
      return '竞拍时长至少60秒';
    }
    return null;
  };

  const handleSubmit = async (values: FormValues) => {
    const error = validateForm(values);
    if (error) {
      Toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const formData: AuctionFormData = {
        title: values.title || '',
        description: values.description || '',
        images,
        startPrice: values.startPrice || 0,
        minIncrement: basicRule.minIncrement || values.minIncrement || 1,
        maxPrice: basicRule.maxPrice || values.maxPrice,
        durationSeconds: values.durationSeconds || 60,
        autoExtendSeconds: basicRule.enableAutoExtend ? basicRule.autoExtendSeconds || 15 : 0
      };

      await auctionService.create(formData);
      Toast.success('竞拍发布成功');
      navigate('/auction/list');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Toast.error(err.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.auctionFormContainer}>
      <Title heading={4} style={{ marginBottom: 24 }}>
        发布新竞拍
      </Title>

      <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className={styles.auctionFormSection}>
          <div className={styles.auctionFormSectionTitle}>基本信息</div>

          <Form.TextArea
            field="title"
            label="商品标题"
            placeholder="请输入商品标题，简洁明了，突出商品特点"
            rules={[
              { required: true, message: '请输入商品标题' },
              { maxLength: 100, message: '标题不能超过100个字符' }
            ]}
            style={{ marginBottom: 20 }}
            showCharCount
            maxLength={100}
          />

          <Form.TextArea
            field="description"
            label="商品描述"
            placeholder="请详细描述商品的品牌、规格、材质等信息"
            rules={[
              { required: true, message: '请输入商品描述' },
              { minLength: 10, message: '描述至少需要10个字符' }
            ]}
            style={{ marginBottom: 20 }}
            rows={4}
          />

          <Form.Label>
            商品图片{' '}
            <Text type="tertiary" size="small">
              （最多4张，第一张为主图）
            </Text>
          </Form.Label>
          <div className={styles.imageUploadGrid}>
            {images.map((url, index) => (
              <div key={index} className={styles.imageUploadItem}>
                <img src={url} alt={`商品图片 ${index + 1}`} />
                {index === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      background: 'var(--semi-color-primary)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12
                    }}
                  >
                    主图
                  </div>
                )}
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
              <div className={styles.imageUploadItem} onClick={handleImageUpload}>
                <div className={styles.imageUploadPlaceholder}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <Text type="tertiary" size="small">
                    上传图片
                  </Text>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.auctionFormSection}>
          <div className={styles.auctionFormSectionTitle}>价格规则</div>

          <div className={styles.auctionFormGrid}>
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
                { type: 'number', min: 0, message: '起拍价不能为负数' }
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
              initValue={basicRule.minIncrement}
              onChange={(value) => handleRuleChange({ minIncrement: value })}
              rules={[
                { required: true, message: '请输入最小加价幅度' },
                { type: 'number', min: 0.01, message: '加价幅度必须大于0' }
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
              initValue={basicRule.maxPrice}
              onChange={(value) => handleRuleChange({ maxPrice: value })}
              style={{ gridColumn: '1 / -1' }}
            />
          </div>
        </div>

        <div className={styles.auctionFormSection}>
          <div className={styles.auctionFormSectionTitle}>时间规则</div>

          <Form.InputNumber
            field="durationSeconds"
            label="竞拍时长"
            placeholder="3600"
            suffix="秒"
            min={60}
            style={{ width: '100%', marginBottom: 12 }}
            rules={[
              { required: true, message: '请输入竞拍时长' },
              { type: 'number', min: 60, message: '竞拍时长至少60秒' }
            ]}
          />
          <div className={styles.durationPresets}>
            <button type="button" className={styles.durationPresetBtn}>
              1分钟
            </button>
            <button type="button" className={styles.durationPresetBtn}>
              5分钟
            </button>
            <button type="button" className={styles.durationPresetBtn}>
              15分钟
            </button>
            <button type="button" className={styles.durationPresetBtn}>
              30分钟
            </button>
            <button type="button" className={styles.durationPresetBtn}>
              1小时
            </button>
            <button type="button" className={styles.durationPresetBtn}>
              2小时
            </button>
          </div>

          <Divider style={{ margin: '24px 0' }} />

          <RuleForm initialValues={basicRule} onValuesChange={handleRuleChange} />
        </div>

        <div className={styles.auctionFormSection}>
          <Card style={{ background: 'var(--semi-color-warning-light)', border: '1px solid var(--semi-color-warning)' }}>
            <Title heading={6} style={{ color: 'var(--semi-color-warning)', marginBottom: 12 }}>
              发布前检查
            </Title>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: 'var(--semi-color-warning)' }}>
              <li>确认商品信息填写完整准确</li>
              <li>确认至少上传一张商品图片</li>
              <li>确认竞拍规则设置合理</li>
              <li>发布后可在列表中查看和编辑</li>
            </ul>
          </Card>
        </div>

        <div className={styles.auctionFormActions}>
          <Button onClick={() => navigate('/auction/list')}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            发布竞拍
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AuctionCreateAdvanced;
