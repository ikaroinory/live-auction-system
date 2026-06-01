import { useState, useMemo } from 'react'
import { Tabs, Space } from '@douyinfe/semi-ui'
import { Typography } from '@douyinfe/semi-ui'
import ProductTabContent, { LoadingStatus } from './components/ProductTabContent'
import { ProductItem, ProductTagType } from './types'
import { useProductList } from '@/hooks'
import type { Product } from '@/types'
import { useSearchParams } from 'react-router'
import { ProductStatus } from '@/types'

const { Title } = Typography

const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState('')

  const activeTab = searchParams.get('tab') || 'live'

  const { data: liveProductsData, isLoading: liveIsLoading, error: liveError } = useProductList({
    status: ProductStatus.PUBLISHED
  })

  const { data: pendingProductsData, isLoading: pendingIsLoading, error: pendingError } = useProductList({
    status: ProductStatus.PENDING
  })

  const convertProductToItem = (product: Product, index: number): ProductItem => {
    const tags: ProductTagType[] = []
    if (product.lateCompensation) tags.push(ProductTagType.LateCompensation)
    if (product.freeShipping) tags.push(ProductTagType.FreeShipping)
    if (product.shippingInsurance) tags.push(ProductTagType.ShippingInsurance)
    if (product.auction) tags.push(ProductTagType.Auction)
    return {
      id: index + 1,
      productId: product.id,
      name: product.name,
      image: product.image,
      tags,
      startingPrice: Number(product.startingPrice),
      fixedIncrement: Number(product.fixedIncrement),
      maxPrice: product.maxPrice ? Number(product.maxPrice) : undefined,
      currentPrice: product.currentBidPrice,
      bidCount: product.bidCount,
      status: product.status,
      lateCompensation: product.lateCompensation,
      freeShipping: product.freeShipping,
      shippingInsurance: product.shippingInsurance,
      auction: product.auction,
      isExplaining: product.isExplaining,
      auctionStatus: product.auctionStatus,
      auctionStartTime: product.auctionStartTime,
      auctionEndTime: product.auctionEndTime
    }
  }

  const liveProducts = useMemo(() => {
    if (!liveProductsData?.list) return []
    return liveProductsData.list.map((product, index) => convertProductToItem(product, index))
  }, [liveProductsData])

  const pendingProducts = useMemo(() => {
    if (!pendingProductsData?.list) return []
    return pendingProductsData.list.map((product, index) => convertProductToItem(product, index))
  }, [pendingProductsData])

  const liveLoadingStatus: LoadingStatus = liveIsLoading ? 'loading' : liveError ? 'error' : 'success'
  const pendingLoadingStatus: LoadingStatus = pendingIsLoading ? 'loading' : pendingError ? 'error' : 'success'

  const liveErrorMessage = liveError ? '获取直播商品失败，请稍后重试' : ''
  const pendingErrorMessage = pendingError ? '获取待上架商品失败，请稍后重试' : ''

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab })
  }

  const filteredLiveProducts = liveProducts.filter(
    (item) => item.name?.toLowerCase().includes(searchValue.toLowerCase()) || String(item.id).includes(searchValue)
  )

  const filteredPendingProducts = pendingProducts.filter(
    (item) => item.name?.toLowerCase().includes(searchValue.toLowerCase()) || String(item.id).includes(searchValue)
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={4}>商品管理</Title>
        <Space />
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <Tabs.TabPane tab="直播商品" itemKey="live">
          <ProductTabContent
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            dataSource={filteredLiveProducts}
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