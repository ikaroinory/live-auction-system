import { BaseComponent } from "../interfaces"
import styles from "./styles.module.scss"

export interface MenuItemProps {
  name: React.ReactNode
  icon?: React.ReactNode
}

export const MenuItem: BaseComponent<MenuItemProps> = ({name, icon, ...baseProps}) => {
  return (
    <div className={ styles.menuItem } {...baseProps}>
      { icon && <div>{ icon }</div> }
      <div>{ name }</div>
    </div>
  )
}
