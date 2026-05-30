import { Typography } from '@douyinfe/semi-ui'
import styles from './Create.module.scss'
import { ProductFormPage } from './components/ProductForm'

const ProductCreate: React.FC = () => {
  return (
    <div className={styles.auctionFormContainer}>
      <Typography.Title heading={4} style={{ marginBottom: 24 }}>
        添加商品
      </Typography.Title>
      <ProductFormPage />
    </div>
  )
}

export default ProductCreate
