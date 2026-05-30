import { useProductMutations } from '@/hooks'
import { IconMicrophone, IconEdit, IconUpload, IconMinusCircle } from '@douyinfe/semi-icons'
import { Button, Card, Image, Skeleton, Space, Tag, Toast, Typography } from '@douyinfe/semi-ui'
import { Property } from 'csstype'
import { useNavigate } from 'react-router'
import { ProductStatus } from '@/types'

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
  status?: ProductStatus
  onStatusChange?: () => void
}

const ButtonGroup: React.FC<ButtonGroupProps> = (props) => {
  const navigate = useNavigate()
  const { deleteProduct, updateProductStatus } = useProductMutations()

  const handleRemove = async () => {
    if (!props.productId) return

    try {
      await deleteProduct(props.productId)
      Toast.success('商品删除成功')
    } catch {
      Toast.error('删除失败，请稍后重试')
    }
  }

  const handleStartAuction = async () => {
    Toast.info('功能开发中')
  }

  const handlePublish = async () => {
    if (!props.productId) return

    try {
      await updateProductStatus(props.productId, ProductStatus.Published)
      Toast.success('商品上架成功')
      props.onStatusChange?.()
    } catch {
      Toast.error('上架失败，请稍后重试')
    }
  }

  const handleUnpublish = async () => {
    if (!props.productId) return

    try {
      await updateProductStatus(props.productId, ProductStatus.Pending)
      Toast.success('商品下架成功')
      props.onStatusChange?.()
    } catch {
      Toast.error('下架失败，请稍后重试')
    }
  }

  const handleEdit = () => {
    if (!props.productId) return
    navigate(`/product/${props.productId}`)
  }

  return (
    <Space>
      <Button theme="outline" type="danger" onClick={handleRemove}>
        删除
      </Button>
      <Button theme="outline" type="tertiary" icon={<IconEdit />} onClick={handleEdit}>
        编辑
      </Button>
      {props.status === ProductStatus.Pending ? (
        <Button theme="solid" type="primary" icon={<IconUpload />} onClick={handlePublish}>
          上架
        </Button>
      ) : (
        <Button theme="outline" type="warning" icon={<IconMinusCircle />} onClick={handleUnpublish}>
          下架
        </Button>
      )}
      {props.status === ProductStatus.Published && (
        <Button theme="outline" type="tertiary" onClick={handleStartAuction}>
          开始竞拍
        </Button>
      )}
      {props.status === ProductStatus.Published && (
        <Button theme="outline" type="tertiary" icon={<IconMicrophone />}>
          讲解
        </Button>
      )}
    </Space>
  )
}

type ItemCardProps = {
  id: number
  productId?: string
  status?: ProductStatus
  onStatusChange?: () => void
} & Omit<ItemInformationProps, 'width'> &
  ItemDataProps

export const ItemCard: React.FC<ItemCardProps> = (props) => {
  return (
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
        <ButtonGroup productId={props.productId} status={props.status} onStatusChange={props.onStatusChange} />
      </div>
    </Card>
  )
}
