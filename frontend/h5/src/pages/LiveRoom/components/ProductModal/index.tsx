import { CloseIcon } from '../../../../components/ui/icons'
import { formatPrice } from '../../../../utils/format'
import { Toast } from 'antd-mobile'
import './ProductModal.scss'

interface Product {
  id: string
  name: string
  image: string
  startingPrice: number
  fixedIncrement: number
  auctionStatus?: string
  status?: string
}

interface ProductModalProps {
  visible: boolean
  onClose: () => void
  products: Product[]
}

// 模拟当前讲解的商品 - 实际应该从直播状态获取
const CURRENT_EXPLAINING_PRODUCT_ID = ''

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

  const isExplaining = (product: Product) => {
    return product.id === CURRENT_EXPLAINING_PRODUCT_ID
  }

  return (
    <>
      <div
        className={`product-modal-backdrop ${visible ? 'visible' : ''}`}
        onClick={handleBackdropClick}
      />
      <div className={`product-modal-container ${visible ? 'visible' : ''}`}>
        <div className="product-modal-header">
          <div className="product-modal-title">商品列表</div>
          <button className="product-modal-close" onClick={onClose}>
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="product-modal-content">
          {products && products.length > 0 ? (
            <div className="product-list">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-content">
                    <div className="product-image-wrapper">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          暂无图片
                        </div>
                      )}
                      {isExplaining(product) && (
                        <div className="explaining-label">讲解中</div>
                      )}
                    </div>
                    <div className="product-info">
                      <div className="product-title">{product.name}</div>
                      <div className="product-status-label">
                        {getStatusLabel(product)}
                      </div>
                      <div className="product-price-wrapper">
                        <span className="product-price-label">起拍价</span>
                        <span className="product-price">{formatPrice(product.startingPrice)}</span>
                      </div>
                      <button
                        className="product-buy-btn"
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
            <div className="empty-state">
              暂无上架商品
            </div>
          )}
        </div>
      </div>
    </>
  )
}
