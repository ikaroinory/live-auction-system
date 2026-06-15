import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Empty, Toast } from 'antd-mobile'
import { LiveStreamCard } from './components/LiveStreamCard'
import type { LiveRoomWithStreamer, ProductStatusChangedPayload } from '@live-auction/shared'
import './Home.scss'
import { liveRoomAPI } from '@/services/api'
import { websocketService } from '@/services/websocket'

export const Home = () => {
  const [liveRooms, setLiveRooms] = useState<LiveRoomWithStreamer[]>([])
  const [liveRoomsLoading, setLiveRoomsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshLiveRooms = useCallback(async () => {
    try {
      const data = await liveRoomAPI.getLiveRooms()
      setLiveRooms(Array.isArray(data) ? data : data?.list || [])
    } catch (error) {
      console.error('Failed to load live rooms:', error)
    } finally {
      setLiveRoomsLoading(false)
    }
  }, [])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    refreshLiveRooms()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [refreshKey, refreshLiveRooms])

  useEffect(() => {
    websocketService.connect()

    const handleProductStatusChanged = (payload: ProductStatusChangedPayload) => {
      console.log('[Home] Product status changed:', payload)
      setRefreshKey((k) => k + 1)
    }

    websocketService.setOnProductStatusChanged(handleProductStatusChanged)

    return () => {
      websocketService.setOnProductStatusChanged(() => {})
      websocketService.disconnect()
    }
  }, [])

  const navigate = useNavigate()
  const savedIndex = sessionStorage.getItem('liveRoomCurrentIndex')
  const [currentIndex, setCurrentIndex] = useState<number>(
    savedIndex ? parseInt(savedIndex, 10) : 0
  )
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const activeLiveRooms = liveRooms.filter((room) => room.status === 1)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isUpSwipe = distance > minSwipeDistance
    const isDownSwipe = distance < -minSwipeDistance

    if (isUpSwipe && !isTransitioning) {
      if (currentIndex >= activeLiveRooms.length - 1) {
        Toast.show('已经是最后一个直播间了')
        return
      }
      setCurrentIndex((prev) => {
        const next = Math.min(prev + 1, activeLiveRooms.length - 1)
        return next
      })
      setIsTransitioning(true)
    }

    if (isDownSwipe && !isTransitioning) {
      if (currentIndex <= 0) {
        Toast.show('已经是第一个直播间了')
        return
      }
      setCurrentIndex((prev) => {
        const next = Math.max(prev - 1, 0)
        return next
      })
      setIsTransitioning(true)
    }
  }, [touchStart, touchEnd, isTransitioning, currentIndex, activeLiveRooms.length])

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  const currentLiveRoom = activeLiveRooms[currentIndex]

  const handleEnterLiveRoom = () => {
    if (currentLiveRoom) {
      sessionStorage.setItem('liveRoomCurrentIndex', currentIndex.toString())
      navigate(`/live/${currentLiveRoom.id}`)
    }
  }

  if (liveRoomsLoading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <span className="loading-text">加载中...</span>
        </div>
      </div>
    )
  }

  if (activeLiveRooms.length === 0) {
    return (
      <div className="home-page">
        <div className="empty-container">
          <Empty description="暂无直播中的直播间" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </div>
    )
  }

  console.log(activeLiveRooms)

  return (
    <div className="home-page">
      <div
        className="live-streams-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="live-streams-wrapper"
          style={{
            transform: `translateY(${-currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {activeLiveRooms.map((liveRoom, index) => (
            <div key={liveRoom.id} className="live-stream-item">
              <LiveStreamCard
                liveRoom={liveRoom}
                isActive={index === currentIndex}
                onEnterLiveRoom={handleEnterLiveRoom}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
