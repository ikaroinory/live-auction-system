import { List } from 'antd-mobile'
import { NavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/ui'
import './Me.scss'

export const MeOrders = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <Layout.Header>
        <NavBar onBack={() => navigate(-1)} title="我的订单" />
      </Layout.Header>

      <Layout.Main>
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
      </Layout.Main>
    </Layout>
  )
}

export default MeOrders