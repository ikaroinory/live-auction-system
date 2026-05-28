import React from 'react';
import { Table, Tag } from '@douyinfe/semi-ui';
import { Typography } from '@douyinfe/semi-ui';

const { Title } = Typography;

const OrderList: React.FC = () => {
  const columns = [
    {
      title: '订单号',
      dataIndex: 'id'
    },
    {
      title: '竞拍标题',
      dataIndex: 'auctionTitle'
    },
    {
      title: '买家',
      dataIndex: 'buyer'
    },
    {
      title: '成交价',
      dataIndex: 'finalPrice',
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: '待支付', color: 'warning' },
          1: { text: '已支付', color: 'success' },
          2: { text: '已取消', color: 'default' }
        };
        const { text, color } = statusMap[status] || { text: '未知', color: 'default' };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt'
    }
  ];

  return (
    <div>
      <Title heading={4} style={{ marginBottom: 24 }}>
        订单列表
      </Title>
      <Table columns={columns} dataSource={[]} rowKey="id" />
    </div>
  );
};

export default OrderList;
