import { BaseComponent, ComponentWithMembers } from "../interfaces"
import { MenuItem, MenuItemProps } from "./menu-item"
import styles from "./styles.module.scss"

interface MenuProps {
  items?: MenuItemProps[]
}

interface MenuMembers {
  Item: typeof MenuItem
}

const _Menu: BaseComponent<MenuProps> = ({items, ...props}) => {
  return (
    <div className={ styles.menu } {...props}>
      { items?.map(item => <MenuItem {...item}/>)}
    </div>
  )
}

export const Menu = _Menu as ComponentWithMembers<MenuProps, MenuMembers>
Menu.Item = MenuItem
