
import { useParams, useNavigate, useEffect, useState } from 'react-router-dom';
import { NavBar, Button, Card, Empty, Loading } from 'antd-mobile';
import { auctionAPI } from '../../services/api';
import type { AuctionDetail as AuctionDetailType } from '@live-auction/shared';
import './AuctionDetail.scss';

export const AuctionDetail = () =&gt; {
  const { id } = useParams&lt;{ id: string }&gt;();
  const navigate = useNavigate();
  const [auction, setAuction] = useState&lt;AuctionDetailType | null&gt;(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =&gt; {
    if (id) {
      const loadAuction = async () =&gt; {
        try {
          const data = await auctionAPI.getAuctionDetail(id);
          setAuction(data);
        } catch (error) {
          console.error('Failed to load auction detail:', error);
        } finally {
          setLoading(false);
        }
      };
      loadAuction();
    }
  }, [id]);

  if (loading) {
    return (
      &lt;div className="auction-detail-page page-container"&gt;
        &lt;NavBar onBack={() =&gt; navigate(-1)}&gt;竞拍详情&lt;/NavBar&gt;
        &lt;div className="loading-container"&gt;
          &lt;Loading /&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  if (!auction) {
    return (
      &lt;div className="auction-detail-page page-container"&gt;
        &lt;NavBar onBack={() =&gt; navigate(-1)}&gt;竞拍详情&lt;/NavBar&gt;
        &lt;div className="loading-container"&gt;
          &lt;Empty description="竞拍不存在" /&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="auction-detail-page page-container"&gt;
      &lt;NavBar onBack={() =&gt; navigate(-1)}&gt;竞拍详情&lt;/NavBar&gt;
      
      &lt;div className="detail-content"&gt;
        &lt;Card title="商品信息"&gt;
          &lt;div className="info-item"&gt;
            &lt;span className="label"&gt;商品名称&lt;/span&gt;
            &lt;span className="value"&gt;{auction.title}&lt;/span&gt;
          &lt;/div&gt;
          &lt;div className="info-item"&gt;
            &lt;span className="label"&gt;商品描述&lt;/span&gt;
            &lt;span className="value"&gt;{auction.description}&lt;/span&gt;
          &lt;/div&gt;
        &lt;/Card&gt;

        &lt;Card title="竞拍规则"&gt;
          &lt;div className="info-item"&gt;
            &lt;span className="label"&gt;起拍价&lt;/span&gt;
            &lt;span className="value"&gt;¥{auction.startPrice.toFixed(2)}&lt;/span&gt;
          &lt;/div&gt;
          &lt;div className="info-item"&gt;
            &lt;span className="label"&gt;加价幅度&lt;/span&gt;
            &lt;span className="value"&gt;¥{auction.minIncrement.toFixed(2)}&lt;/span&gt;
          &lt;/div&gt;
          {auction.maxPrice &amp;&amp; (
            &lt;div className="info-item"&gt;
              &lt;span className="label"&gt;封顶价&lt;/span&gt;
              &lt;span className="value"&gt;¥{auction.maxPrice.toFixed(2)}&lt;/span&gt;
            &lt;/div&gt;
          )}
          &lt;div className="info-item"&gt;
            &lt;span className="label"&gt;竞拍时长&lt;/span&gt;
            &lt;span className="value"&gt;{auction.durationSeconds}秒&lt;/span&gt;
          &lt;/div&gt;
          &lt;div className="info-item"&gt;
            &lt;span className="label"&gt;延时机制&lt;/span&gt;
            &lt;span className="value"&gt;自动延长{auction.autoExtendSeconds}秒&lt;/span&gt;
          &lt;/div&gt;
        &lt;/Card&gt;

        &lt;div className="action-section safe-area-bottom"&gt;
          &lt;Button 
            block 
            color="primary" 
            size="large"
            onClick={() =&gt; navigate(`/live/${id}`)}
          &gt;
            进入竞拍
          &lt;/Button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};
