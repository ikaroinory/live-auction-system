import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Toast } from 'antd-mobile'
import { useAuctionRoomStore } from '../../store/useAuctionRoomStore'
import { useUserStore } from '../../store/useUserStore'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useCountdown } from '../../hooks/useCountdown'
import { useBidAnimation } from '../../hooks/useBidAnimation'
import { RankingList } from '../../components/RankingList'
import { ToastNotification } from '../../components/ToastNotification'
import { Avatar, BubbleButton } from '../../components/ui'
import {
  HistoryIcon,
  ShareIcon,
  LikeIcon,
  GiftIcon,
  CloseIcon,
} from '../../components/ui/icons'
import { VideoPlayer } from './components/VideoPlayer'
import { BidHistory } from './components/BidHistory'
import { ProductModal } from './components/ProductModal'

import { liveRoomAPI, productAPI } from '../../services/api'
import type { LiveRoomWithStreamer, AuctionWithSeller, Product as ProductType } from '@live-auction/shared'
import './LiveRoom.scss'
import styles from './styles.module.scss'
import clsx from 'clsx'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  type: 'message' | 'join'
}

interface AnimationItem {
  id: string
  type: 'like' | 'gift'
  content: string
  left: number
}

export const LiveRoom = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [liveRoom, setLiveRoom] = useState<
    (LiveRoomWithStreamer & { isFollowed?: boolean; auctions?: AuctionWithSeller[] }) | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [showBidHistory, setShowBidHistory] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [products, setProducts] = useState<ProductType[]>([])
  const [chatInput, setChatInput] = useState('')
  const [animations, setAnimations] = useState<AnimationItem[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { user } = useUserStore()
  const {
    currentAuction,
    rankings,
    remainingMs,
    updatePrice,
    bidHistory,
    setCurrentAuction,
    setBidHistory,
  } = useAuctionRoomStore()

  useWebSocket({
    auctionId: currentAuction?.id,
    userId: user?.id,
    autoConnect: true,
  })

  useCountdown(remainingMs)

  useBidAnimation()

  // 初始化聊天消息 - 使用 useState 默认值来避免在 effect 中同步 setState
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', userId: '1', userName: '梦尘', content: '这个直播间好棒', type: 'message' },
    {
      id: '2',
      userId: '2',
      userName: '幸福是什么',
      content: '希望能拍到好东西',
      type: 'message',
    },
    { id: '3', userId: '3', userName: '朱Z', content: '主播加油', type: 'message' },
    { id: '4', userId: '4', userName: 'Sum_41', content: '关注了主播', type: 'join' },
    { id: '5', userId: '5', userName: '菠萝睡不醒', content: '666', type: 'message' },
  ])

  useEffect(() => {
    const loadLiveRoom = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await liveRoomAPI.getLiveRoomDetail(id)
        setLiveRoom(data)
        setIsFollowed(!!data.isFollowed)

        // 获取直播间创建人的商品列表
        if (data.streamerId) {
          const productsData = await productAPI.getProducts({
            creatorId: data.streamerId,
            status: 'PUBLISHED'
          })
          setProducts(productsData.list || [])
        }

        if (data.auctions && data.auctions.length > 0) {
          const auction = data.auctions[0]
          setCurrentAuction(auction)

          const mockBids = [
            {
              id: '3',
              auctionId: auction.id,
              userId: 'user-3',
              price: auction.startPrice + auction.minIncrement * 3,
              createdAt: new Date(Date.now() - 60000).toISOString(),
            },
            {
              id: '2',
              auctionId: auction.id,
              userId: 'user-2',
              price: auction.startPrice + auction.minIncrement * 2,
              createdAt: new Date(Date.now() - 120000).toISOString(),
            },
            {
              id: '1',
              auctionId: auction.id,
              userId: 'user-1',
              price: auction.startPrice + auction.minIncrement,
              createdAt: new Date(Date.now() - 180000).toISOString(),
            },
          ]
          setBidHistory(mockBids)

          updatePrice(auction.startPrice + auction.minIncrement * 3)
          useAuctionRoomStore.setState({ remainingMs: 300000 })
        }
      } catch {
        Toast.show('加载直播间失败')
      } finally {
        setLoading(false)
      }
    }

    loadLiveRoom()
  }, [id, setCurrentAuction, setBidHistory, updatePrice])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleFollow = async () => {
    if (!user) {
      Toast.show('请先登录')
      navigate('/login')
      return
    }

    if (!id) return

    try {
      if (isFollowed) {
        await liveRoomAPI.unfollowLiveRoom(id)
        Toast.show('已取消关注')
      } else {
        await liveRoomAPI.followLiveRoom(id)
        Toast.show('关注成功')
      }
      setIsFollowed(!isFollowed)
    } catch {
      Toast.show('操作失败，请稍后重试')
    }
  }

  const generateId = useCallback(() => Math.random().toString(36).substring(2, 9), [])

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim() || !user) return

    const newMessage: ChatMessage = {
      id: generateId(),
      userId: user.id,
      userName: user.nickname || user.phone || '我',
      content: chatInput,
      type: 'message',
    }
    setChatMessages((prev) => [...prev, newMessage])
    setChatInput('')
  }, [chatInput, user, generateId])

  const showEffects = useCallback((type: 'like' | 'gift') => {
    const newAnimation: AnimationItem = {
      id: generateId(),
      type: type,
      content: type === 'like' ? '❤️' : '🎉',
      left: Math.random() * 60 + 20,
    }
    setAnimations((prev) => [...prev, newAnimation])
    setTimeout(() => {
      setAnimations((prev) => prev.filter((a) => a.id !== newAnimation.id))
    }, 1000)
  }, [generateId])

  const handleShare = () => {
    Toast.show('分享链接已复制')
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const randomUsers = ['我勒个恋狗啊', '恨', 'Ninety__n', '我。。']
      const randomContents = ['这个多少钱', '主播好厉害', '冲冲冲', '666', '太牛了', '想要这个']
      const newMessage: ChatMessage = {
        id: generateId(),
        userId: Math.random().toString(),
        userName: randomUsers[Math.floor(Math.random() * randomUsers.length)],
        content: randomContents[Math.floor(Math.random() * randomContents.length)],
        type: Math.random() > 0.9 ? 'join' : 'message',
      }
      setChatMessages((prev) => [...prev.slice(-20), newMessage])
    }, 3000)

    return () => clearInterval(interval)
  }, [generateId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  if (loading) {
    return (
      <div className="live-room-page">
        <div className="loading-container">
          <div className="loading">正在加载直播间...</div>
        </div>
      </div>
    )
  }

  if (!liveRoom) {
    return (
      <div className="live-room-page">
        <div className="loading-container">
          <div className="loading">直播间不存在</div>
        </div>
      </div>
    )
  }

  return (
    <div className="live-room-page">
      <div className="room-content">
        <div className="video-section">
          <VideoPlayer />
        </div>

        <div className={styles.headerBar}>
          <div className={styles.info}>
            <Avatar
              style={{ width: 48 }}
              url={liveRoom.streamer.avatar}
              defaultUrl="/default-avatar.svg"
            />
            <div className="host-info">
              <div className="host-name">
                {liveRoom.streamer.nickname || liveRoom.streamer.phone}
              </div>
              <div className="host-stats">{liveRoom._count.followers} 人关注</div>
            </div>
            <button
              className={`follow-button ${isFollowed ? 'followed' : ''}`}
              onClick={handleFollow}
            >
              {isFollowed ? '已关注' : '关注'}
            </button>
          </div>

          <BubbleButton style={{ width: 40, height: 40 }} onClick={handleGoBack}>
            <CloseIcon size={20} />
          </BubbleButton>
        </div>

        <div className="chat-section">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={msg.type === 'join' ? 'chat-join' : 'chat-message'}>
              {msg.type === 'join' ? (
                <span className="chat-join-text">
                  <span className="chat-name">{msg.userName}</span> 加入了直播间
                </span>
              ) : (
                <>
                  <div className="chat-avatar">{msg.userName.charAt(0)}</div>
                  <div className="chat-content">
                    <span className="chat-name">{msg.userName}</span>
                    <span className="chat-text">{msg.content}</span>
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="ranking-section">
          <RankingList rankings={rankings} />
        </div>

        <div className="bid-section safe-area-bottom">
          <div className={styles.actionBar}>
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="说点什么..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              />
            </div>
            <BubbleButton
              className={clsx(styles.actionButton, styles.like)}
              onClick={() => showEffects('like')}
            >
              <LikeIcon size={20} />
            </BubbleButton>
            <BubbleButton
              className={clsx(styles.actionButton, styles.gift)}
              onClick={() => setShowProductModal(true)}
            >
              <GiftIcon size={20} />
            </BubbleButton>
            <BubbleButton
              className={clsx(styles.actionButton, styles.history)}
              onClick={() => setShowBidHistory(!showBidHistory)}
            >
              <HistoryIcon size={20} />
            </BubbleButton>
            <BubbleButton className={clsx(styles.actionButton, styles.share)} onClick={handleShare}>
              <ShareIcon size={18} />
            </BubbleButton>
          </div>
        </div>

        <div className="gift-animation-container">
          {animations.map((anim) => (
            <div
              key={anim.id}
              className={anim.type === 'like' ? 'like-animation' : 'gift-animation'}
              style={{ left: `${anim.left}%`, bottom: '180px' }}
            >
              {anim.content}
            </div>
          ))}
        </div>
      </div>

      {showBidHistory && (
        <div className="bid-history-modal" onClick={() => setShowBidHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <BidHistory bids={bidHistory} />
            <button className="close-modal" onClick={() => setShowBidHistory(false)}>
              关闭
            </button>
          </div>
        </div>
      )}

      <ProductModal
        visible={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products}
      />

      <ToastNotification />
    </div>
  )
}
