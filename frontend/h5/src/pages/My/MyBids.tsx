import { List } from 'antd-mobile';
import { BottomNav } from '../../components/BottomNav';
import './My.css';

export const MyBids = () => {
  
  return (
    <div className="my-bids-page page-container">
      <div className="header">
        <h1>我的出价</h1>
      </div>

      <List header="出价记录">
        <List.Item>
          <div className="bid-record">
            <div className="auction-title">翡翠手镯</div>
            <div className="bid-info">
              <span className="price">¥999.00</span>
              <span className="status winning">领先</span>
            </div>
            <div className="bid-time">2024-01-15 14:30:25</div>
          </div>
        </List.Item>
        <List.Item>
          <div className="bid-record">
            <div className="auction-title">紫砂壶</div>
            <div className="bid-info">
              <span className="price">¥500.00</span>
              <span className="status outbid">已出局</span>
            </div>
            <div className="bid-time">2024-01-15 13:20:10</div>
          </div>
        </List.Item>
      </List>

      <BottomNav />
    </div>
  );
};
