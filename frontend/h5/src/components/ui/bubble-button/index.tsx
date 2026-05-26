import styles from './styles.module.scss'
import { BaseComponent } from '../interfaces'

interface BubbleButtonProps { }

export const BubbleButton: BaseComponent<'button', BubbleButtonProps> = ({ children, ...props }) => {
  return (
    <button className={ styles.bubbleButton } {...props}>
      {children}
    </button>
  )
}
