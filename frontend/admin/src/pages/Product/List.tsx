import React, { useState, useEffect, useRef } from 'react'
import { Button, Tabs, Space, Toast } from '@douyinfe/semi-ui'
import { Typography } from '@douyinfe/semi-ui'
import { IconArrowUp, IconFilter, IconMore } from '@douyinfe/semi-icons'
import { useNavigate } from 'react-router'
import ProductTabContent, { LoadingStatus } from './components/ProductTabContent'
import { ProductItem, ProductTagType } from './types'
import { auctionService } from '@/services'
import type { Auction } from '@/types'

const { Title } = Typography

const ProductList: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('live')
  const [searchValue, setSearchValue] = useState('')
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>([])
  const [pendingProducts, setPendingProducts] = useState<ProductItem[]>([])
  const [liveLoadingStatus, setLiveLoadingStatus] = useState<LoadingStatus>('loading')
  const [pendingLoadingStatus, setPendingLoadingStatus] = useState<LoadingStatus>('loading')
  const [liveErrorMessage, setLiveErrorMessage] = useState<string>('')
  const [pendingErrorMessage, setPendingErrorMessage] = useState<string>('')

  const convertAuctionToProductItem = (auction: Auction): ProductItem => ({
    id: auction.id,
    name: auction.title,
    image: auction.images?.[0],
    tags: [ProductTagType.LateCompensation, ProductTagType.FreeShipping, ProductTagType.ShippingInsurance, ProductTagType.Auction],
    startingPrice: auction.startPrice,
    fixedIncrement: auction.minIncrement,
    capPrice: auction.maxPrice,
    currentPrice: auction.finalPrice,
    bidCount: 0,
    status: auction.status
  })

  const fetchLiveProductsRef = useRef(async (): Promise<void> => {
    setLiveLoadingStatus('loading')
    try {
      const result = await auctionService.getList({ status: 1 })
      const products = result.list.map(convertAuctionToProductItem)
      setLiveProducts(products)
      setLiveLoadingStatus('success')
      setLiveErrorMessage('')
    } catch (error) {
      console.error('Failed to fetch live products:', error)
      setLiveLoadingStatus('error')
      setLiveErrorMessage('获取直播商品失败，请稍后重试')
      Toast.error('获取直播商品失败')
    }
  })

  const fetchPendingProductsRef = useRef(async (): Promise<void> => {
    setPendingLoadingStatus('loading')
    try {
      const result = await auctionService.getList({ status: 0 })
      const products = result.list.map(convertAuctionToProductItem)
      setPendingProducts(products)
      setPendingLoadingStatus('success')
      setPendingErrorMessage('')
    } catch (error) {
      console.error('Failed to fetch pending products:', error)
      setPendingLoadingStatus('error')
      setPendingErrorMessage('获取待上架商品失败，请稍后重试')
      Toast.error('获取待上架商品失败')
    }
  })

  useEffect(() => {
    let isMounted = true
    const fetchData = async (): Promise<void> => {
      if (activeTab === 'live') {
        await fetchLiveProductsRef.current()
      } else {
        await fetchPendingProductsRef.current()
      }
    }
    if (isMounted) {
      void fetchData()
    }
    return () => {
      isMounted = false
    }
  }, [activeTab])

  const handleRefresh = async (): Promise<void> => {
    if (activeTab === 'live') {
      await fetchLiveProductsRef.current()
    } else {
      await fetchPendingProductsRef.current()
    }
    Toast.success('刷新成功')
  }

  const filteredLiveProducts = liveProducts.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      String(item.id).includes(searchValue)
  )

  const filteredPendingProducts = pendingProducts.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      String(item.id).includes(searchValue)
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={4}>商品管理</Title>
        <Space>
          <Button theme="borderless" icon={<IconArrowUp />} onClick={handleRefresh}>
            刷新列表
          </Button>
          <Button theme="borderless" icon={<IconFilter />}>
            查看分组
          </Button>
          <Button theme="borderless" icon={<IconMore />}>
            搭配管理
          </Button>
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="直播商品" itemKey="live">
          <ProductTabContent
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            dataSource={filteredLiveProducts}
            showAddButton
            onAddClick={() => navigate('/product/create')}
            loadingStatus={liveLoadingStatus}
            errorMessage={liveErrorMessage}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="待上架商品" itemKey="pending">
          <ProductTabContent
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            dataSource={filteredPendingProducts}
            loadingStatus={pendingLoadingStatus}
            errorMessage={pendingErrorMessage}
          />
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}

export default ProductList
