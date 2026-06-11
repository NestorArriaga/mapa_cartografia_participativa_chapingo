import React from 'react';
import { getPriorityColor } from '../../lib/colorScales';
import { cn } from './GlassPanel';

interface PriorityBadgeProps {
  priority: 'muy_alta' | 'alta' | 'media' | 'baja' | 'sin_datos' | 'recurso_apoyo' | 'revision' | string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const color = getPriorityColor(priority);
  const formattedPriority = priority.replace('_', ' ').toUpperCase();
  
  return (
    <div 
      className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border", className)}
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}40`,
      }}
    >
      <div 
        className="w-1.5 h-1.5 rounded-full"
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}`
        }}
      />
      <span 
        className="text-[10px] font-bold tracking-wider"
        style={{ color: color }}
      >
        {formattedPriority}
      </span>
    </div>
  );
};
