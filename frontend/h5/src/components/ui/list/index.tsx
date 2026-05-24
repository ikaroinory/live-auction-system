import { ReactNode, createContext, useContext, isValidElement } from 'react'
import styles from './styles.module.scss'
import { ChildrenProps } from '../interfaces'
import { isElementOfType } from '../utils'

interface ListProps extends ChildrenProps {
  className?: string
}

interface ListItemProps extends ChildrenProps {
  className?: string
  onClick?: () => void
}

const ListContext = createContext({})

export function List(props: ListProps) {
  const { children, className = '' } = props
  
  return (
    <ListContext.Provider value={{}}>
      <div className={`${styles.list} ${className}`}>
        {children}
      </div>
    </ListContext.Provider>
  )
}

function Item(props: ListItemProps) {
  const { children, className = '', onClick } = props

  return (
    <div 
      className={`${styles.listItem} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

List.Item = Item

export function isListItem(element: unknown): element is ReturnType<typeof Item> {
  return isElementOfType(element, Item)
}