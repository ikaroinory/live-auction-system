export interface ChildrenProps {
  children?: React.ReactNode
}

export type BaseComponent<
  B extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any> = 'div',
  P = {}
> = React.FC<P & React.ComponentProps<B>>

export type ComponentWithMembers<
  B extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any> = 'div',
  P = {},
  M extends object = {}
> = BaseComponent<B, P> & M
