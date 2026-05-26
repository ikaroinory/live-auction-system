import { BaseComponent } from '../interfaces'
import styles from './styles.module.scss'

interface AvatarProps {
  url?: string
  shape?: 'circle' | 'square'
  defaultUrl?: string
}

export const Avatar: BaseComponent<AvatarProps> = ({ url, shape, defaultUrl, ...props}) => {
  const _shape = shape || 'circle'
  const _url = url || defaultUrl

  return (
    <div className={ styles.avatar } { ...props }>
      { _url !== undefined && _shape === 'circle' && <img className={ styles.avatarCircle } src={ _url } /> }
      { _url !== undefined && _shape === 'square' && <img className={ styles.avatarSquare } src={ _url } /> }
    </div>
  )
}
