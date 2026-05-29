import React, { useState } from 'react'
import { Button, Input, Checkbox, Space, Spin, Empty } from '@douyinfe/semi-ui'
import { IconFilter, IconPlus } from '@douyinfe/semi-icons'
import { ItemCard } from './ItemCard'
import { ProductItem, ProductTagType } from '../types'

export type LoadingStatus = 'loading' | 'success' | 'error'

export interface ProductTabContentProps {
  searchValue: string
  onSearchChange: (value: string) => void
  dataSource: ProductItem[]
  showAddButton?: boolean
  onAddClick?: () => void
  loadingStatus?: LoadingStatus
  errorMessage?: string
}

const ProductTabContent: React.FC<ProductTabContentProps> = ({
  searchValue,
  onSearchChange,
  dataSource,
  showAddButton = false,
  onAddClick,
  loadingStatus = 'success',
  errorMessage
}) => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])

  const isAllSelected = dataSource.length > 0 && selectedKeys.length === dataSource.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(dataSource.map((item) => item.id))
    } else {
      setSelectedKeys([])
    }
  }

  const handleStartAuction = (id: number) => {
    console.log('Start auction for product:', id)
  }

  const handleRemove = (id: number) => {
    console.log('Remove product:', id)
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
      return (
        <Empty
          description={errorMessage || '加载失败，请稍后重试'}
          style={{ padding: 48 }}
        />
      )
    }

    if (dataSource.length === 0) {
      return <Empty description="暂无商品数据" style={{ padding: 48 }} />
    }

    return (
      <Space vertical spacing={12}>
        {dataSource.map((item) => (
          <ItemCard
            key={item.id}
            data={item}
            onStartAuction={handleStartAuction}
            onRemove={handleRemove}
          />
        ))}
      </Space>
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
          />
          <span style={{ color: '#999', fontSize: 14 }}>全选</span>
          <Input
            placeholder="请搜索商品名称或ID"
            value={searchValue}
            onChange={onSearchChange}
            style={{ width: 300 }}
          />
          <Button size="small" theme="borderless" icon={<IconFilter />}>
            筛选
          </Button>
        </div>
        {showAddButton && onAddClick && (
          <Button icon={<IconPlus />} onClick={onAddClick}>
            添加商品
          </Button>
        )}
      </div>
      {renderContent()}
    </>
  )
}

export default ProductTabContent
export { type ProductItem, ProductTagType }
