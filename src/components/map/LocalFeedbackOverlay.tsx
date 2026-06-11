import React from 'react';
import { useParticipationStore } from '../../stores/participationStore';

export const LocalFeedbackOverlay: React.FC = () => {
  const activeHaloZone = useParticipationStore((s) => s.activeHaloZone);

  if (!activeHaloZone) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-slide-up">
      <div className="bg-white/10 backdrop-blur-md border border-mapCyan/30 rounded-full px-6 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mapCyan opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-mapCyan"></span>
        </div>
        <p className="text-white text-sm font-medium">Aportación recibida para revisión en <span className="text-mapCyan">{activeHaloZone}</span></p>
      </div>
    </div>
  );
};
