import { useNavigate } from 'react-router'
import { Form, Button, Typography, Toast } from '@douyinfe/semi-ui'
import styles from './Create.module.scss'
import { productService } from '@/services'
import type { ProductFormData } from '@/types'
import { FormCard } from './components/FormCard'
import { IconPlus } from '@douyinfe/semi-icons'
import { customRequestArgs, FileItem } from '@douyinfe/semi-ui/lib/es/upload'
interface FormValues {
  title: string
  images: FileItem[]
  startPrice: number
  fixedIncrement: number
  maxPrice?: number
  durationHours: number
  autoExtendHours: number
  tags: string[]
  durationMinutes: number
  extendSeconds: number
}

const customUpload = ({ file, onSuccess, onProgress, onError }: customRequestArgs) => {
  const reader = new FileReader()
  const fileInstance = file.fileInstance as Blob

  reader.onload = () => {
    const result = reader.result as string
    onSuccess?.(result)
  }

  reader.onerror = (error) => {
    const errorResponse = { status: 500 }
    onError?.(errorResponse, error as ProgressEvent)
  }

  reader.readAsDataURL(fileInstance)

  onProgress?.({ total: 100, loaded: 50 })
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate()

  const handleSubmit = async (values: FormValues) => {
    try {
      const productData: ProductFormData = {
        name: values.title.trim(),
        image: values.images[0].response,
        startingPrice: values.startPrice,
        fixedIncrement: values.fixedIncrement,
        maxPrice: values.maxPrice,
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
    }
  }

  const validator = async (values: FormValues) => {
    const errors: Partial<Record<keyof typeof values, string>> = {}

    if (!values.title) {
      errors.title = '请输入商品名称'
    }

    if (values.images.length < 1) {
      errors.images = '请至少上传一张商品图片'
    }

    if (values.startPrice === undefined || values.startPrice < 0) {
      errors.startPrice = '请输入有效的起拍价'
    }

    if (values.fixedIncrement === undefined || values.fixedIncrement < 0) {
      errors.fixedIncrement = '请输入有效的最小加价'
    }

    if (values.maxPrice === undefined) {
      errors.maxPrice = '请输入有效的封顶价'
    } else if (values.maxPrice && values.maxPrice <= values.startPrice) {
      errors.maxPrice = '封顶价必须大于起拍价'
    }

    return Object.keys(errors).length ? errors : ''
  }

  return (
    <div className={styles.auctionFormContainer}>
      <Typography.Title heading={4} style={{ marginBottom: 24 }}>
        添加商品
      </Typography.Title>

      <Form
        onSubmit={handleSubmit}
        initValues={{
          title: '',
          images: [],
          startPrice: 0,
          fixedIncrement: 10,
          maxPrice: undefined,
          durationHours: 2,
          autoExtendHours: 1,
          tags: [],
          durationMinutes: 10,
          extendSeconds: 10
        }}
        validator={validator}
      >
        <FormCard title="商品信息">
          <Form.Input field="title" label={{ text: '商品名称', required: true }} placeholder="请输入商品名称" />

          <Form.Upload
            field="images"
            label={{ text: '商品图片', required: true }}
            listType="picture"
            accept=".jpg,.jpeg,.png"
            limit={1}
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
            field="fixedIncrement"
            label={{ text: '固定加价', required: true }}
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
          <Form.InputNumber
            field="durationMinutes"
            label={{ text: '竞拍时长', required: true }}
            suffix="分钟"
            min={1}
            step={1}
            precision={0}
            style={{ width: '100%' }}
          />
          <Form.InputNumber
            field="extendSeconds"
            label={{ text: '出价延时', required: true }}
            suffix="秒"
            min={10}
            max={30}
            step={1}
            precision={0}
            style={{ width: '100%' }}
          />
        </FormCard>

        <div className={styles.auctionFormActions}>
          <Button onClick={() => navigate('/product/list')}>返回</Button>
          <Button theme="solid" type="primary" htmlType="submit">
            添加商品
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ProductCreate
