import styles from './styles.module.scss'
import { BaseComponent } from '../interfaces'
import clsx from 'clsx'

interface BubbleButtonProps { }

export const BubbleButton: BaseComponent<'button', BubbleButtonProps> = ({ children, className, ...props }) => {
  return (
    <button className={ clsx(styles.bubbleButton, className) } {...props}>
      {children}
    </button>
  )
}
