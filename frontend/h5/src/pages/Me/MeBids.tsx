import { List } from 'antd-mobile'
import { NavBar } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/ui'
import './Me.scss'

export const MeBids = () => {
  const navigate = useNavigate()

  return (
    <Layout>
      <Layout.Header>
        <NavBar onBack={() => navigate(-1)} title="我的出价" />
      </Layout.Header>

      <Layout.Main>
        <div className="page-content">
          <List className="custom-list" header="出价记录">
            <List.Item className="list-item">
              <div className="record-card">
                <div className="record-header">
                  <div className="record-title">翡翠手镯</div>
                  <span className="status winning">领先</span>
                </div>
                <div className="record-price">¥999.00</div>
                <div className="record-time">2024-01-15 14:30:25</div>
              </div>
            </List.Item>
            <List.Item className="list-item">
              <div className="record-card">
                <div className="record-header">
                  <div className="record-title">紫砂壶</div>
                  <span className="status outbid">已出局</span>
                </div>
                <div className="record-price">¥500.00</div>
                <div className="record-time">2024-01-15 13:20:10</div>
              </div>
            </List.Item>
          </List>
        </div>
      </Layout.Main>
    </Layout>
  )
}

export default MeBids