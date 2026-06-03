import { CloseIcon } from '../../../../components/ui/icons'
import { formatPrice } from '../../../../utils/format'
import { Toast } from 'antd-mobile'
import styles from './ProductModal.module.scss'
import { clsx } from 'clsx'

interface Product {
  id: string
  name: string
  image: string
  startingPrice: number
  fixedIncrement: number
  auctionStatus?: string
  status?: string
  isExplaining?: boolean
}

interface ProductModalProps {
  visible: boolean
  onClose: () => void
  products: Product[]
}

export const ProductModal = ({ visible, onClose, products }: ProductModalProps) => {
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
      return styles['status-in-progress']
    }
    return styles['status-upcoming']
  }

  const isExplaining = (product: Product) => {
    return !!product.isExplaining
  }

  return (
    <>
      <div
        className={clsx(styles['product-modal-backdrop'], { [styles.visible]: visible })}
        onClick={handleBackdropClick}
      />
      <div className={clsx(styles['product-modal-container'], { [styles.visible]: visible })}>
        <div className={styles['product-modal-header']}>
          <div className={styles['product-modal-title']}>商品列表</div>
          <button className={styles['product-modal-close']} onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>
        <div className={styles['product-modal-content']}>
          {products && products.length > 0 ? (
            <div className={styles['product-list']}>
              {products.map((product) => (
                <div key={product.id} className={styles['product-card']}>
                  <div className={styles['product-content']}>
                    <div className={styles['product-image-wrapper']}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={styles['product-image']}
                        />
                      ) : (
                        <div className={styles['no-image-placeholder']}>
                          暂无图片
                        </div>
                      )}
                      {isExplaining(product) && (
                        <div className={styles['explaining-label']}>讲解中</div>
                      )}
                    </div>
                    <div className={styles['product-info']}>
                      <div className={styles['product-title']}>{product.name}</div>
                      <div className={clsx(styles['product-status-label'], getStatusClass(product))}>
                        {getStatusLabel(product)}
                      </div>
                      <div className={styles['product-price-wrapper']}>
                        <span className={styles['product-price-label']}>起拍价</span>
                        <span className={styles['product-price']}>{formatPrice(product.startingPrice)}</span>
                      </div>
                      <button
                        className={styles['product-buy-btn']}
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
            <div className={styles['empty-state']}>
              暂无上架商品
            </div>
          )}
        </div>
      </div>
    </>
  )
}
