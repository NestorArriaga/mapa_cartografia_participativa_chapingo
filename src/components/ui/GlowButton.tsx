import React from 'react';
import { cn } from './GlassPanel';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const GlowButton: React.FC<GlowButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className,
  ...props 
}) => {
  const baseClasses = "relative overflow-hidden rounded-full font-medium text-[14px] transition-all duration-300 flex items-center justify-center gap-2 px-6 py-3";
  
  const variants = {
    primary: "bg-gradient-to-r from-mapMagenta via-mapCoral to-mapCyan text-white shadow-[0_0_20px_rgba(244,63,157,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] border border-white/20",
    secondary: "glass-button text-textPrimary hover:text-white",
    danger: "bg-[rgba(255,59,92,0.15)] text-mapCoral border border-mapCoral/30 hover:bg-[rgba(255,59,92,0.25)] hover:shadow-[0_0_15px_rgba(255,59,92,0.3)]"
  };

  return (
    <button 
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
