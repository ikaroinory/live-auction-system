import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Typography, Spin } from '@douyinfe/semi-ui'
import { IconLive, IconTickCircle, IconGift, IconArrowUp } from '@douyinfe/semi-icons'
import api from '@/services/api'
import { useUserStore } from '@/store'

const { Title, Text } = Typography

interface StatsData {
  ongoingAuctions: number
  todayOrders: number
  totalProducts: number
  gmv: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useUserStore()

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats')
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatGmv = (gmv: number): string => {
    if (gmv >= 10000) {
      return `¥${(gmv / 10000).toFixed(2)}万`
    }
    return `¥${gmv.toLocaleString()}`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin size="large" />
      </div>
    )
  }

  const statItems = [
    {
      title: '进行中竞拍',
      value: stats?.ongoingAuctions?.toString() || '0',
      icon: <IconLive size="extra-large" />,
      color: '#ff2d55'
    },
    {
      title: '今日订单',
      value: stats?.todayOrders?.toString() || '0',
      icon: <IconTickCircle size="extra-large" />,
      color: '#5856d6'
    },
    {
      title: '商品总数',
      value: stats?.totalProducts?.toString() || '0',
      icon: <IconGift size="extra-large" />,
      color: '#34c759'
    },
    {
      title: 'GMV',
      value: formatGmv(stats?.gmv || 0),
      icon: <IconArrowUp size="extra-large" />,
      color: '#ff9500'
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title heading={4} style={{ marginBottom: 8 }}>
          {getGreeting()}，{user?.username || '管理员'}
        </Title>
        <Text type="tertiary">数据概览</Text>
      </div>
      <Row gutter={16}>
        {statItems.map((stat, index) => (
          <Col span={6} key={index}>
            <Card
              style={{
                borderLeft: `4px solid ${stat.color}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
                <div>
                  <Text type="tertiary" style={{ display: 'block', marginBottom: 4 }}>
                    {stat.title}
                  </Text>
                  <Title heading={3} style={{ margin: 0 }}>
                    {stat.value}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Dashboard
