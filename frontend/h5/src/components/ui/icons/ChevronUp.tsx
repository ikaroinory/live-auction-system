import React from 'react';

interface ChevronUpIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const ChevronUpIcon: React.FC<ChevronUpIconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
};
