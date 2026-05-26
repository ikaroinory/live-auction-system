import { BaseComponent } from "../interfaces"
import { MenuItem, MenuItemProps } from "./menu-item"
import styles from "./styles.module.scss"

interface MenuProps {
  items?: MenuItemProps[]
}

export const Menu: BaseComponent<'div', MenuProps> = ({items, ...props}) => {
  return (
    <div className={ styles.menu } {...props}>
      { items?.map(item => <MenuItem { ...item }/>)}
    </div>
  )
}
