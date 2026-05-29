import React, { useState } from 'react';
import { Table, Button, Tabs, Input, Tag, Space, Checkbox } from '@douyinfe/semi-ui';
import { Typography } from '@douyinfe/semi-ui';
import { IconPlus, IconArrowUp, IconFilter, IconMore } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router';

const { Title, Text } = Typography;

interface LiveProduct {
  id: number;
  name: string;
  startPrice: number;
  fixedIncrement: number;
  maxPrice: number;
  currentPrice: number;
  bidCount: number;
  status: 'live' | 'ended';
  endTime?: string;
}

interface PendingProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  status: 'pending';
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');
  const [searchValue, setSearchValue] = useState('');

  const liveProducts: LiveProduct[] = [
    {
      id: 1,
      name: '爆款和风生巧福团特价食品解馋零食休闲小吃巧克力大福糯米糍...',
      startPrice: 100,
      fixedIncrement: 10,
      maxPrice: 1000,
      currentPrice: 240,
      bidCount: 13,
      status: 'live',
      endTime: '05:59:59'
    },
    {
      id: 2,
      name: '爆款和风生巧福团特价食品解馋零食休闲小吃巧克力大福糯米糍...',
      startPrice: 100,
      fixedIncrement: 10,
      maxPrice: 1000,
      currentPrice: 960,
      bidCount: 30,
      status: 'ended'
    }
  ];

  const pendingProducts: PendingProduct[] = [
    {
      id: 3,
      name: '新款时尚休闲运动鞋透气轻便跑步鞋男女同款',
      price: 199,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=sport%20shoes%20product%20photo%20white%20background&image_size=square',
      status: 'pending'
    },
    {
      id: 4,
      name: '高端护肤套装补水保湿精华液面霜组合',
      price: 399,
      image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=skincare%20set%20product%20photo%20white%20background&image_size=square',
      status: 'pending'
    }
  ];

  const liveColumns = [
    {
      title: '全选',
      render: () => <Checkbox />
    },
    {
      title: '',
      dataIndex: 'id',
      render: (id: number) => <span style={{ color: '#999' }}>{String(id).padStart(2, '0')}</span>
    },
    {
      title: '商品信息',
      dataIndex: 'name',
      width: 300,
      render: (name: string) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=food%20snack%20product%20photo%20colorful&image_size=square"
              alt=""
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                {name}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Tag size="small" color="orange">限</Tag>
                <Tag size="small" color="red">包邮</Tag>
                <Tag size="small" color="green">运费险</Tag>
                <Tag size="small" color="red">质检</Tag>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '起拍价',
      dataIndex: 'startPrice',
      render: (price: number) => <span style={{ color: '#666' }}>¥{price}</span>
    },
    {
      title: '固定加价',
      dataIndex: 'fixedIncrement',
      render: (price: number) => <span style={{ color: '#666' }}>¥{price}</span>
    },
    {
      title: '封顶价',
      dataIndex: 'maxPrice',
      render: (price: number) => <span style={{ color: '#666' }}>¥{price}</span>
    },
    {
      title: '当前出价',
      dataIndex: 'currentPrice',
      render: (price: number) => <span style={{ color: '#ff2d55', fontWeight: 600, fontSize: 16 }}>¥{price}</span>
    },
    {
      title: '出价次数',
      dataIndex: 'bidCount',
      render: () => (
        <Button size="small" theme="borderless" type="tertiary">
          出价次数 &gt;
        </Button>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => {
        if (status === 'live') {
          return (
            <div>
              <Tag color="red">讲解中</Tag>
              <div style={{ marginTop: 8 }}>
                <Button size="small" theme="solid" type="primary">取消讲解</Button>
              </div>
            </div>
          );
        }
        return (
          <div>
            <Tag color="green">已成交</Tag>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <Button size="small" theme="borderless" type="tertiary">竞拍结束</Button>
              <Button size="small" theme="borderless" type="tertiary">下架</Button>
              <Button size="small" theme="borderless" type="tertiary">讲解</Button>
            </div>
          </div>
        );
      }
    },
    {
      title: '操作',
      render: () => (
        <Button size="small" theme="borderless" icon={<IconMore />} />
      )
    }
  ];

  const pendingColumns = [
    {
      title: '全选',
      render: () => <Checkbox />
    },
    {
      title: '',
      dataIndex: 'id',
      render: (id: number) => <span style={{ color: '#999' }}>{String(id).padStart(2, '0')}</span>
    },
    {
      title: '商品信息',
      dataIndex: 'name',
      width: 300,
      render: (name: string, record: PendingProduct) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={record.image}
              alt=""
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                {name}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      render: (price: number) => <span style={{ color: '#ff2d55', fontWeight: 600 }}>¥{price}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: () => <Tag color="grey">待上架</Tag>
    },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button size="small" theme="borderless" type="primary">上架</Button>
          <Button size="small" theme="borderless" type="danger">删除</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={4}>商品管理</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button size="small" theme="borderless" icon={<IconArrowUp />}>刷新列表</Button>
          <Button size="small" theme="borderless" icon={<IconFilter />}>查看分组</Button>
          <Button size="small" theme="borderless" icon={<IconMore />}>搭配管理</Button>
          <Button icon={<IconPlus />} onClick={() => navigate('/product/create')}>添加商品</Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="直播商品" itemKey="live">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Checkbox style={{ marginRight: 8 }} />
            <Text type="tertiary">全选</Text>
            <Input
              placeholder="请搜索商品名称或ID"
              value={searchValue}
              onChange={setSearchValue}
              style={{ width: 300 }}
            />
            <Button size="small" theme="borderless" icon={<IconFilter />}>筛选</Button>
          </div>
          <Table columns={liveColumns} dataSource={liveProducts} rowKey="id" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="待上架商品" itemKey="pending">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Checkbox style={{ marginRight: 8 }} />
            <Text type="tertiary">全选</Text>
            <Input
              placeholder="请搜索商品名称或ID"
              value={searchValue}
              onChange={setSearchValue}
              style={{ width: 300 }}
            />
            <Button size="small" theme="borderless" icon={<IconFilter />}>筛选</Button>
          </div>
          <Table columns={pendingColumns} dataSource={pendingProducts} rowKey="id" />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ProductList;
