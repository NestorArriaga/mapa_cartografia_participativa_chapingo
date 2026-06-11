import React from 'react';
import { cn } from './GlassPanel';
import { Eye, EyeOff } from 'lucide-react';

interface LayerToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  colorHex?: string;
}

export const LayerToggle: React.FC<LayerToggleProps> = ({ label, isActive, onToggle, colorHex = '#22D3EE' }) => {
  return (
    <button 
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between w-full p-3 rounded-[12px] transition-all",
        "border",
        isActive 
          ? "bg-[rgba(30,41,59,0.5)] border-[rgba(255,255,255,0.1)]" 
          : "bg-transparent border-transparent hover:bg-[rgba(30,41,59,0.3)]"
      )}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full transition-all"
          style={{ 
            backgroundColor: isActive ? colorHex : 'transparent',
            border: `1px solid ${colorHex}`,
            boxShadow: isActive ? `0 0 8px ${colorHex}80` : 'none'
          }}
        />
        <span className={cn(
          "text-[13px] transition-colors font-medium",
          isActive ? "text-textPrimary" : "text-textSecondary"
        )}>
          {label}
        </span>
      </div>
      {isActive ? <Eye size={16} className="text-textSecondary" /> : <EyeOff size={16} className="text-textMuted opacity-50" />}
    </button>
  );
};
