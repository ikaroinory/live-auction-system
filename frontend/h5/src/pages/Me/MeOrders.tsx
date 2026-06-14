import { List } from 'antd-mobile'
import { NavBar } from 'antd-mobile'
import { ChevronLeftIcon } from '@/components/ui/icons'
import { useNavigate } from 'react-router-dom'
import './Me.scss'

export const MeOrders = () => {
  const navigate = useNavigate()

  return (
    <div className="page-container orders-page">
      <NavBar 
        className="custom-nav-bar"
        leftContent={<ChevronLeftIcon style={{ width: 20, height: 20 }} />}
        onLeftClick={() => navigate('/me')}
        title="我的订单"
      />

      <div className="page-content">
        <List className="custom-list" header="订单列表">
          <List.Item className="list-item">
            <div className="record-card">
              <div className="record-header">
                <div className="record-title">翡翠手镯</div>
                <span className="status pending">待支付</span>
              </div>
              <div className="record-price">¥999.00</div>
              <div className="record-time">2024-01-15 15:00:00</div>
            </div>
          </List.Item>
        </List>
      </div>
    </div>
  )
}