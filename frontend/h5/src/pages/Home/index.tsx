import { useNavigate } from 'react-router-dom';
import { Card, List, Empty } from 'antd-mobile';
import { BottomNav } from '../../components/BottomNav';
import type { Auction } from '../../types/auction';
import './Home.css';

interface HomeProps {
  auctions?: Auction[];
  loading?: boolean;
}

export const Home = ({ auctions = [], loading = false }: HomeProps) => {
  const navigate = useNavigate();

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '未开始';
      case 1: return '进行中';
      case 2: return '已结束';
      case 3: return '已取消';
      default: return '未知';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return '#909399';
      case 1: return '#67C23A';
      case 2: return '#E6A23C';
      case 3: return '#F56C6C';
      default: return '#909399';
    }
  };

  return (
    <div className="home-page page-container">
      <div className="header">
        <h1>实时竞拍大师</h1>
        <p>抖音电商直播竞拍系统</p>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : auctions.length === 0 ? (
        <Empty description="暂无竞拍商品" />
      ) : (
        <List header="竞拍商品列表">
          {auctions.map((auction) => (
            <List.Item
              key={auction.id}
              onClick={() => navigate(`/auction/${auction.id}`)}
              extra={
                <span 
                  className="status-tag"
                  style={{ color: getStatusColor(auction.status) }}
                >
                  {getStatusText(auction.status)}
                </span>
              }
            >
              <Card title={auction.title}>
                <div className="auction-info">
                  <div className="price">
                    <span className="label">当前价:</span>
                    <span className="value">¥{auction.startPrice.toFixed(2)}</span>
                  </div>
                  <div className="increment">
                    <span className="label">加价幅度:</span>
                    <span className="value">¥{auction.minIncrement.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </List.Item>
          ))}
        </List>
      )}

      <BottomNav />
    </div>
  );
};
