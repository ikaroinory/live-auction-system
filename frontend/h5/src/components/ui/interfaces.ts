export interface ChildrenProps {
  children?: React.ReactNode
}

export type BaseComponent<
  B extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown> = 'div',
  P = Record<string, never>,
> = React.FC<P & React.ComponentProps<B>>

export type ComponentWithMembers<
  B extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown> = 'div',
  P = Record<string, never>,
  M extends object = Record<string, never>,
> = BaseComponent<B, P> & M
