import React from 'react';

interface BadgeProps {
  variant: 'outline' | 'filled';
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, className = '', style, children }) => {
  const variantClass = variant === 'outline' ? 'border border-white/20' : '';
  return (
    <span 
      style={style}
      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};
