import React from 'react';
import { Typography } from '@douyinfe/semi-ui';
import { useParams } from 'react-router';

const { Title } = Typography;

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <Title heading={4}>竞拍详情 - {id}</Title>
      <div>竞拍详情页面（待实现）</div>
    </div>
  );
};

export default AuctionDetail;
