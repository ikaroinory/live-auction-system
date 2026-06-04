import { useProductMutations } from '@/hooks'
import { IconMicrophone } from '@douyinfe/semi-icons'
import { Button, Card, Image, Skeleton, Space, Tag, Toast, Typography } from '@douyinfe/semi-ui'
import { Property } from 'csstype'
import { useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import { ProductStatus, ProductAuctionStatus, ProductTag } from '@/types'
import dayjs from 'dayjs'

interface AuctionStatusTagProps {
  status?: ProductAuctionStatus
  auctionEndTime?: string
}

const AuctionStatusTag: React.FC<AuctionStatusTagProps> = ({ status, auctionEndTime }) => {
  const getRemainingSeconds = () => Math.max(0, dayjs(auctionEndTime).diff(dayjs(), 'second'))

  const [remainingSeconds, setRemainingSeconds] = useState<number>(getRemainingSeconds)

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingSeconds()
      setRemainingSeconds(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [auctionEndTime])

  return (
    <>
      {status === ProductAuctionStatus.NOT_STARTED && <Tag color="yellow">未开始</Tag>}
      {status === ProductAuctionStatus.IN_PROGRESS && remainingSeconds > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(var(--semi-red-5), 0.15)',
            borderRadius: 'var(--semi-border-radius-small)'
          }}
        >
          <Tag
            style={{ color: 'var(--semi-color-danger)', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            color="red"
          >
            进行中
          </Tag>
          {auctionEndTime && (
            <div style={{ width: 60, display: 'flex', justifyContent: 'center' }}>
              <Typography.Text type="danger" size="small">
                {dayjs.duration(remainingSeconds, 'seconds').format('HH:mm:ss')}
              </Typography.Text>
            </div>
          )}
        </div>
      )}
      {(status === ProductAuctionStatus.ENDED ||
        (status === ProductAuctionStatus.IN_PROGRESS && remainingSeconds <= 0)) && <Tag color="green">已结束</Tag>}
    </>
  )
}

interface ItemInformationProps {
  width?: Property.Width<string | number>
  name?: string
  image?: string
  tags?: ProductTag[]
}

const ItemInformation: React.FC<ItemInformationProps> = (props) => {
  const hasTag = (tag: ProductTag) => props.tags?.includes(tag)

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
            {hasTag(ProductTag.LATE_COMPENSATION) && (
              <Tag size="small" color="white">
                晚发即赔
              </Tag>
            )}
            {hasTag(ProductTag.FREE_SHIPPING) && (
              <Tag size="small" color="white">
                包邮
              </Tag>
            )}
            {hasTag(ProductTag.SHIPPING_INSURANCE) && (
              <Tag size="small" color="white">
                运费险
              </Tag>
            )}
            {hasTag(ProductTag.AUCTION) && (
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
  auctionStatus?: ProductAuctionStatus
  refresh?: () => void
  isExplaining?: boolean
}

const ButtonGroup: React.FC<ButtonGroupProps> = (props) => {
  const navigate = useNavigate()
  const { deleteProduct, updateProductStatus, toggleExplaining, startAuction, endAuction } = useProductMutations()

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
    if (!props.productId) return

    try {
      await startAuction(props.productId)
      Toast.success('开始竞拍成功')
      props.refresh?.()
    } catch {
      Toast.error('开始竞拍失败，请稍后重试')
    }
  }

  const handleEndAuction = async () => {
    if (!props.productId) return

    try {
      await endAuction(props.productId)
      Toast.success('结束竞拍成功')
      props.refresh?.()
    } catch {
      Toast.error('结束竞拍失败，请稍后重试')
    }
  }

  const handlePublish = async () => {
    if (!props.productId) return

    try {
      await updateProductStatus(props.productId, ProductStatus.PUBLISHED)
      Toast.success('商品上架成功')
      props.refresh?.()
    } catch {
      Toast.error('上架失败，请稍后重试')
    }
  }

  const handleUnpublish = async () => {
    if (!props.productId) return

    try {
      await updateProductStatus(props.productId, ProductStatus.PENDING)
      Toast.success('商品下架成功')
      props.refresh?.()
    } catch {
      Toast.error('下架失败，请稍后重试')
    }
  }

  const handleToggleExplaining = async () => {
    if (!props.productId) return

    try {
      await toggleExplaining(props.productId)
      Toast.success('讲解状态已更新')
      props.refresh?.()
    } catch {
      Toast.error('操作失败，请稍后重试')
    }
  }

  const handleEdit = () => {
    if (!props.productId) return
    navigate(`/products/${props.productId}`)
  }

  return (
    <Space>
      {props.status === ProductStatus.PENDING && (
        <>
          <Button theme="outline" type="danger" onClick={handleRemove}>
            删除
          </Button>
          <Button theme="outline" type="tertiary" onClick={handleEdit}>
            编辑
          </Button>
        </>
      )}
      {props.status === ProductStatus.PENDING && (
        <Button theme="outline" type="tertiary" onClick={handlePublish}>
          上架
        </Button>
      )}
      {props.status === ProductStatus.PUBLISHED && (
        <Button
          theme="outline"
          type="tertiary"
          onClick={handleUnpublish}
          disabled={props.auctionStatus === ProductAuctionStatus.ENDED}
        >
          下架
        </Button>
      )}
      {props.status === ProductStatus.PUBLISHED && (
        <>
          {props.auctionStatus !== ProductAuctionStatus.IN_PROGRESS && (
            <Button
              theme="outline"
              type="tertiary"
              onClick={handleStartAuction}
              disabled={props.auctionStatus === ProductAuctionStatus.ENDED}
            >
              开始竞拍
            </Button>
          )}
          {props.auctionStatus === ProductAuctionStatus.IN_PROGRESS && (
            <Button theme="outline" type="warning" onClick={handleEndAuction}>
              结束竞拍
            </Button>
          )}
          <Button
              theme="outline"
              type={props.isExplaining ? 'danger' : 'tertiary'}
              icon={<IconMicrophone />}
              onClick={handleToggleExplaining}
            >
              {props.isExplaining ? '结束讲解' : '开始讲解'}
            </Button>
        </>
      )}
    </Space>
  )
}

type ItemCardProps = { id: number } & Omit<ItemInformationProps, 'width'> & ItemDataProps & ButtonGroupProps

export const ItemCard: React.FC<ItemCardProps> = (props) => {
  return (
    <Card style={{ width: '100%' }} bodyStyle={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography.Text type="quaternary">{props.id}</Typography.Text>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ width: '100%', display: 'flex' }}>
          <ItemInformation width={460} name={props.name} image={props.image} tags={props.tags} />
          <ItemData
            startingPrice={props.startingPrice}
            fixedIncrement={props.fixedIncrement}
            maxPrice={props.maxPrice}
            currentPrice={props.currentPrice}
            bidCount={props.bidCount}
          />
        </div>
        {props.status === ProductStatus.PUBLISHED && (
          <AuctionStatusTag status={props.auctionStatus} auctionEndTime={props.auctionEndTime} />
        )}
        <ButtonGroup
          productId={props.productId}
          status={props.status}
          auctionStatus={props.auctionStatus}
          refresh={props.refresh}
          isExplaining={props.isExplaining}
        />
      </div>
    </Card>
  )
}
