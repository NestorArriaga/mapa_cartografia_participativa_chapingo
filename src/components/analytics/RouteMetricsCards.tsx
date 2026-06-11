import React from 'react';
import { Activity, Route, ShieldAlert } from 'lucide-react';

export const RouteMetricsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      <div className="mv-metric-card flex flex-col items-center justify-center p-2 text-center">
        <Route size={16} className="text-[#35D07F] mb-1" />
        <span className="text-xl font-mono font-bold text-white leading-tight">12</span>
        <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">Rutas<br/>Seguras</span>
      </div>
      
      <div className="mv-metric-card flex flex-col items-center justify-center p-2 text-center">
        <Activity size={16} className="text-[#F2C14E] mb-1" />
        <span className="text-xl font-mono font-bold text-white leading-tight">28</span>
        <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">Puntos<br/>Activos</span>
      </div>
      
      <div className="mv-metric-card flex flex-col items-center justify-center p-2 text-center">
        <ShieldAlert size={16} className="text-[#FF4D5E] mb-1" />
        <span className="text-xl font-mono font-bold text-white leading-tight">5</span>
        <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">Zonas de<br/>Atención</span>
      </div>
    </div>
  );
};
