import { BaseComponent } from '../interfaces'
import styles from './styles.module.scss'

export interface DisplayItemProps {
  name: React.ReactNode
  count: number | string
}

export const DisplayItem: BaseComponent<'div', DisplayItemProps> = ({ name, count, ...props }) => {
  return (
    <div className={styles.displayItem} {...props}>
      <div className={styles.displayItemCount}>{count}</div>
      <div className={styles.displayItemName}>{name}</div>
    </div>
  )
}
