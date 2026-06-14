import { useState, useEffect, useCallback } from 'react'
import { useAuctionRoomStore } from '../../store/useAuctionRoomStore'
import { useUserStore } from '../../store/useUserStore'
import { websocketService } from '../../services/websocket'
import { formatPrice } from '../../utils/format'
import './BidInput.scss'

interface BidInputProps {
  onBidSuccess?: () => void
  onBidFailed?: (reason: string) => void
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}

export const BidInput = ({ onBidSuccess, onBidFailed }: BidInputProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [animationType, setAnimationType] = useState<'success' | 'fail' | null>(null)

  const { user } = useUserStore()
  const { currentAuction, currentPrice, updatePrice, addBidToHistory } = useAuctionRoomStore()

  const nextPrice = currentPrice > 0
    ? Number(currentPrice) + (currentAuction?.fixedIncrement || 10)
    : currentAuction?.startingPrice || 0

  useEffect(() => {
    if (animationType) {
      const timer = setTimeout(() => {
        setAnimationType(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [animationType])

  const handleBid = useCallback(() => {
    if (!user?.id || !currentAuction?.id || isSubmitting) return

    setIsSubmitting(true)
    
    const success = websocketService.submitBid(currentAuction.id, user.id, nextPrice)
    
    if (success) {
      const bid = {
        id: generateId(),
        auctionId: currentAuction.id,
        userId: user.id,
        price: nextPrice,
        createdAt: new Date().toISOString()
      }
      addBidToHistory(bid)
      updatePrice(nextPrice)
      setAnimationType('success')
      onBidSuccess?.()
    } else {
      setAnimationType('fail')
      onBidFailed?.('网络连接失败')
    }
    
    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }, [user, currentAuction, isSubmitting, nextPrice, addBidToHistory, updatePrice, onBidSuccess, onBidFailed])

  if (!currentAuction) {
    return null
  }

  return (
    <div className={`bid-input-container ${animationType ? `animating ${animationType}` : ''}`}>
      <div className="bid-current-price">
        <span className="label">当前价格</span>
        <span className="price">{formatPrice(currentPrice || currentAuction.startingPrice)}</span>
      </div>

      <div className="bid-button-wrapper">
        <button
          className="bid-button"
          onClick={handleBid}
          disabled={isSubmitting}
        >
          <span className="bid-price">{formatPrice(nextPrice)}</span>
          <span className="bid-label">{isSubmitting ? '出价中...' : '立即出价'}</span>
        </button>
      </div>

      <div className="bid-info">
        <span className="increment-info">
          每次至少加价 {formatPrice(currentAuction.fixedIncrement)}
        </span>
        {currentAuction.maxPrice && (
          <span className="max-price-info">
            最高限价 {formatPrice(currentAuction.maxPrice)}
          </span>
        )}
      </div>

      {animationType === 'success' && (
        <div className="animation-overlay success">
          <span>出价成功!</span>
        </div>
      )}

      {animationType === 'fail' && (
        <div className="animation-overlay fail">
          <span>出价失败</span>
        </div>
      )}
    </div>
  )
}