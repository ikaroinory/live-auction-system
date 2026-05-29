import styles from './FormCard.module.scss'

interface FormCardProps {
  title?: string
  children?: React.ReactNode
}

export const FormCard = (props: FormCardProps) => {
  return (
    <div className={styles.formCard}>
      {props.title && <div className={styles.formCardTitle}>{props.title}</div>}
      {props.children}
    </div>
  )
}
