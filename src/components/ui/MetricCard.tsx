import React from 'react';
import { cn } from './GlassPanel';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, className }) => {
  return (
    <div className={cn("flex flex-col p-4 rounded-[16px] bg-[rgba(15,23,42,0.4)] border border-white/5", className)}>
      <span className="text-label-small mb-1">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-metric text-textPrimary">{value}</span>
        {subValue && (
          <span className="text-[12px] text-textSecondary font-mono">{subValue}</span>
        )}
      </div>
    </div>
  );
};
