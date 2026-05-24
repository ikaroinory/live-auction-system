import styles from './styles.module.scss'

interface AvatarProps {
  url?: string
  shape?: 'circle' | 'square'
  defaultUrl?: string
}

export function Avatar(props: AvatarProps) {
  const shape = props.shape || 'circle'
  const url = props.url || props.defaultUrl

  return (
    <div className={ styles.avatar }>
      { url !== undefined && shape === 'circle' && <img className={ styles.avatarCircle } src={ url } /> }
      { url !== undefined && shape === 'square' && <img className={ styles.avatarSquare } src={ url } /> }
    </div>
  )
}
