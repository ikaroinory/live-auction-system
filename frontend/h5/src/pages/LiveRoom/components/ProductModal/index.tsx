import { CloseIcon } from '../../../../components/ui/icons'
import { formatPrice } from '../../../../utils/format'
import { Toast } from 'antd-mobile'
import type { AuctionWithSeller } from '@live-auction/shared'
import './ProductModal.scss'

interface ProductModalProps {
  visible: boolean
  onClose: () => void
  products: AuctionWithSeller[]
}

export const ProductModal = ({ visible, onClose, products }: ProductModalProps) => {
  const handleBuy = (product: AuctionWithSeller) => {
    Toast.show(`正在前往购买 ${product.title}`)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
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
          {products.length > 0 ? (
            <div className="product-list">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-wrapper">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="product-image"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                        暂无图片
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-title">{product.title}</div>
                    <div className="product-price">
                      <span className="product-price-label">起拍价</span> ¥{formatPrice(product.startPrice)}
                    </div>
                    <button
                      className="product-buy-btn"
                      onClick={() => handleBuy(product)}
                    >
                      立即购买
                    </button>
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
