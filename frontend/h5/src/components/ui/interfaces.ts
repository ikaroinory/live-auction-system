export interface ChildrenProps {
  children?: React.ReactNode
}

export type BaseComponent<P> = React.FC<P & React.ComponentProps<'div'>>
export type ComponentWithMembers<P, M extends object> = BaseComponent<P> & M
