import React, { useState, useEffect, useRef } from 'react'
import { Button, Tabs, Toast } from '@douyinfe/semi-ui'
import { Typography } from '@douyinfe/semi-ui'
import { useNavigate } from 'react-router'
import ProductTabContent, { LoadingStatus } from './components/ProductTabContent'
import { ProductItem, ProductTagType } from './types'
import { productService } from '@/services'
import type { Product } from '@/types'

const { Title } = Typography

const ProductList: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('live')
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>([])
  const [pendingProducts, setPendingProducts] = useState<ProductItem[]>([])
  const [liveLoadingStatus, setLiveLoadingStatus] = useState<LoadingStatus>('loading')
  const [pendingLoadingStatus, setPendingLoadingStatus] = useState<LoadingStatus>('loading')
  const [liveErrorMessage, setLiveErrorMessage] = useState<string>('')
  const [pendingErrorMessage, setPendingErrorMessage] = useState<string>('')

  const convertProductToItem = (product: Product): ProductItem => {
    const tags: ProductTagType[] = []
    if (product.lateCompensation) tags.push(ProductTagType.LateCompensation)
    if (product.freeShipping) tags.push(ProductTagType.FreeShipping)
    if (product.shippingInsurance) tags.push(ProductTagType.ShippingInsurance)
    if (product.auction) tags.push(ProductTagType.Auction)
    return {
      id: product.id,
      name: product.name,
      image: product.image,
      tags,
      startingPrice: Number(product.startingPrice),
      fixedIncrement: Number(product.fixedIncrement),
      capPrice: product.capPrice ? Number(product.capPrice) : undefined,
      bidCount: 0,
      status: product.status,
      lateCompensation: product.lateCompensation,
      freeShipping: product.freeShipping,
      shippingInsurance: product.shippingInsurance,
      auction: product.auction
    }
  }

  const fetchLiveProductsRef = useRef(async (): Promise<void> => {
    setLiveLoadingStatus('loading')
    try {
      const result = await productService.getList({ status: 1 })
      const products = result.list.map(convertProductToItem)
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
      const result = await productService.getList({ status: 0 })
      const products = result.list.map(convertProductToItem)
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
    fetchLiveProductsRef.current()
    fetchPendingProductsRef.current()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title heading={3}>商品管理</Title>
        <Button type="primary" onClick={() => navigate('/product/create')}>
          添加商品
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="直播商品" itemKey="live">
          <ProductTabContent
            dataSource={liveProducts}
            loadingStatus={liveLoadingStatus}
            errorMessage={liveErrorMessage}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="待上架商品" itemKey="pending">
          <ProductTabContent
            dataSource={pendingProducts}
            loadingStatus={pendingLoadingStatus}
            errorMessage={pendingErrorMessage}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default ProductList
