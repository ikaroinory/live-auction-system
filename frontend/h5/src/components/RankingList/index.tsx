import type { RankingItem } from '../../types/auction'
import './RankingList.scss'

interface RankingListProps {
  rankings: RankingItem[]
}

export const RankingList = ({ rankings }: RankingListProps) => {
  return (
    <div className="ranking-list">
      <h3 className="title">出价榜</h3>
      {rankings.length === 0 ? (
        <div className="empty">快来出价吧</div>
      ) : (
        <div className="list">
          {rankings.slice(0, 3).map((item, index) => (
            <div
              key={item.userId}
              className={`ranking-item rank-${index + 1} ${item.isCurrentUser ? 'current-user' : ''}`}
            >
              <div className="rank">
                {index === 0 ? (
                  <span className="medal">🥇</span>
                ) : index === 1 ? (
                  <span className="medal">🥈</span>
                ) : index === 2 ? (
                  <span className="medal">🥉</span>
                ) : (
                  <span className="number">#{index + 1}</span>
                )}
              </div>
              <div className="info">
                <div className="username">{item.phone || item.username}</div>
                <div className="price">¥{item.price.toFixed(2)}</div>
              </div>
              {item.isCurrentUser && <div className="current-badge">我</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
