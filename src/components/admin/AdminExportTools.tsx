import React from 'react';
import { submissionService } from '../../services/submissionService';
import { Download } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';

export const AdminExportTools: React.FC = () => {
  const handleExport = async () => {
    try {
      const blob = await submissionService.exportJSON();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aportaciones_locales_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando:', err);
    }
  };

  return (
    <div className="flex gap-2">
      <GlowButton variant="secondary" onClick={handleExport} className="px-3 py-1.5 text-xs flex items-center gap-2">
        <Download size={14} />
        Exportar JSON
      </GlowButton>
    </div>
  );
};
