import { List } from 'antd-mobile'
import { NavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Layout } from '@/components/ui'
import { bidAPI } from '@/services/api'
import type { BidResponse } from '@live-auction/shared'
import styles from './MeBids.module.scss'

export const MeBids = () => {
  const navigate = useNavigate()
  const [bids, setBids] = useState<BidResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await bidAPI.getMyBids()
        setBids(response.list)
      } catch (error) {
        console.error('获取出价记录失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBids()
  }, [])

  const getBidStatus = (bid: BidResponse): 'winning' | 'out' | 'won' | 'lost' | 'pending' => {
    const { product, price } = bid
    const currentPrice = product?.currentBidPrice || 0
    const auctionStatus = product?.auctionStatus

    if (auctionStatus === 'NOT_STARTED') {
      return 'pending'
    }

    if (auctionStatus === 'IN_PROGRESS') {
      return price >= currentPrice ? 'winning' : 'out'
    }

    if (auctionStatus === 'ENDED') {
      return price >= currentPrice ? 'won' : 'lost'
    }

    return 'pending'
  }

  const getStatusText = (status: ReturnType<typeof getBidStatus>): string => {
    const statusMap: Record<ReturnType<typeof getBidStatus>, string> = {
      winning: '领先',
      out: '已出局',
      won: '已中标',
      lost: '未中标',
      pending: '未开始',
    }
    return statusMap[status]
  }

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`
  }

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <Layout>
      <Layout.Header>
        <NavBar onBack={() => navigate(-1)} title="我的出价" />
      </Layout.Header>

      <Layout.Main>
        <div className={styles.pageContent}>
          <List className={styles.customList} header="出价记录">
            {loading ? (
              <List.Item className={styles.listItem}>
                <div className={styles.recordCard}>
                  <div className={styles.recordTitle}>加载中...</div>
                </div>
              </List.Item>
            ) : bids.length === 0 ? (
              <List.Item className={styles.listItem}>
                <div className={styles.recordCard}>
                  <div className={styles.recordTitle}>暂无出价记录</div>
                </div>
              </List.Item>
            ) : (
              bids.map((bid) => (
                <List.Item key={bid.id} className={styles.listItem}>
                  <div className={styles.recordCard}>
                    <div className={styles.recordHeader}>
                      <div className={styles.recordTitle}>{bid.product?.name || '商品名称'}</div>
                      <span className={`${styles.status} ${styles[getBidStatus(bid)]}`}>
                        {getStatusText(getBidStatus(bid))}
                      </span>
                    </div>
                    <div className={styles.recordPrice}>{formatPrice(bid.price)}</div>
                    <div className={styles.recordTime}>{formatTime(bid.createdAt)}</div>
                  </div>
                </List.Item>
              ))
            )}
          </List>
        </div>
      </Layout.Main>
    </Layout>
  )
}

export default MeBids
