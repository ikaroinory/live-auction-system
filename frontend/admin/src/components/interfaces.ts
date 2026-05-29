import { JSX, ReactNode } from 'react'

type IntrinsicElementOrComponent = keyof JSX.IntrinsicElements | React.JSXElementConstructor<ReactNode>

export type BaseComponent<
  ElementType extends IntrinsicElementOrComponent = 'div',
  PropsType extends object = object
> = React.FC<PropsType & React.ComponentProps<ElementType>>

export type ComponentWithMembers<
  ElementType extends IntrinsicElementOrComponent = 'div',
  PropsType extends object = object,
  MembersInterface extends object = object
> = BaseComponent<ElementType, PropsType> & MembersInterface
