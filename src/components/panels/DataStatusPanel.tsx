import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { Shield, Database, CheckCircle, EyeOff } from 'lucide-react';

export const DataStatusPanel: React.FC = () => {
  const presentationMode = useMapStore(s => s.presentationMode);
  if (presentationMode) return null;

  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-2 pointer-events-auto">
      <div className="ethics-chip glass-panel px-3 py-1.5 border-mapCyan/20 text-mapCyan">
        <CheckCircle size={12} />
        <span>Datos Sanitizados V06</span>
      </div>
      <div className="ethics-chip glass-panel px-3 py-1.5 border-mapViolet/20 text-mapViolet">
        <Shield size={12} />
        <span>Filtro Ético Activo</span>
      </div>
      <div className="ethics-chip glass-panel px-3 py-1.5 border-white/10 text-textMuted">
        <Database size={12} />
        <span>Movilidad Ligera</span>
      </div>
      <div className="ethics-chip glass-panel px-3 py-1.5 border-mapCoral/20 text-mapCoral">
        <EyeOff size={12} />
        <span>Sensibles Protegidos</span>
      </div>
    </div>
  );
};
