import { Button, Input, Space, Spin, Empty } from '@douyinfe/semi-ui'
import { IconFilter, IconPlus } from '@douyinfe/semi-icons'
import { ItemCard } from './ItemCard'
import { ProductItem, ProductTagType } from '../types'
import { useNavigate } from 'react-router'

export type LoadingStatus = 'loading' | 'success' | 'error'

export interface ProductTabContentProps {
  searchValue: string
  onSearchChange: (value: string) => void
  dataSource: ProductItem[]
  loadingStatus?: LoadingStatus
  errorMessage?: string
  onStatusChange?: () => void
  onRefreshExplaining?: () => void
}

const ProductTabContent: React.FC<ProductTabContentProps> = ({
  searchValue,
  onSearchChange,
  dataSource,
  loadingStatus = 'success',
  errorMessage,
  onStatusChange,
  onRefreshExplaining
}) => {
  const navigate = useNavigate()

  const renderContent = () => {
    if (loadingStatus === 'loading') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      )
    }

    if (loadingStatus === 'error') {
      return <Empty description={errorMessage || '加载失败，请稍后重试'} style={{ padding: 48 }} />
    }

    if (dataSource.length === 0) {
      return <Empty description="暂无商品数据" style={{ padding: 48 }} />
    }

    return (
      <div style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
        <Space style={{ width: '100%' }} vertical spacing={12}>
          {dataSource.map((item) => (
            <ItemCard key={item.id} {...item} refresh={onStatusChange} onRefreshExplaining={onRefreshExplaining} />
          ))}
        </Space>
      </div>
    )
  }

  return (
    <>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Input
            placeholder="请搜索商品名称或ID"
            value={searchValue}
            onChange={onSearchChange}
            style={{ width: 300 }}
          />
          <Button theme="outline" type="tertiary" icon={<IconFilter />}>
            筛选
          </Button>
        </div>
        <Button icon={<IconPlus />} onClick={() => navigate('/products/create')} theme="solid">
          添加商品
        </Button>
      </div>
      {renderContent()}
    </>
  )
}

export default ProductTabContent
export { type ProductItem, ProductTagType }
