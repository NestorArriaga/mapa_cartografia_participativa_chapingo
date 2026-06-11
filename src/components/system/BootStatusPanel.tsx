import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export const BootStatusPanel: React.FC = () => {
  const loadState = useMapStore(s => s.loadState);
  const loadedLayers = useMapStore(s => s.loadedLayerIds);
  const failedLayers = useMapStore(s => s.failedLayerIds);
  const activeLayers = useMapStore(s => s.activeLayers);

  // Solamente mostrar durante la carga inicial o si hay errores persistentes en dev mode
  if (loadState === 'loaded') return null;

  const isError = loadState === 'fatal_error' || loadState === 'partial_error';

  return (
    <div data-testid="boot-status-panel" className="absolute top-4 left-4 z-[100] max-w-sm w-full bg-[#0B1220]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        {loadState === 'loading' ? (
          <Loader2 className="animate-spin text-cyanData" size={20} />
        ) : isError ? (
          <XCircle className="text-red-500" size={20} />
        ) : (
          <CheckCircle2 className="text-agriGreen" size={20} />
        )}
        <div>
          <h3 className="text-sm font-bold text-white">Secuencia de Arranque</h3>
          <p className="text-xs text-slate-400">
            {loadState === 'loading' ? 'Cargando infraestructura geoespacial...' : 
             loadState === 'fatal_error' ? 'Fallo crítico en el motor de mapas' :
             loadState === 'partial_error' ? 'Carga completada con advertencias' : 'Listo'}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center border-b border-white/5 pb-2" data-testid="map-load-state">
          <span className="text-slate-400">Estado del Mapa Base</span>
          <span className="text-white font-medium">Inicializado</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-slate-400">Registry de Datos</span>
          <span className="text-white font-medium">Conectado</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-2" data-testid="layers-load-state">
          <span className="text-slate-400">Capas Solicitadas</span>
          <span className="text-white font-medium">{activeLayers.length}</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-slate-400">Capas Exitosas</span>
          <span className="text-agriGreen font-bold">{loadedLayers.length}</span>
        </div>
        {failedLayers.length > 0 && (
          <div className="flex justify-between items-center pb-1">
            <span className="text-red-400">Capas Fallidas</span>
            <span className="text-red-500 font-bold">{failedLayers.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
