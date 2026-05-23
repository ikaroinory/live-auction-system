import { Button } from 'antd-mobile';
import { formatPrice } from '../../utils/format';
import './BidButton.css';

interface BidButtonProps {
  onClick: () => void;
  nextPrice: number;
  disabled?: boolean;
  isAnimating?: boolean;
  animationType?: 'success' | 'fail' | null;
}

export const BidButton = ({ 
  onClick, 
  nextPrice, 
  disabled = false,
  isAnimating = false,
  animationType = null,
}: BidButtonProps) => {
  return (
    <div className={`bid-button-container ${isAnimating ? `animating ${animationType}` : ''}`}>
      <Button
        block
        color="danger"
        size="large"
        onClick={onClick}
        disabled={disabled}
        className="bid-button"
      >
        <div className="bid-content">
          <span className="label">立即出价</span>
          <span className="price">{formatPrice(nextPrice)}</span>
        </div>
      </Button>
      
      {isAnimating && animationType === 'success' && (
        <div className="animation-overlay success">
          <span>出价成功!</span>
        </div>
      )}
      
      {isAnimating && animationType === 'fail' && (
        <div className="animation-overlay fail">
          <span>出价失败</span>
        </div>
      )}
    </div>
  );
};
