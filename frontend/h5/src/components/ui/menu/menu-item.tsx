import { NavigateOptions, To, useLocation, useNavigate } from 'react-router-dom'
import { BaseComponent } from '../interfaces'
import styles from './styles.module.scss'

interface NavigationProps {
  to: To
  options?: NavigateOptions
}

export interface MenuItemProps {
  name: React.ReactNode
  icon?: React.ReactNode
  navigation?: To | NavigationProps
}

function isNavigationProps(e?: To | NavigationProps): e is NavigationProps {
  return typeof e === 'object' && e !== null && 'to' in e
}

export const MenuItem: BaseComponent<'div', MenuItemProps> = ({
  name,
  icon,
  navigation,
  ...props
}) => {
  const navigate = useNavigate()
  const location = navigation !== undefined ? useLocation() : undefined

  const navigateTo = isNavigationProps(navigation) ? navigation.to : navigation
  const navigateOptions = isNavigationProps(navigation) ? navigation.options : undefined

  const onClick = () => {
    if (navigateTo === undefined) {
      return
    }

    navigate(navigateTo, navigateOptions)
  }

  return (
    <div className={styles.menuItem} onClick={onClick} {...props}>
      {icon && <div>{icon}</div>}
      <div
        className={
          location !== undefined && location.pathname === navigateTo
            ? styles.menuItemNameActivate
            : styles.menuItemName
        }
      >
        {name}
      </div>
    </div>
  )
}
