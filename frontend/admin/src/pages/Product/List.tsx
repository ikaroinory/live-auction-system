import React from 'react';
import { Table, Button, Space } from '@douyinfe/semi-ui';
import { Typography } from '@douyinfe/semi-ui';
import { IconPlus } from '@douyinfe/semi-icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ProductList: React.FC = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
    },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button size="small">编辑</Button>
          <Button size="small" theme="danger">删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title heading={4}>商品列表</Title>
        <Button
          icon={<IconPlus />}
          onClick={() => navigate('/product/create')}
        >
          添加商品
        </Button>
      </div>
      <Table columns={columns} dataSource={[]} rowKey="id" />
    </div>
  );
};

export default ProductList;
