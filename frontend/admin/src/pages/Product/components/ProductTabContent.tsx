import React, { useState } from 'react'
import { Button, Input, Checkbox, Space, Spin, Empty } from '@douyinfe/semi-ui'
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
}

const ProductTabContent: React.FC<ProductTabContentProps> = ({
  searchValue,
  onSearchChange,
  dataSource,
  loadingStatus = 'success',
  errorMessage
}) => {
  const navigate = useNavigate()
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])

  const isAllSelected = dataSource.length > 0 && selectedKeys.length === dataSource.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(dataSource.map((item) => item.id))
    } else {
      setSelectedKeys([])
    }
  }

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
            <ItemCard key={item.id} {...item} />
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
          <Checkbox
            style={{ marginRight: 8 }}
            checked={isAllSelected}
            indeterminate={selectedKeys.length > 0 && !isAllSelected}
            onChange={handleSelectAll}
          >
            全选
          </Checkbox>
          <Input
            placeholder="请搜索商品名称或ID"
            value={searchValue}
            onChange={onSearchChange}
            style={{ width: 300 }}
          />
          <Button theme="outline" icon={<IconFilter />}>
            筛选
          </Button>
        </div>
        <Button icon={<IconPlus />} onClick={() => navigate('/product/create')} theme="solid">
          添加商品
        </Button>
      </div>
      {renderContent()}
    </>
  )
}

export default ProductTabContent
export { type ProductItem, ProductTagType }
