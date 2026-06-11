import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { X, Eye, ShieldAlert, Layers } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

export const LayerVisibilityInspector: React.FC = () => {
  const { debugMode, toggleDebugMode, activeLayers, mapDataStats } = useMapStore();

  if (!debugMode) return null;

  return (
    <GlassPanel className="absolute top-24 right-4 w-80 z-50 rounded-lg border-2 border-[#F43F9D] shadow-[0_0_20px_rgba(244,63,157,0.4)] animate-slide-left">
      <div className="p-4 relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[#F43F9D]">
            <Eye size={20} className="animate-pulse" />
            <h3 className="font-black tracking-widest text-sm uppercase">Rayos X Activo</h3>
          </div>
          <button onClick={toggleDebugMode} className="text-[#9AA9BA] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[#9AA9BA] leading-relaxed">
            Modo de diagnóstico visual. Las geometrías son amplificadas 3x, opacidades al 100% y bordes gruesos para auditar la visibilidad real sobre el canvas.
          </p>

          <div className="bg-black/40 rounded border border-[#F43F9D]/30 p-3">
            <h4 className="text-[10px] font-bold text-[#F43F9D] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layers size={12} /> Capas Activas y Dom (E2E)
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs" data-testid="zone-layer-visible" data-zone-count={mapDataStats.zones}>
                <span className="text-white">Zonas Renderizadas</span>
                <span className="font-mono text-[#D6A83A]">{mapDataStats.zones}</span>
              </div>
              <div className="flex justify-between text-xs" data-testid="node-layer-visible" data-node-count={mapDataStats.nodes}>
                <span className="text-white">Nodos Renderizados</span>
                <span className="font-mono text-[#F43F9D]">{mapDataStats.nodes}</span>
              </div>
              <div className="flex justify-between text-xs" data-testid="routes-layer-visible" data-route-count={mapDataStats.routes}>
                <span className="text-white">Rutas / Trayectos</span>
                <span className="font-mono text-[#35D07F]">{mapDataStats.routes}</span>
              </div>
              <div className="flex justify-between text-xs" data-testid="mobility-layer-visible" data-mobility-count={mapDataStats.mobility}>
                <span className="text-white">Partículas Movilidad</span>
                <span className="font-mono text-[#EAF2FF]">{mapDataStats.mobility}</span>
              </div>
            </div>
          </div>

          {activeLayers.length === 0 && (
            <div className="flex items-start gap-2 p-2 bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40 rounded text-xs">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              <span>No hay capas activadas. El sistema no renderizará datos.</span>
            </div>
          )}
        </div>
      </div>
    </GlassPanel>
  );
};
