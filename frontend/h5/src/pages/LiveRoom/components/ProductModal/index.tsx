import { useState, useEffect } from 'react'
import { CloseIcon, ChevronLeftIcon } from '../../../../components/ui/icons'
import { formatPrice } from '../../../../utils/format'
import { Toast } from 'antd-mobile'
import styles from './ProductModal.module.scss'
import { clsx } from 'clsx'
import { Product } from '@live-auction/shared'
import { BidInput } from '../../../../components/BidInput'
import { useAuctionRoomStore } from '../../../../store/useAuctionRoomStore'

interface ProductModalProps {
  visible: boolean
  onClose: () => void
  products: Product[]
  explainingProductId?: string | null
}

export const ProductModal = ({ visible, onClose, products, explainingProductId }: ProductModalProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { setCurrentAuction, updatePrice } = useAuctionRoomStore()

  useEffect(() => {
    if (selectedProduct) {
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
    }
  }, [selectedProduct, setCurrentAuction, updatePrice])

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
    return '即将开拍'
  }

  const getStatusClass = (product: Product) => {
    if (product.auctionStatus === 'IN_PROGRESS') {
      return styles.statusInProgress
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
                  <div className={styles.noImagePlaceholder}>
                    暂无图片
                  </div>
                )}
              </div>
              <div className={styles.bidProductDetail}>
                <div className={styles.bidProductTitle}>{selectedProduct.name}</div>
                <div className={styles.bidProductPriceInfo}>
                  <span className={styles.bidProductCurrentLabel}>当前价</span>
                  <span className={styles.bidProductCurrentPrice}>
                    {formatPrice(selectedProduct.currentBidPrice || selectedProduct.startingPrice)}
                  </span>
                </div>
                <div className={styles.bidProductStats}>
                  <span>已出价 {selectedProduct.bidCount} 次</span>
                  <span>剩余 {selectedProduct.durationMinutes} 分钟</span>
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
          {products && products.length > 0 ? (
            <div className={styles.productList}>
              {products.map((product) => (
                <div key={product.id} className={clsx(styles.productCard, { [styles.explaining]: explainingProductId === product.id })}>
                  <div className={styles.productContent}>
                    <div className={styles.productImageWrapper}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.noImagePlaceholder}>
                          暂无图片
                        </div>
                      )}
                      {explainingProductId === product.id && (
                        <div className={styles.explainingBadge}>正在讲解</div>
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <div className={styles.productTitle}>{product.name}</div>
                      <div className={clsx(styles.productStatusLabel, getStatusClass(product))}>
                        {getStatusLabel(product)}
                      </div>
                      {explainingProductId === product.id && (
                        <div className={styles.explainingLabel}>主播正在讲解此商品</div>
                      )}
                      <div className={styles.productPriceWrapper}>
                        <span className={styles.productPriceLabel}>起拍价</span>
                        <span className={styles.productPrice}>{formatPrice(product.startingPrice)}</span>
                      </div>
                      <button
                        className={clsx(styles.productBuyBtn, { [styles.disabled]: product.auctionStatus !== 'IN_PROGRESS' })}
                        onClick={() => handleSelectProduct(product)}
                        disabled={product.auctionStatus !== 'IN_PROGRESS'}
                      >
                        {product.auctionStatus === 'IN_PROGRESS' ? '去出价' : '即将开拍'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              暂无上架商品
            </div>
          )}
        </div>
      </div>
    </>
  )
}
