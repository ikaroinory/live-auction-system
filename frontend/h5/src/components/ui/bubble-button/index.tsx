import React from 'react'
import styles from './styles.module.scss'

interface BubbleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const BubbleButton: React.FC<BubbleButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.bubbleButton} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
