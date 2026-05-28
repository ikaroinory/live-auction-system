import React from 'react';
import { Card, Row, Col, Typography } from '@douyinfe/semi-ui';
import {
  IconLive,
  IconTicket,
  IconGift,
  IconTrendUp,
} from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: '进行中竞拍',
      value: '12',
      icon: <IconLive size={32} />,
      color: '#ff2d55',
    },
    {
      title: '今日订单',
      value: '156',
      icon: <IconTicket size={32} />,
      color: '#5856d6',
    },
    {
      title: '商品总数',
      value: '320',
      icon: <IconGift size={32} />,
      color: '#34c759',
    },
    {
      title: 'GMV',
      value: '¥28,560',
      icon: <IconTrendUp size={32} />,
      color: '#ff9500',
    },
  ];

  return (
    <div>
      <Title heading={4} style={{ marginBottom: 24 }}>
        数据概览
      </Title>
      <Row gutter={16}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
            <Card
              style={{
                borderLeft: `4px solid ${stat.color}`,
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
  );
};

export default Dashboard;
