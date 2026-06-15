import { useState, useEffect } from 'react'
import { CloseIcon, ChevronLeftIcon } from '../../../../components/ui/icons'
import { formatPrice } from '../../../../utils/format'
import { Toast } from 'antd-mobile'
import styles from './ProductModal.module.scss'
import { clsx } from 'clsx'
import { Product } from '@live-auction/shared'
import { BidInput } from '../../../../components/BidInput'
import { useAuctionRoomStore } from '../../../../store/useAuctionRoomStore'
import { useUserStore } from '../../../../store/useUserStore'
import { websocketService } from '../../../../services/websocket'

interface ProductModalProps {
  visible: boolean
  onClose: () => void
  products: Product[]
  explainingProductId?: string | null
}

export const ProductModal = ({
  visible,
  onClose,
  products,
  explainingProductId,
}: ProductModalProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [localProducts, setLocalProducts] = useState<Product[]>([])
  const { setCurrentAuction, updatePrice, updateBidCount, bidCount, remainingMs } =
    useAuctionRoomStore()
  const { user } = useUserStore()

  useEffect(() => {
    Promise.resolve().then(() => {
      setLocalProducts(products)
    })
  }, [products])

  useEffect(() => {
    const handleProductUpdate = (payload: {
      roomId: string
      productId: string
      auctionStatus: string
    }) => {
      setLocalProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === payload.productId
            ? { ...product, auctionStatus: payload.auctionStatus as Product['auctionStatus'] }
            : product
        )
      )

      if (selectedProduct && selectedProduct.id === payload.productId) {
        setSelectedProduct((prev) =>
          prev
            ? { ...prev, auctionStatus: payload.auctionStatus as Product['auctionStatus'] }
            : null
        )
      }
    }

    websocketService.setOnProductUpdate(handleProductUpdate)

    return () => {
      websocketService.setOnProductUpdate(() => {})
    }
  }, [selectedProduct])

  useEffect(() => {
    if (selectedProduct && user?.id) {
      setCurrentAuction({
        id: selectedProduct.id,
        name: selectedProduct.name,
        startingPrice: Number(selectedProduct.startingPrice),
        fixedIncrement: Number(selectedProduct.fixedIncrement),
        maxPrice: selectedProduct.maxPrice ? Number(selectedProduct.maxPrice) : undefined,
        currentBidPrice: selectedProduct.currentBidPrice || 0,
        durationMinutes: selectedProduct.durationMinutes || 0,
        createdAt: selectedProduct.createdAt || new Date().toISOString(),
        updatedAt: selectedProduct.updatedAt || new Date().toISOString(),
      })
      updatePrice(selectedProduct.currentBidPrice || Number(selectedProduct.startingPrice))
      updateBidCount(selectedProduct.bidCount || 0)

      websocketService.joinRoom(selectedProduct.id, user.id)
    }
  }, [selectedProduct, setCurrentAuction, updatePrice, updateBidCount, user])

  const handleBidSuccess = () => {
    Toast.show('出价成功！')
  }

  const handleBidFailed = (reason: string) => {
    Toast.show(`出价失败: ${reason}`)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getStatusLabel = (product: Product) => {
    if (product.auctionStatus === 'IN_PROGRESS') {
      return '竞拍中'
    }
    if (product.auctionStatus === 'ENDED') {
      return '已结束'
    }
    return '即将开拍'
  }

  const getStatusClass = (product: Product) => {
    if (product.auctionStatus === 'IN_PROGRESS') {
      return styles.statusInProgress
    }
    if (product.auctionStatus === 'ENDED') {
      return styles.statusEnded
    }
    return styles.statusUpcoming
  }

  const handleSelectProduct = (product: Product) => {
    if (product.auctionStatus === 'IN_PROGRESS') {
      setSelectedProduct(product)
    } else {
      Toast.show('该商品尚未开始竞拍')
    }
  }

  const handleBackToList = () => {
    setSelectedProduct(null)
  }

  if (selectedProduct) {
    return (
      <>
        <div
          className={clsx(styles.productModalBackdrop, { [styles.visible]: visible })}
          onClick={handleBackdropClick}
        />
        <div className={clsx(styles.productModalContainer, { [styles.visible]: visible })}>
          <div className={styles.productModalHeader}>
            <button className={styles.productModalBack} onClick={handleBackToList}>
              <ChevronLeftIcon size={20} />
            </button>
            <div className={styles.productModalTitle}>商品出价</div>
            <button className={styles.productModalClose} onClick={onClose}>
              <CloseIcon size={16} />
            </button>
          </div>
          <div className={styles.productModalContent}>
            <div className={styles.bidProductInfo}>
              <div className={styles.bidProductImageWrapper}>
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className={styles.bidProductImage}
                  />
                ) : (
                  <div className={styles.noImagePlaceholder}>暂无图片</div>
                )}
              </div>
              <div className={styles.bidProductDetail}>
                <div className={styles.bidProductTitle}>{selectedProduct.name}</div>
                <div className={styles.bidProductPriceInfo}>
                  <span className={styles.bidProductCurrentLabel}>起拍价</span>
                  <span className={styles.bidProductCurrentPrice}>
                    {formatPrice(selectedProduct.startingPrice)}
                  </span>
                </div>
                <div className={styles.bidProductStats}>
                  <span>已出价 {bidCount} 次</span>
                  <span>
                    剩余{' '}
                    {remainingMs >= 60000
                      ? `${Math.floor(remainingMs / 60000)} 分钟`
                      : `${Math.ceil(remainingMs / 1000)} 秒`}
                  </span>
                </div>
              </div>
            </div>
            <BidInput onBidSuccess={handleBidSuccess} onBidFailed={handleBidFailed} />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div
        className={clsx(styles.productModalBackdrop, { [styles.visible]: visible })}
        onClick={handleBackdropClick}
      />
      <div className={clsx(styles.productModalContainer, { [styles.visible]: visible })}>
        <div className={styles.productModalHeader}>
          <div className={styles.productModalTitle}>商品列表</div>
          <button className={styles.productModalClose} onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>
        <div className={styles.productModalContent}>
          {localProducts && localProducts.length > 0 ? (
            <div className={styles.productList}>
              {[...localProducts]
                .sort((a, b) => {
                  const statusOrder: Record<string, number> = {
                    IN_PROGRESS: 0,
                    NOT_STARTED: 1,
                    ENDED: 2,
                  }
                  const aOrder = statusOrder[a.auctionStatus] ?? 2
                  const bOrder = statusOrder[b.auctionStatus] ?? 2
                  return aOrder - bOrder
                })
                .map((product) => (
                  <div
                    key={product.id}
                    className={clsx(styles.productCard, {
                      [styles.explaining]: explainingProductId === product.id,
                    })}
                  >
                    <div className={styles.productContent}>
                      <div className={styles.productImageWrapper}>
                        {product.image ? (
                          <>
                            <img
                              src={product.image}
                              alt={product.name}
                              className={styles.productImage}
                            />
                            {explainingProductId === product.id && (
                              <div className={styles.explainingLabel}>讲解中</div>
                            )}
                          </>
                        ) : (
                          <div className={styles.noImagePlaceholder}>暂无图片</div>
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <div className={styles.productTitle}>{product.name}</div>
                        <div className={clsx(styles.productStatusLabel, getStatusClass(product))}>
                          {getStatusLabel(product)}
                        </div>
                        <div className={styles.productPriceWrapper}>
                          <span className={styles.productPriceLabel}>起拍价</span>
                          <span className={styles.productPrice}>
                            {formatPrice(product.startingPrice)}
                          </span>
                        </div>
                        <button
                          className={clsx(styles.productBuyBtn, {
                            [styles.disabled]: product.auctionStatus !== 'IN_PROGRESS',
                          })}
                          onClick={() => handleSelectProduct(product)}
                          disabled={product.auctionStatus !== 'IN_PROGRESS'}
                        >
                          {product.auctionStatus === 'IN_PROGRESS'
                            ? '去出价'
                            : product.auctionStatus === 'ENDED'
                              ? '已结束'
                              : '即将开拍'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className={styles.emptyState}>暂无上架商品</div>
          )}
        </div>
      </div>
    </>
  )
}
