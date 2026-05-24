import { formatPrice } from '@/utils/format';
import './CurrentPrice.scss';

interface CurrentPriceProps {
  price: number;
}

export const CurrentPrice = ({ price }: CurrentPriceProps) => {
  return (
    <div className="current-price-display">
      <span className="label">当前价格</span>
      <span className="price">{formatPrice(price)}</span>
    </div>
  );
};
