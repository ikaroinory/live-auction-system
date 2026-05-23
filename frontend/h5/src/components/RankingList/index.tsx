import type { RankingItem } from '../../types/auction.d';
import './RankingList.css';

interface RankingListProps {
  rankings: RankingItem[];
}

export const RankingList = ({ rankings }: RankingListProps) => {
  return (
    <div className="ranking-list">
      <h3 className="title">实时排行榜</h3>
      {rankings.length === 0 ? (
        <div className="empty">暂无出价记录</div>
      ) : (
        <div className="list">
          {rankings.slice(0, 10).map((item, index) => (
            <div 
              key={item.userId} 
              className={`ranking-item rank-${index + 1} ${item.isCurrentUser ? 'current-user' : ''}`}
            >
              <div className="rank">
                {index < 3 ? (
                  <span className="medal">🏅</span>
                ) : (
                  <span className="number">#{index + 1}</span>
                )}
              </div>
              <div className="info">
                <div className="username">{item.username}</div>
                <div className="price">¥{item.price.toFixed(2)}</div>
              </div>
              {item.isCurrentUser && (
                <div className="current-badge">我</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
