import { CloseIcon } from '../../../../components/ui/icons'
import { formatPrice } from '../../../../utils/format'
import { Toast } from 'antd-mobile'
import styles from './ProductModal.module.scss'
import { clsx } from 'clsx'
import { Product } from '@live-auction/shared'

interface ProductModalProps {
  visible: boolean
  onClose: () => void
  products: Product[]
  explainingProductId?: string | null
}

export const ProductModal = ({ visible, onClose, products, explainingProductId }: ProductModalProps) => {
  const handleBuy = (product: Product) => {
    Toast.show(`正在前往购买 ${product.name}`)
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
                        className={styles.productBuyBtn}
                        onClick={() => handleBuy(product)}
                      >
                        去出价
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
