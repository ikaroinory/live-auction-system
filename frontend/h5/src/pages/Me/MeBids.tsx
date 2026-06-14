import { List } from 'antd-mobile'
import { NavBar } from 'antd-mobile'
import { ChevronLeftIcon } from '@/components/ui/icons'
import { useNavigate } from 'react-router-dom'
import './Me.scss'

export const MeBids = () => {
  const navigate = useNavigate()

  return (
    <div className="page-container bids-page">
      <NavBar 
        className="custom-nav-bar"
        leftContent={<ChevronLeftIcon style={{ width: 20, height: 20 }} />}
        onLeftClick={() => navigate('/me')}
        title="我的出价"
      />

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
    </div>
  )
}