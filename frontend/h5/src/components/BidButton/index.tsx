import { formatPrice } from '../../utils/format'
import './BidButton.scss'

interface BidButtonProps {
  onClick: () => void
  nextPrice: number
  disabled?: boolean
  isAnimating?: boolean
  animationType?: 'success' | 'fail' | null
}

export const BidButton = ({
  onClick,
  nextPrice,
  disabled = false,
  isAnimating = false,
  animationType = null,
}: BidButtonProps) => {
  return (
    <div className={`bid-button-container ${isAnimating ? `animating ${animationType}` : ''}`}>
      <button onClick={onClick} disabled={disabled} className="bid-button">
        <div className="bid-content">
          <span className="label">立即出价</span>
          <span className="price">{formatPrice(nextPrice)}</span>
        </div>
      </button>

      {isAnimating && animationType === 'success' && (
        <div className="animation-overlay success">
          <span>成功!</span>
        </div>
      )}

      {isAnimating && animationType === 'fail' && (
        <div className="animation-overlay fail">
          <span>失败</span>
        </div>
      )}
    </div>
  )
}
