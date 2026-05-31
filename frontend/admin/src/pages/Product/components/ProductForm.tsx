import { Button, Form, Space, Toast } from '@douyinfe/semi-ui'
import { FormCard } from './FormCard'
import { customRequestArgs, FileItem } from '@douyinfe/semi-ui/lib/es/upload'
import { Product, ProductFormData } from '@/types'
import { productService } from '@/services'
import { useNavigate, useParams } from 'react-router'
import { IconPlus } from '@douyinfe/semi-icons'
import { useProduct, useProductMutations } from '@/hooks'
import React from 'react'

type ImageItem = Partial<Omit<FileItem, 'response'>> & { response: { url: string } }

interface FormValues {
  title: string
  images: ImageItem[]
  startPrice: number
  fixedIncrement: number
  maxPrice?: number
  tags: string[]
  durationMinutes: number
  extendSeconds: number
}

interface ProductFormProps {
  product?: Product | null
}

const ProductForm: React.FC<ProductFormProps> = () => {
  const customUpload = ({ file, onSuccess, onProgress, onError }: customRequestArgs) => {
    const reader = new FileReader()
    const fileInstance = file.fileInstance as Blob

    reader.onload = () => {
      const result = reader.result as string
      onSuccess?.({ url: result })
    }

    reader.onerror = (error) => {
      const errorResponse = { status: 500 }
      onError?.(errorResponse, error as ProgressEvent)
    }

    reader.readAsDataURL(fileInstance)

    onProgress?.({ total: 100, loaded: 50 })
  }

  return (
    <>
      <FormCard title="商品信息">
        <Form.Input field="title" label={{ text: '商品名称', required: true }} placeholder="请输入商品名称" />

        <Form.Upload
          action=""
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
    </>
  )
}

export const ProductFormPage: React.FC = () => {
  const navigate = useNavigate()

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
      errors.fixedIncrement = '请输入有效的固定加价'
    }

    if (values.maxPrice && values.maxPrice <= values.startPrice) {
      errors.maxPrice = '封顶价必须大于起拍价'
    }

    return Object.keys(errors).length ? errors : ''
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      const productData: ProductFormData = {
        name: values.title.trim(),
        image: values.images[0].response.url,
        startingPrice: values.startPrice,
        fixedIncrement: values.fixedIncrement,
        maxPrice: values.maxPrice,
        lateCompensation: values.tags?.includes('lateCompensation') || false,
        freeShipping: values.tags?.includes('freeShipping') || false,
        shippingInsurance: values.tags?.includes('shippingInsurance') || false,
        auction: values.tags?.includes('auction') || false,
        durationMinutes: values.durationMinutes,
        extendSeconds: values.extendSeconds
      }

      await productService.create(productData)
      Toast.success('商品添加成功')
      navigate(-1)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = err.response?.data?.message || err.message || '添加失败，请稍后重试'
      Toast.error(errorMessage)
    }
  }

  return (
    <Form
      validator={validator}
      onSubmit={handleSubmit}
      initValues={{
        title: '',
        images: [],
        startPrice: 0,
        fixedIncrement: 10,
        maxPrice: undefined,
        tags: [],
        durationMinutes: 60,
        extendSeconds: 15
      }}
    >
      <ProductForm />

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={() => navigate(-1)}>返回</Button>
        <Button theme="solid" type="primary" htmlType="submit">
          添加商品
        </Button>
      </Space>
    </Form>
  )
}

export const ProductEditPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading } = useProduct(id)
  const { updateProduct } = useProductMutations()

  const validator = async (values: FormValues) => {
    const errors: Partial<Record<keyof typeof values, string>> = {}

    if (!values.title) {
      errors.title = '请输入商品名称'
    }

    if (values.images.length < 1 && !product?.image) {
      errors.images = '请至少上传一张商品图片'
    }

    if (values.startPrice === undefined || values.startPrice < 0) {
      errors.startPrice = '请输入有效的起拍价'
    }

    if (values.fixedIncrement === undefined || values.fixedIncrement < 0) {
      errors.fixedIncrement = '请输入有效的固定加价'
    }

    if (values.maxPrice && values.maxPrice <= values.startPrice) {
      errors.maxPrice = '封顶价必须大于起拍价'
    }

    return Object.keys(errors).length ? errors : ''
  }

  const handleSubmit = async (values: FormValues) => {
    if (!id) return

    try {
      const productData: Partial<ProductFormData> = {
        name: values.title.trim(),
        image: values.images.length > 0 ? values.images[0].response.url : product?.image,
        startingPrice: values.startPrice,
        fixedIncrement: values.fixedIncrement,
        maxPrice: values.maxPrice,
        lateCompensation: values.tags?.includes('lateCompensation') || false,
        freeShipping: values.tags?.includes('freeShipping') || false,
        shippingInsurance: values.tags?.includes('shippingInsurance') || false,
        auction: values.tags?.includes('auction') || false,
        durationMinutes: values.durationMinutes,
        extendSeconds: values.extendSeconds
      }

      await updateProduct(id, productData)
      Toast.success('商品更新成功')
      navigate(-1)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = err.response?.data?.message || err.message || '更新失败，请稍后重试'
      Toast.error(errorMessage)
    }
  }

  if (isLoading) {
    return <div>加载中...</div>
  }

  const tags: string[] = []
  if (product?.lateCompensation) tags.push('lateCompensation')
  if (product?.freeShipping) tags.push('freeShipping')
  if (product?.shippingInsurance) tags.push('shippingInsurance')
  if (product?.auction) tags.push('auction')

  return (
    <Form
      validator={validator}
      onSubmit={handleSubmit}
      initValues={{
        title: product?.name || '',
        images: product?.image ? [{ url: product.image, response: { url: product.image } } as ImageItem] : [],
        startPrice: product?.startingPrice || 0,
        fixedIncrement: product?.fixedIncrement || 10,
        maxPrice: product?.maxPrice,
        tags,
        durationMinutes: product?.durationMinutes || 60,
        extendSeconds: product?.extendSeconds || 15
      }}
    >
      <ProductForm />

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={() => navigate(-1)}>返回</Button>
        <Button theme="solid" type="primary" htmlType="submit">
          保存修改
        </Button>
      </Space>
    </Form>
  )
}
