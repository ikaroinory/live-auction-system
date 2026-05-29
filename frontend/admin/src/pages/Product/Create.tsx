import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Form, Button, Typography, Toast, Slider } from '@douyinfe/semi-ui'
import styles from './Create.module.scss'
import { productService } from '@/services'
import type { ProductFormData } from '@/types'
import { FormCard } from './components/FormCard'

const { Title, Text } = Typography

interface FormValues {
  title: string
  startPrice: number
  minIncrement: number
  maxPrice?: number
  durationHours: number
  autoExtendHours: number
  tags: string[]
}

const formatDuration = (hours: number): string => {
  if (hours >= 24) {
    return `${Math.floor(hours / 24)}天${hours % 24 > 0 ? `${hours % 24}小时` : ''}`
  }
  return `${hours}小时`
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [durationHours, setDurationHours] = useState(2)
  const [autoExtendHours, setAutoExtendHours] = useState(1)

  const handleImageUpload = () => {
    const url = prompt('请输入图片URL:')
    if (url && images.length < 4) {
      setImages([...images, url])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const validateForm = (values: FormValues): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!values.title || values.title.trim().length === 0) {
      errors.title = '请输入商品名称'
    }

    if (images.length === 0) {
      errors.images = '请至少上传一张商品图片'
    }

    if (!values.startPrice || values.startPrice <= 0) {
      errors.startPrice = '请输入有效的起拍价'
    }

    if (!values.minIncrement || values.minIncrement <= 0) {
      errors.minIncrement = '请输入有效的最小加价'
    }

    if (values.startPrice && values.minIncrement && values.minIncrement >= values.startPrice) {
      errors.minIncrement = '最小加价不能大于等于起拍价'
    }

    if (values.maxPrice && values.startPrice && values.maxPrice <= values.startPrice) {
      errors.maxPrice = '封顶价必须大于起拍价'
    }

    return errors
  }

  const handleSubmit = async (values: FormValues) => {
    const errors = validateForm(values)
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      Toast.error(firstError)
      return
    }

    setLoading(true)
    try {
      const productData: ProductFormData = {
        name: values.title.trim(),
        image: images[0] || '',
        tags: [],
        startingPrice: values.startPrice,
        fixedIncrement: values.minIncrement,
        capPrice: values.maxPrice,
        lateCompensation: values.tags.includes('lateCompensation'),
        freeShipping: values.tags.includes('freeShipping'),
        shippingInsurance: values.tags.includes('shippingInsurance'),
        auction: values.tags.includes('auction')
      }

      await productService.create(productData)
      Toast.success('商品添加成功')
      navigate('/product/list')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = err.response?.data?.message || err.message || '添加失败，请稍后重试'
      Toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const durationPresets = [
    { label: '1小时', value: 1 },
    { label: '2小时', value: 2 },
    { label: '4小时', value: 4 },
    { label: '8小时', value: 8 },
    { label: '24小时', value: 24 },
    { label: '48小时', value: 48 }
  ]

  const autoExtendPresets = [
    { label: '5分钟', value: 5 / 60 },
    { label: '15分钟', value: 15 / 60 },
    { label: '30分钟', value: 0.5 },
    { label: '1小时', value: 1 },
    { label: '2小时', value: 2 }
  ]

  return (
    <div className={styles.auctionFormContainer}>
      <Title heading={4} style={{ marginBottom: 24 }}>
        添加商品
      </Title>

      <Form
        onSubmit={handleSubmit}
        initValues={{
          title: '',
          startPrice: 100,
          minIncrement: 10,
          maxPrice: undefined,
          durationHours: 2,
          autoExtendHours: 1,
          tags: []
        }}
      >
        <FormCard title="商品信息">
          <Form.Input
            field="title"
            label="商品名称"
            placeholder="请输入商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
            style={{ marginBottom: 20 }}
          />

          <Form.Label>商品图片（最多4张）</Form.Label>
          {images.length === 0 && (
            <Text type="danger" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
              请至少上传一张商品图片
            </Text>
          )}
          <div className={styles.imageUploadGrid}>
            {images.map((url, index) => (
              <div key={index} className={styles.imageUploadItem}>
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

          <Form.CheckboxGroup field="tags" direction="horizontal" label="商品标签">
            <Form.Checkbox value="lateCompensation">晚发即赔</Form.Checkbox>
            <Form.Checkbox value="freeShipping">包邮</Form.Checkbox>
            <Form.Checkbox value="shippingInsurance">运费险</Form.Checkbox>
            <Form.Checkbox value="auction">竞拍</Form.Checkbox>
          </Form.CheckboxGroup>
        </FormCard>

        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>竞拍规则配置</div>

          <div className={styles.ruleConfigCard}>
            <div className={styles.ruleConfigRow}>
              <div className={styles.ruleConfigLabel}>起拍价</div>
              <div className={styles.ruleConfigInput}>
                <Form.InputNumber
                  field="startPrice"
                  prefix="¥"
                  min={0.01}
                  step={10}
                  precision={2}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className={styles.ruleConfigRow}>
              <div className={styles.ruleConfigLabel}>最小加价</div>
              <div className={styles.ruleConfigInput}>
                <Form.InputNumber
                  field="minIncrement"
                  prefix="¥"
                  min={1}
                  step={5}
                  precision={2}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className={styles.ruleConfigRow}>
              <div className={styles.ruleConfigLabel}>封顶价（可选）</div>
              <div className={styles.ruleConfigInput}>
                <Form.InputNumber
                  field="maxPrice"
                  prefix="¥"
                  min={0}
                  step={100}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="不设置则无上限"
                />
              </div>
            </div>

            <div className={styles.ruleConfigRow}>
              <div className={styles.ruleConfigLabel}>竞拍时长</div>
              <div className={styles.ruleConfigInput}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="tertiary" size="small">
                    当前设置：{formatDuration(durationHours)}
                  </Text>
                </div>
                <Slider
                  value={durationHours}
                  onChange={(value) => setDurationHours(value as number)}
                  min={1}
                  max={72}
                  step={1}
                />
                <div className={styles.durationPresets}>
                  {durationPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      size="small"
                      theme={durationHours === preset.value ? 'solid' : 'light'}
                      onClick={() => setDurationHours(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.ruleConfigRow}>
              <div className={styles.ruleConfigLabel}>延时周期</div>
              <div className={styles.ruleConfigInput}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="tertiary" size="small">
                    当前设置：有人出价时延时 {formatDuration(autoExtendHours)}
                  </Text>
                </div>
                <Slider
                  value={autoExtendHours}
                  onChange={(value) => setAutoExtendHours(value as number)}
                  min={5 / 60}
                  max={4}
                  step={5 / 60}
                />
                <div className={styles.durationPresets}>
                  {autoExtendPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      size="small"
                      theme={autoExtendHours === preset.value ? 'solid' : 'light'}
                      onClick={() => setAutoExtendHours(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.auctionFormActions}>
          <Button onClick={() => navigate('/product/list')}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            添加商品
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ProductCreate
