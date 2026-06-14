import React, { useState, useEffect } from 'react'
import { Table, Tag, Avatar, Empty } from '@douyinfe/semi-ui'
import { Typography } from '@douyinfe/semi-ui'
import { orderService, type OrderItem } from '@/services'

const { Title } = Typography

const OrderList: React.FC = () => {
  const [dataSource, setDataSource] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await orderService.getList({ page: 1, pageSize: 100 })
        setDataSource(response.list)
      } catch (error) {
        console.error('获取订单列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      width: 120
    },
    {
      title: '商品信息',
      dataIndex: 'productName',
      render: (name: string, record: OrderItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size="small" image={record.productImage} />
          <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        </div>
      )
    },
    {
      title: '买家',
      dataIndex: 'buyerNickname',
      render: (nickname: string | null, record: OrderItem) => <span>{nickname || record.buyerPhone}</span>
    },
    {
      title: '成交价',
      dataIndex: 'finalPrice',
      width: 120,
      render: (price: number) => <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>¥{price.toFixed(2)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: '待支付', color: 'warning' },
          1: { text: '已支付', color: 'success' },
          2: { text: '已取消', color: 'default' }
        }
        const { text, color } = statusMap[status] || { text: '未知', color: 'default' }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (time: string) => {
        return new Date(time).toLocaleString('zh-CN')
      }
    }
  ]

  return (
    <div>
      <Title heading={4} style={{ marginBottom: 24 }}>
        订单列表
      </Title>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={{
          total: dataSource.length,
          pageSize: 10,
          showSizeChanger: true
        }}
        locale={{
          empty: <Empty description="暂无订单数据" />
        }}
      />
    </div>
  )
}

export default OrderList
