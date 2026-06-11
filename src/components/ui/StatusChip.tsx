import React from 'react';
import { cn } from './GlassPanel';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface StatusChipProps {
  status: 'draft' | 'submitted' | 'under_review' | 'approved_public_aggregated' | 'rejected_sensitive';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, className }) => {
  const configs = {
    draft: { color: '#64748B', label: 'Borrador', Icon: Clock },
    submitted: { color: '#FBBF24', label: 'Enviado', Icon: Clock },
    under_review: { color: '#A855F7', label: 'En revisión', Icon: AlertCircle },
    approved_public_aggregated: { color: '#22C55E', label: 'Público Agregado', Icon: CheckCircle },
    rejected_sensitive: { color: '#EF4444', label: 'Sensible - No Público', Icon: AlertCircle },
  };

  const config = configs[status] || configs.draft;
  const { color, label, Icon } = config;

  return (
    <div 
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-opacity-10 text-[10px] font-semibold tracking-wide", className)}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}30`,
        color: color
      }}
    >
      <Icon size={10} />
      {label.toUpperCase()}
    </div>
  );
};
