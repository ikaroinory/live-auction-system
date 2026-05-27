import { Children, Component, ReactNode } from 'react'
import { ChildrenProps } from '../interfaces'
import { isElementOfType, useWindowHeight } from '../utils'
import styles from './styles.module.scss'

class Header extends Component<ChildrenProps> {
  render(): ReactNode {
    return this.props.children
  }
}

class Main extends Component<ChildrenProps> {
  render(): ReactNode {
    return this.props.children
  }
}

class Footer extends Component<ChildrenProps> {
  render(): ReactNode {
    return this.props.children
  }
}

type LayoutProps = ChildrenProps

export function Layout(props: LayoutProps) {
  const windowHeight = useWindowHeight()

  let headerContent: ReactNode = null
  let mainContent: ReactNode = null
  let footerContent: ReactNode = null

  Children.forEach(props.children, (child) => {
    if (isElementOfType(child, Header)) {
      headerContent = child.props.children
    }
    if (isElementOfType(child, Main)) {
      mainContent = child.props.children
    }
    if (isElementOfType(child, Footer)) {
      footerContent = child.props.children
    }
  })

  return (
    <div className={styles.layout} style={{ height: windowHeight }}>
      {headerContent && <div className={styles.layoutHeader}>{headerContent}</div>}
      <div className={styles.layoutMain}>{mainContent}</div>
      {footerContent && <div className={styles.layoutFooter}>{footerContent}</div>}
    </div>
  )
}

Layout.Header = Header
Layout.Main = Main
Layout.Footer = Footer
