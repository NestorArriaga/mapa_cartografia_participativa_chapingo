import React from 'react';
import { useSubmissionStore } from '../../stores/submissionStore';
import { getPublicLayers } from '../../lib/loaders';

export const InsightCards: React.FC = () => {
  const localSubmissions = useSubmissionStore((s) => s.getLocalSubmissionsCount());
  const publicLayers = getPublicLayers();
  
  const zonesCount = publicLayers.filter((l) => l.group === 'web_publico_core').length;
  const nodesCount = publicLayers.filter((l) => l.group === 'web_publico_nodos').length;

  return (
    <div className="grid grid-cols-2 gap-2 mb-5 animate-fade-in">
      <div className="metric-card-premium">
        <div className="text-label-small mb-1 text-textMuted">Zonas</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white">{zonesCount > 0 ? '5' : '—'}</span>
          <span className="text-[10px] text-mapCyan">integradas</span>
        </div>
      </div>
      <div className="metric-card-premium">
        <div className="text-label-small mb-1 text-textMuted">Nodos</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white">{nodesCount > 0 ? '20+' : '—'}</span>
          <span className="text-[10px] text-mapAmber">revisados</span>
        </div>
      </div>
      <div className="metric-card-premium col-span-2">
        <div className="text-label-small mb-1 text-textMuted">Aportaciones Locales</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-mapCyan">{localSubmissions}</span>
          <span className="text-[10px] text-textSecondary">pendientes de agregación</span>
        </div>
      </div>
    </div>
  );
};
