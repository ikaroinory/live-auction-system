import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Form, Button, Typography, Toast, Slider, UploadProps } from '@douyinfe/semi-ui'
import { IconPlus } from '@douyinfe/semi-icons'
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
  images: UploadProps.FileItem[]
}

const formatDuration = (hours: number): string => {
  if (hours >= 24) {
    return `${Math.floor(hours / 24)}天${hours % 24 > 0 ? `${hours % 24}小时` : ''}`
  }
  return `${hours}小时`
}

const customUpload: UploadProps['customRequest'] = ({ file, onSuccess, onProgress, onError }) => {
  const reader = new FileReader()
  const fileInstance = file.fileInstance as Blob

  reader.onload = () => {
    const result = reader.result as string
    onSuccess?.({ url: result }, file as UploadProps.FileItem)
  }

  reader.onerror = (error) => {
    const errorResponse = { status: 500 }
    onError?.(errorResponse, error as ProgressEvent)
  }

  reader.readAsDataURL(fileInstance)

  onProgress?.({ total: 100, loaded: 50 }, file as UploadProps.FileItem)
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [durationHours, setDurationHours] = useState(2)
  const [autoExtendHours, setAutoExtendHours] = useState(1)

  const handleSubmit = async (values: FormValues) => {
    if (!values.images || values.images.length === 0) {
      Toast.error('请至少上传一张商品图片')
      return
    }

    setLoading(true)
    try {
      const productData: ProductFormData = {
        name: values.title.trim(),
        image: values.images[0]?.url || '',
        startingPrice: values.startPrice,
        fixedIncrement: values.minIncrement,
        capPrice: values.maxPrice,
        lateCompensation: values.tags?.includes('lateCompensation') || false,
        freeShipping: values.tags?.includes('freeShipping') || false,
        shippingInsurance: values.tags?.includes('shippingInsurance') || false,
        auction: values.tags?.includes('auction') || false
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

  const validator = async (values: FormValues) => {
    const errors: Partial<Record<keyof typeof values, string>> = {}

    if (!values.title) {
      errors.title = '请输入商品名称'
    }
    if (values.images.length < 1) {
      errors.images = '请至少上传一张商品图片'
    }
    if (!values.startPrice || values.startPrice < 0) {
      errors.startPrice = '请输入有效的起拍价'
    }
    if (!values.minIncrement || values.minIncrement < 0) {
      errors.minIncrement = '请输入有效的最小加价'
    }
    if (values.maxPrice && values.maxPrice <= values.startPrice) {
      errors.maxPrice = '封顶价必须大于起拍价'
    }

    return errors
  }

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
          tags: [],
          images: []
        }}
        validator={validator}
      >
        <FormCard title="商品信息">
          <Form.Input field="title" label={{ text: '商品名称', required: true }} placeholder="请输入商品名称" />

          <Form.Upload
            field="images"
            label={{ text: '商品图片（最多4张）', required: true }}
            listType="picture"
            accept=".jpg,.jpeg,.png"
            limit={4}
            maxSize={2 * 1024 * 1024}
            customRequest={customUpload}
          >
            <IconPlus size="extra-large" />
          </Form.Upload>

          <Form.CheckboxGroup field="tags" direction="horizontal" label="商品标签">
            <Form.Checkbox value="lateCompensation">晚发即赔</Form.Checkbox>
            <Form.Checkbox value="freeShipping">包邮</Form.Checkbox>
            <Form.Checkbox value="shippingInsurance">运费险</Form.Checkbox>
            <Form.Checkbox value="auction">竞拍</Form.Checkbox>
          </Form.CheckboxGroup>
        </FormCard>

        <FormCard title="竞拍规则配置">
          <Form.InputNumber
            field="startPrice"
            label={{ text: '起拍价', required: true }}
            prefix="¥"
            min={0}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
          />
          <Form.InputNumber
            field="minIncrement"
            label={{ text: '最小加价', required: true }}
            prefix="¥"
            min={0.01}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
          />
          <Form.InputNumber
            field="maxPrice"
            label="封顶价"
            prefix="¥"
            min={0}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
            placeholder="不设置则无上限"
          />
          <div className={styles.ruleConfigCard}>
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
        </FormCard>

        <div className={styles.auctionFormActions}>
          <Button onClick={() => navigate('/product/list')}>返回</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            添加商品
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ProductCreate
