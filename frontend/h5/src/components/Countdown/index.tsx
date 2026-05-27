import { useEffect, useState } from 'react'
import './Countdown.scss'

interface CountdownProps {
  remainingMs: number
  onComplete?: () => void
}

export const Countdown = ({ remainingMs, onComplete }: CountdownProps) => {
  const [displayMs, setDisplayMs] = useState(remainingMs)

  useEffect(() => {
    setDisplayMs(remainingMs)
  }, [remainingMs])

  useEffect(() => {
    if (remainingMs <= 0 && onComplete) {
      onComplete()
    }
  }, [remainingMs, onComplete])

  const hours = Math.floor(displayMs / 3600000)
  const minutes = Math.floor((displayMs % 3600000) / 60000)
  const seconds = Math.floor((displayMs % 60000) / 1000)
  const ms = Math.floor((displayMs % 1000) / 100)

  const formatNumber = (num: number) => num.toString().padStart(2, '0')

  const isUrgent = displayMs < 30000 && displayMs > 0
  const isEnded = displayMs <= 0

  return (
    <div className={`countdown ${isUrgent ? 'urgent' : ''} ${isEnded ? 'ended' : ''}`}>
      <div className="countdown-unit">
        <span className="value">{formatNumber(hours)}</span>
        <span className="separator">:</span>
      </div>
      <div className="countdown-unit">
        <span className="value">{formatNumber(minutes)}</span>
        <span className="separator">:</span>
      </div>
      <div className="countdown-unit">
        <span className="value">{formatNumber(seconds)}</span>
        {!isEnded && <span className="ms">.{ms}</span>}
      </div>
    </div>
  )
}
