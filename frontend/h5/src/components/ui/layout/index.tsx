import { Children, Component, ReactNode } from "react"
import { ChildrenProps } from "../interfaces"
import { isElementOfType, useWindowHeight } from "../utils"
import styles from './styles.module.scss'

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


export function Layout({ children }: LayoutProps) {
  const windowHeight = useWindowHeight()

  let mainContent: ReactNode = null
  let footerContent: ReactNode = null
  console.log(styles);
  

  Children.forEach(children, (child) => {
    if (isElementOfType(child, Main)) {
      mainContent = child.props.children
    }
    if (isElementOfType(child, Footer)) {
      footerContent = child.props.children
    }
  })

  return (
    <div className={ styles.layoutContainer } style={{ height: windowHeight }}>
      <div className={ styles.layoutContent }>{mainContent}</div>
      <div className={ styles.layoutFooter }>{footerContent}</div>
    </div>
  )
}

Layout.Main = Main
Layout.Footer = Footer
