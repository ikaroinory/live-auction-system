import React, { useState } from 'react';
import { Table, Button, Tag, Space } from '@douyinfe/semi-ui';
import { Typography } from '@douyinfe/semi-ui';
import { IconPlus } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router';
import type { Auction } from '@/types';

const { Title } = Typography;

interface AuctionRow {
  id: number;
  title: string;
  startPrice: number;
  finalPrice?: number;
  status: number;
  createdAt: string;
}

const AuctionList: React.FC = () => {
  const navigate = useNavigate();
  const [data] = useState<Auction[]>([]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id'
    },
    {
      title: '标题',
      dataIndex: 'title'
    },
    {
      title: '起拍价',
      dataIndex: 'startPrice',
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '当前价',
      dataIndex: 'finalPrice',
      render: (price?: number) => (price ? `¥${price.toFixed(2)}` : '-')
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: '未开始', color: 'default' },
          1: { text: '进行中', color: 'success' },
          2: { text: '已结束', color: 'warning' },
          3: { text: '已取消', color: 'danger' }
        };
        const { text, color } = statusMap[status] || { text: '未知', color: 'default' };
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      render: (_: unknown, record: AuctionRow) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/auction/${record.id}`)}>
            详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title heading={4}>竞拍列表</Title>
        <Button icon={<IconPlus />} onClick={() => navigate('/auction/create')}>
          发布竞拍
        </Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default AuctionList;
