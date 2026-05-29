import { Button, Card, Image, Skeleton, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { TagProps } from '@douyinfe/semi-ui/lib/es/tag'
import { ProductItem, ProductTagType } from '../types'

interface ItemCardProps {
  data: ProductItem
  onStartAuction?: (id: number) => void
  onRemove?: (id: number) => void
}

const tagMapping: Record<ProductTagType, string | TagProps> = {
  [ProductTagType.LateCompensation]: { children: '晚发即赔', color: 'white' },
  [ProductTagType.FreeShipping]: { children: '包邮', color: 'white' },
  [ProductTagType.ShippingInsurance]: { children: '运费险', color: 'white' },
  [ProductTagType.Auction]: { children: '竞拍', color: 'red', type: 'solid' }
}

const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return '-'
  return `¥${price.toLocaleString('zh-CN')}`
}

const formatNumber = (num?: number): string => {
  if (num === undefined || num === null) return '-'
  return num.toLocaleString('zh-CN')
}

export const ItemCard: React.FC<ItemCardProps> = ({ data, onStartAuction, onRemove }) => {
  const { id, name, image, tags, startingPrice, fixedIncrement, capPrice, currentPrice, bidCount } = data

  return (
    <Card bodyStyle={{ display: 'flex', gap: 24, alignItems: 'center', padding: 16 }}>
      <Typography.Text type="quaternary" style={{ fontSize: 12, width: 40 }}>
        {String(id).padStart(3, '0')}
      </Typography.Text>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 380 }}>
        <Skeleton
          placeholder={<Skeleton.Image style={{ width: 64, height: 64, borderRadius: 8 }} />}
          loading={!image}
        >
          <Image
            width={64}
            height={64}
            src={image || ''}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            fallback="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=product%20placeholder%20image&image_size=square"
          />
        </Skeleton>

        <div style={{ flex: 1 }}>
          <Skeleton
            placeholder={<Skeleton.Paragraph rows={1} style={{ width: '100%' }} />}
            loading={!name}
          >
            <Typography.Text
              style={{
                fontSize: 14,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                maxWidth: 250
              }}
            >
              {name || '-'}
            </Typography.Text>
          </Skeleton>

          <Space style={{ marginTop: 8 }}>
            {tags?.map((tag, index) => (
              <Tag key={index} size="small" {...(typeof tagMapping[tag] === 'string' ? { children: tagMapping[tag] } : tagMapping[tag])} />
            ))}
          </Space>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 100 }}>
          <Typography.Text type="tertiary" style={{ fontSize: 12 }}>起拍价</Typography.Text>
          <Typography.Numeral style={{ fontSize: 14 }}>{formatPrice(startingPrice)}</Typography.Numeral>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 100 }}>
          <Typography.Text type="tertiary" style={{ fontSize: 12 }}>固定加价</Typography.Text>
          <Typography.Numeral style={{ fontSize: 14 }}>{formatPrice(fixedIncrement)}</Typography.Numeral>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 100 }}>
          <Typography.Text type="tertiary" style={{ fontSize: 12 }}>封顶价</Typography.Text>
          <Typography.Numeral style={{ fontSize: 14 }}>{formatPrice(capPrice)}</Typography.Numeral>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 100 }}>
          <Typography.Text type="tertiary" style={{ fontSize: 12 }}>当前出价</Typography.Text>
          <Typography.Numeral style={{ fontSize: 16, color: '#ff2d55', fontWeight: 600 }}>
            {formatPrice(currentPrice)}
          </Typography.Numeral>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 80 }}>
          <Typography.Text type="tertiary" style={{ fontSize: 12 }}>出价次数</Typography.Text>
          <Typography.Numeral style={{ fontSize: 14 }}>{formatNumber(bidCount)}</Typography.Numeral>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button theme="outline" type="primary" size="small" onClick={() => onStartAuction?.(id)}>
          开始竞拍
        </Button>
        <Button theme="outline" type="danger" size="small" onClick={() => onRemove?.(id)}>
          下架
        </Button>
      </div>
    </Card>
  )
}
