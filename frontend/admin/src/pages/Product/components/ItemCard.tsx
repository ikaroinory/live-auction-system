import React, { useState } from 'react'
import { useProductMutations } from '@/hooks'
import { IconMicrophone, IconEdit } from '@douyinfe/semi-icons'
import { Button, Card, Image, Skeleton, Space, Tag, Toast, Typography, Modal, Form, UploadProps } from '@douyinfe/semi-ui'
import { Property } from 'csstype'
import type { ProductFormData } from '@/types'
import { FileItem } from '@douyinfe/semi-ui/lib/es/upload'

interface ItemInformationProps {
  width?: Property.Width<string | number>
  name?: string
  image?: string
  lateCompensation?: boolean
  freeShipping?: boolean
  shippingInsurance?: boolean
  auction?: boolean
}

const ItemInformation: React.FC<ItemInformationProps> = (props) => {
  return (
    <Space style={{ width: props.width }} align="center">
      <Image width={64} height={64} src={props.image} />
      <Space vertical align="start" spacing={4}>
        <Skeleton
          placeholder={<Skeleton.Paragraph rows={2} style={{ width: 80 }} />}
          loading={props.name === undefined}
        >
          <Typography.Text>{props.name}</Typography.Text>
          <Space style={{ height: 20 }}>
            {props.lateCompensation && (
              <Tag size="small" color="white">
                晚发即赔
              </Tag>
            )}
            {props.freeShipping && (
              <Tag size="small" color="white">
                包邮
              </Tag>
            )}
            {props.shippingInsurance && (
              <Tag size="small" color="white">
                运费险
              </Tag>
            )}
            {props.auction && (
              <Tag size="small" color="red" type="solid">
                竞拍
              </Tag>
            )}
          </Space>
        </Skeleton>
      </Space>
    </Space>
  )
}

interface ItemDataProps {
  startingPrice?: number
  fixedIncrement?: number
  maxPrice?: number
  currentPrice?: number
  bidCount?: number
}

const ItemData: React.FC<ItemDataProps> = ({ startingPrice, fixedIncrement, maxPrice, currentPrice, bidCount }) => {
  const parseCurrency = (value: string): string =>
    Number(value) ? '¥' + value.replace(/(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,') : value
  const parseNumber = (value: string): string =>
    Number(value) ? value.replace(/(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,') : value

  const parseParser = (type: 'currency' | 'number') => (type === 'currency' ? parseCurrency : parseNumber)

  const items: { name: string; value: number | undefined; type: 'currency' | 'number' }[] = [
    {
      name: '起拍价',
      value: startingPrice,
      type: 'currency'
    },
    {
      name: '固定加价',
      value: fixedIncrement,
      type: 'currency'
    },
    {
      name: '封顶价',
      value: maxPrice,
      type: 'currency'
    },
    {
      name: '成交金额',
      value: currentPrice,
      type: 'currency'
    },
    {
      name: '出价次数',
      value: bidCount,
      type: 'number'
    }
  ]

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {items.map((item) => (
        <Space key={item.name} style={{ width: 128 }} vertical spacing={4}>
          <Typography.Numeral strong parser={parseParser(item.type)}>
            {item.value ?? '-'}
          </Typography.Numeral>
          <Typography.Text type="tertiary">{item.name}</Typography.Text>
        </Space>
      ))}
    </div>
  )
}

interface ButtonGroupProps {
  productId?: string
  onEdit?: (product: Partial<ProductFormData & { name: string; image: string }>) => void
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ productId, onEdit }) => {
  const { deleteProduct } = useProductMutations()

  const handleStartAuction = async () => {
    Toast.info('功能开发中')
  }

  const handleRemove = async () => {
    if (!productId) return

    try {
      await deleteProduct(productId)
      Toast.success('商品下架成功')
    } catch {
      Toast.error('下架失败，请稍后重试')
    }
  }

  const handleEdit = () => {
    if (!productId) return
    onEdit?.({} as Partial<ProductFormData & { name: string; image: string }>)
  }

  return (
    <Space>
      <Button theme="outline" type="tertiary" onClick={handleEdit} icon={<IconEdit />}>
        编辑
      </Button>
      <Button theme="outline" type="tertiary" onClick={handleStartAuction}>
        开始竞拍
      </Button>
      <Button theme="outline" type="tertiary" onClick={handleRemove}>
        下架
      </Button>
      <Button theme="outline" type="tertiary" icon={<IconMicrophone />}>
        讲解
      </Button>
    </Space>
  )
}

interface EditModalProps {
  visible: boolean
  onClose: () => void
  initialValues: Partial<ItemCardProps>
  onSave: (values: EditFormValues) => void
}

interface EditFormValues {
  name: string
  image: string
  startingPrice: number
  fixedIncrement: number
  maxPrice?: number
  lateCompensation: boolean
  freeShipping: boolean
  shippingInsurance: boolean
  auction: boolean
}

const customUpload: UploadProps['customRequest'] = ({ file, onSuccess, onProgress }) => {
  const reader = new FileReader()
  const fileInstance = file.fileInstance as Blob

  reader.onload = () => {
    const result = reader.result as string
    onSuccess?.({ url: result }, file as UploadProps.FileItem)
  }

  reader.readAsDataURL(fileInstance)
  onProgress?.({ total: 100, loaded: 50 }, file as UploadProps.FileItem)
}

const EditModal: React.FC<EditModalProps> = ({ visible, onClose, initialValues, onSave }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: EditFormValues) => {
    setLoading(true)
    try {
      await onSave(values)
      Toast.success('商品编辑成功')
      onClose()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const errorMessage = err.response?.data?.message || err.message || '编辑失败，请稍后重试'
      Toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const validator = async (values: EditFormValues) => {
    const errors: Partial<Record<keyof typeof values, string>> = {}

    if (!values.name.trim()) {
      errors.name = '请输入商品名称'
    }

    if (!values.image) {
      errors.image = '请上传商品图片'
    }

    if (values.startingPrice === undefined || values.startingPrice < 0) {
      errors.startingPrice = '请输入有效的起拍价'
    }

    if (values.fixedIncrement === undefined || values.fixedIncrement < 0) {
      errors.fixedIncrement = '请输入有效的固定加价'
    }

    if (values.maxPrice !== undefined && values.maxPrice <= values.startingPrice) {
      errors.maxPrice = '封顶价必须大于起拍价'
    }

    return Object.keys(errors).length ? errors : ''
  }

  const tags = []
  if (initialValues.lateCompensation) tags.push('lateCompensation')
  if (initialValues.freeShipping) tags.push('freeShipping')
  if (initialValues.shippingInsurance) tags.push('shippingInsurance')
  if (initialValues.auction) tags.push('auction')

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      title="编辑商品"
      width={600}
      footer={null}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <Form
        onSubmit={handleSubmit}
        initValues={{
          name: initialValues.name || '',
          image: initialValues.image || '',
          startingPrice: initialValues.startingPrice || 0,
          fixedIncrement: initialValues.fixedIncrement || 10,
          maxPrice: initialValues.maxPrice,
          lateCompensation: initialValues.lateCompensation || false,
          freeShipping: initialValues.freeShipping || false,
          shippingInsurance: initialValues.shippingInsurance || false,
          auction: initialValues.auction || false,
          tags
        }}
        validator={validator}
      >
        <Form.Input
          field="name"
          label={{ text: '商品名称', required: true }}
          placeholder="请输入商品名称"
          style={{ width: '100%' }}
        />

        <Form.Upload
          field="image"
          label={{ text: '商品图片', required: true }}
          listType="picture"
          accept=".jpg,.jpeg,.png"
          limit={1}
          maxSize={2 * 1024 * 1024}
          customRequest={customUpload}
          initValue={initialValues.image ? [{ response: initialValues.image, name: '商品图片' } as unknown as FileItem] : []}
        />

        <Form.CheckboxGroup field="tags" direction="horizontal" label="商品标签">
          <Form.Checkbox value="lateCompensation">晚发即赔</Form.Checkbox>
          <Form.Checkbox value="freeShipping">包邮</Form.Checkbox>
          <Form.Checkbox value="shippingInsurance">运费险</Form.Checkbox>
          <Form.Checkbox value="auction">竞拍</Form.Checkbox>
        </Form.CheckboxGroup>

        <Form.InputNumber
          field="startingPrice"
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Button onClick={onClose}>取消</Button>
          <Button theme="solid" type="primary" htmlType="submit" loading={loading}>
            保存修改
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

type ItemCardProps = {
  id: number
  productId?: string
} & Omit<ItemInformationProps, 'width'> &
  ItemDataProps

export const ItemCard: React.FC<ItemCardProps> = (props) => {
  const [modalVisible, setModalVisible] = useState(false)
  const { updateProduct } = useProductMutations()

  const handleEdit = () => {
    setModalVisible(true)
  }

  const handleSave = async (values: EditFormValues) => {
    if (!props.productId) return

    const productData: ProductFormData = {
      name: values.name.trim(),
      image: values.image,
      startingPrice: values.startingPrice,
      fixedIncrement: values.fixedIncrement,
      maxPrice: values.maxPrice,
      lateCompensation: values.lateCompensation,
      freeShipping: values.freeShipping,
      shippingInsurance: values.shippingInsurance,
      auction: values.auction
    }

    await updateProduct(props.productId, productData)
  }

  return (
    <>
      <Card style={{ width: '100%' }} bodyStyle={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Text type="quaternary">{props.id}</Typography.Text>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', display: 'flex' }}>
            <ItemInformation
              width={460}
              name={props.name}
              image={props.image}
              lateCompensation={props.lateCompensation}
              freeShipping={props.freeShipping}
              shippingInsurance={props.shippingInsurance}
              auction={props.auction}
            />
            <ItemData
              startingPrice={props.startingPrice}
              fixedIncrement={props.fixedIncrement}
              maxPrice={props.maxPrice}
              currentPrice={props.currentPrice}
              bidCount={props.bidCount}
            />
          </div>
          <ButtonGroup productId={props.productId} onEdit={handleEdit} />
        </div>
      </Card>

      <EditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialValues={props}
        onSave={handleSave}
      />
    </>
  )
}