import styles from './styles.module.scss'

interface FloatTagProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FloatTag: React.FC<FloatTagProps> = (props: FloatTagProps) => {
  return <div className={styles.floatTag}>{props.children}</div>
}
