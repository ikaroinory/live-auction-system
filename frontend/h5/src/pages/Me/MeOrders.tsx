import { List } from 'antd-mobile'
import { NavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Layout } from '@/components/ui'
import { orderAPI } from '@/services/api'
import type { Product } from '@live-auction/shared'
import styles from './MeOrders.module.scss'

export const MeOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getMyOrders()
        setOrders(response.list)
      } catch (error) {
        console.error('获取订单失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getOrderStatus = () => {
    // 根据商品的竞拍状态判断订单状态
    // 由于没有实际的订单系统，暂时返回一个默认状态
    return 'pending'
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '¥0.00'
    return `¥${price.toFixed(2)}`
  }

  const formatTime = (time: string | null) => {
    if (!time) return ''
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
        <NavBar onBack={() => navigate(-1)} title="我的订单" />
      </Layout.Header>

      <Layout.Main>
        <div className={styles.pageContent}>
          <List className={styles.customList} header="订单列表">
            {loading ? (
              <List.Item className={styles.listItem}>
                <div className={styles.recordCard}>
                  <div className={styles.recordTitle}>加载中...</div>
                </div>
              </List.Item>
            ) : orders.length === 0 ? (
              <List.Item className={styles.listItem}>
                <div className={styles.recordCard}>
                  <div className={styles.recordTitle}>暂无订单</div>
                </div>
              </List.Item>
            ) : (
              orders.map((order) => (
                <List.Item key={order.id} className={styles.listItem}>
                  <div className={styles.recordCard}>
                    <div className={styles.recordHeader}>
                      <div className={styles.recordTitle}>{order.name}</div>
                      <span className={`${styles.status} ${styles[getOrderStatus()]}`}>
                        {getOrderStatus() === 'pending' ? '待支付' : '已完成'}
                      </span>
                    </div>
                    <div className={styles.recordPrice}>{formatPrice(order.currentBidPrice)}</div>
                    <div className={styles.recordTime}>{formatTime(order.auctionEndTime)}</div>
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

export default MeOrders
