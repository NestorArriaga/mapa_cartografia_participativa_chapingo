import React from 'react';
import { MAPVIVO } from '../../lib/colorScales';

export const ZonePriorityChart: React.FC = () => {
  const priorities = [
    { label: 'Crítica', count: 3, color: MAPVIVO.coralAlert },
    { label: 'Alta', count: 7, color: MAPVIVO.orangeRoute },
    { label: 'Media', count: 12, color: MAPVIVO.amberAttention },
    { label: 'Baja', count: 5, color: MAPVIVO.agriGreen }
  ];
  
  const total = priorities.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="w-full mt-4 p-4 mv-metric-card">
      <h3 className="mv-section-title mb-2">Zonas por Prioridad</h3>
      <div className="flex w-full h-4 rounded-full overflow-hidden mb-3">
        {priorities.map((p, i) => (
          <div 
            key={i} 
            style={{ width: `${(p.count / total) * 100}%`, backgroundColor: p.color }}
            title={`${p.label}: ${p.count}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {priorities.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-300">{p.label} <span className="font-mono ml-1">{p.count}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};
