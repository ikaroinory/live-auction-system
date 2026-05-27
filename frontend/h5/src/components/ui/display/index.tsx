import { BaseComponent, ComponentWithMembers } from '../interfaces'
import { DisplayItem, DisplayItemProps } from './display-item'
import styles from './styles.module.scss'

interface DisplayProps {
  items?: DisplayItemProps[]
}

interface DisplayMembers {
  Item: typeof DisplayItem
}

const _Display: BaseComponent<'div', DisplayProps> = ({ items, ...props }) => {
  return (
    <div className={styles.display} {...props}>
      {items?.map((item) => (
        <DisplayItem {...item} />
      ))}
      {props.children}
    </div>
  )
}

export const Display = _Display as ComponentWithMembers<'div', DisplayProps, DisplayMembers>
Display.Item = DisplayItem
