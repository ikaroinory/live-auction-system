import { ComponentType, isValidElement, ReactElement, ReactNode } from "react";

export function isElementOfType<P>(child: ReactNode, component: ComponentType<P>): child is ReactElement<P> {
  return isValidElement(child) && child.type === component;
}
