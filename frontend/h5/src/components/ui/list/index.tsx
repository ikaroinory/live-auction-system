import { createContext, ReactNode } from 'react'
import { isElementOfType } from '../utils'
import styles from './styles.module.scss'

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: ReactNode
  value?: ReactNode
  extra?: ReactNode
}

const ListContext = createContext<Record<string, never>>({})

export function List(props: React.HTMLAttributes<HTMLDivElement>) {
  const { children, className = '', style } = props

  return (
    <ListContext.Provider value={{}}>
      <div className={`${styles.list} ${className}`} style={style}>
        {children}
      </div>
    </ListContext.Provider>
  )
}

function Item(props: ListItemProps) {
  const { children, className = '', onClick, label, value, extra } = props

  return (
    <div className={`${styles.listItem} ${className}`} onClick={onClick}>
      {label !== undefined || value !== undefined || extra !== undefined ? (
        <>
          {label !== undefined && <div className={styles.listItemLabel}>{label}</div>}
          <div className={styles.listItemContent}>
            {value !== undefined && <div className={styles.listItemValue}>{value}</div>}
            {extra !== undefined && <div className={styles.listItemExtra}>{extra}</div>}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  )
}

List.Item = Item

export function isListItem(element: unknown): element is ReturnType<typeof Item> {
  return isElementOfType(element, Item)
}
