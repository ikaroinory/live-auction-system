import { Typography } from '@douyinfe/semi-ui'
import styles from './Create.module.scss'
import { ProductEditPage } from './components/ProductForm'

const ProductEdit: React.FC = () => {
  return (
    <div className={styles.auctionFormContainer}>
      <Typography.Title heading={4} style={{ marginBottom: 24 }}>
        编辑商品
      </Typography.Title>
      <ProductEditPage />
    </div>
  )
}

export default ProductEdit
