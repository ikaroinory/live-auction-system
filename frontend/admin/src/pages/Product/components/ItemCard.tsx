import { Button, Card, Image, Skeleton, Space, Tag, Typography } from '@douyinfe/semi-ui'
import { Property } from 'csstype'

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
  capPrice?: number
  currentPrice?: number
  bidCount?: number
}

const ItemData: React.FC<ItemDataProps> = ({ startingPrice, fixedIncrement, capPrice, currentPrice, bidCount }) => {
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
      value: capPrice,
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

type ItemCardProps = { id: number } & Omit<ItemInformationProps, 'width'> & ItemDataProps

export const ItemCard: React.FC<ItemCardProps> = (props) => {
  return (
    <Card bodyStyle={{ display: 'flex', gap: 32 }}>
      <Typography.Text type="quaternary">{props.id}</Typography.Text>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', display: 'flex' }}>
          <ItemInformation width={500} name={props.name} image={props.image} tags={props.tags} />
          <ItemData
            startingPrice={props.startingPrice}
            fixedIncrement={props.fixedIncrement}
            capPrice={props.capPrice}
            currentPrice={props.currentPrice}
            bidCount={props.bidCount}
          />
        </div>
        <Space>
          <Button theme="outline" type="tertiary">
            开始竞拍
          </Button>
          <Button theme="outline" type="tertiary">
            下架
          </Button>
        </Space>
      </div>
    </Card>
  )
}
