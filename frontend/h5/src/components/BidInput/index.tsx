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
  const [customPrice, setCustomPrice] = useState<string>('')
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

  const handleQuickBid = useCallback((price: number) => {
    if (!user?.id || !currentAuction?.id || isSubmitting) return

    setIsSubmitting(true)
    
    const success = websocketService.submitBid(currentAuction.id, user.id, price)
    
    if (success) {
      const bid = {
        id: generateId(),
        auctionId: currentAuction.id,
        userId: user.id,
        price,
        createdAt: new Date().toISOString()
      }
      addBidToHistory(bid)
      updatePrice(price)
      setAnimationType('success')
      onBidSuccess?.()
    } else {
      setAnimationType('fail')
      onBidFailed?.('网络连接失败')
    }
    
    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }, [user, currentAuction, isSubmitting, addBidToHistory, updatePrice, onBidSuccess, onBidFailed])

  const handleCustomBid = useCallback(() => {
    if (!user?.id || !currentAuction?.id || isSubmitting) return
    
    const price = parseFloat(customPrice)
    if (isNaN(price) || price <= 0) {
      setAnimationType('fail')
      onBidFailed?.('请输入有效的价格')
      return
    }

    const minPrice = nextPrice
    if (price < minPrice) {
      setAnimationType('fail')
      onBidFailed?.(`出价必须高于 ${formatPrice(minPrice)}`)
      return
    }

    setIsSubmitting(true)
    
    const success = websocketService.submitBid(currentAuction.id, user.id, price)
    
    if (success) {
      const bid = {
        id: generateId(),
        auctionId: currentAuction.id,
        userId: user.id,
        price,
        createdAt: new Date().toISOString()
      }
      addBidToHistory(bid)
      updatePrice(price)
      setCustomPrice('')
      setAnimationType('success')
      onBidSuccess?.()
    } else {
      setAnimationType('fail')
      onBidFailed?.('网络连接失败')
    }
    
    setTimeout(() => {
      setIsSubmitting(false)
    }, 500)
  }, [user, currentAuction, isSubmitting, customPrice, nextPrice, addBidToHistory, updatePrice, onBidSuccess, onBidFailed])

  if (!currentAuction) {
    return null
  }

  const increments = [1, 2, 5, 10].map(multiplier => {
    const incrementAmount = currentAuction.fixedIncrement * multiplier
    return {
      label: `+${incrementAmount}`,
      value: Number(currentPrice || currentAuction.startingPrice) + incrementAmount
    }
  })

  return (
    <div className={`bid-input-container ${animationType ? `animating ${animationType}` : ''}`}>
      <div className="bid-current-price">
        <span className="label">当前价格</span>
        <span className="price">{formatPrice(currentPrice || currentAuction.startingPrice)}</span>
      </div>

      <div className="bid-quick-buttons">
        {increments.map((inc) => (
          <button
            key={inc.label}
            className="quick-bid-btn"
            onClick={() => handleQuickBid(inc.value)}
            disabled={isSubmitting}
          >
            {inc.label}
          </button>
        ))}
      </div>

      <div className="bid-input-wrapper">
        <input
          type="number"
          className="bid-input"
          placeholder="输入金额"
          value={customPrice}
          onChange={(e) => setCustomPrice(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCustomBid()}
          disabled={isSubmitting}
        />
        <button
          className="bid-submit-btn"
          onClick={handleCustomBid}
          disabled={isSubmitting}
        >
          {isSubmitting ? '出价中...' : '立即出价'}
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