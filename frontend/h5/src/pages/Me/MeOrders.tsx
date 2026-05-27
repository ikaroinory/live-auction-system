import { List } from 'antd-mobile'
import './Me.scss'

export const MeOrders = () => {
  return (
    <div className="me-orders-page">
      <div className="header">
        <h1>我的订单</h1>
      </div>

      <List header="订单列表">
        <List.Item>
          <div className="order-record">
            <div className="order-title">翡翠手镯</div>
            <div className="order-info">
              <span className="price">¥999.00</span>
              <span className="status pending">待支付</span>
            </div>
            <div className="order-time">2024-01-15 15:00:00</div>
          </div>
        </List.Item>
      </List>
    </div>
  )
}
