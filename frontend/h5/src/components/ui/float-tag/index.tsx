import styles from './styles.module.scss'

export const FloatTag: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div className={styles.floatTag}>{props.children}</div>
}
