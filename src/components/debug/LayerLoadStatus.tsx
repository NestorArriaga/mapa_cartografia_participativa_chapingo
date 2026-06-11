import React, { useEffect } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { AlertTriangle, CheckCircle, Loader2, RefreshCw, Layers } from 'lucide-react';
import { getPublicLayers } from '../../lib/loaders';

export const LayerLoadStatus: React.FC = () => {
  const loadState = useMapStore(s => s.loadState);
  const loadedLayerIds = useMapStore(s => s.loadedLayerIds);
  const failedLayerIds = useMapStore(s => s.failedLayerIds);
  const setLoadState = useMapStore(s => s.setLoadState);
  
  const publicLayers = getPublicLayers();
  
  // Timeout watchdog
  useEffect(() => {
    if (loadState !== 'loading') return;
    
    const timer = setTimeout(() => {
      // If we are still strictly loading after 12s, force a timeout state
      if (loadedLayerIds.length > 0) {
        setLoadState('partial_error', 'Tiempo de espera agotado para algunas capas');
      } else {
        setLoadState('fatal_error', 'Tiempo de carga agotado. Revisa tu conexión.');
      }
    }, 12000);
    
    return () => clearTimeout(timer);
  }, [loadState, loadedLayerIds.length, setLoadState]);

  if (loadState === 'idle' || loadState === 'loaded') return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm transition-opacity duration-500">
      <div className="pointer-events-auto bg-[#0B1220]/95 border border-[#1E293B] rounded-2xl p-6 shadow-2xl max-w-md w-full animate-slide-up">
        
        <div className="flex items-center gap-4 mb-6">
          {loadState === 'loading' ? (
            <div className="h-12 w-12 rounded-full bg-cyanData/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-cyanData animate-spin" />
            </div>
          ) : loadState === 'partial_error' ? (
            <div className="h-12 w-12 rounded-full bg-amberAttention/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amberAttention" />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-coralAlert/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-coralAlert" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-white">
              {loadState === 'loading' ? 'Cargando plataforma...' : 
               loadState === 'partial_error' ? 'Advertencia de carga' : 'Error crítico de carga'}
            </h3>
            <p className="text-sm text-mutedText">
              {loadState === 'loading' ? 'Obteniendo datos geoespaciales' : 
               'Algunas capas no pudieron cargarse'}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6 bg-[#030712]/50 p-4 rounded-xl border border-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-mutedText flex items-center gap-2"><Layers size={14}/> Capas objetivo</span>
            <span className="text-white font-medium">{publicLayers.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-mutedText flex items-center gap-2"><CheckCircle size={14} className="text-agriGreen"/> Cargadas con éxito</span>
            <span className="text-agriGreen font-medium">{loadedLayerIds.length}</span>
          </div>
          {failedLayerIds.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <span className="text-coralAlert text-sm flex items-center gap-2"><AlertTriangle size={14}/> Fallaron:</span>
              <ul className="text-xs text-mutedText list-disc pl-5">
                {failedLayerIds.map(id => <li key={id}>{id}</li>)}
              </ul>
            </div>
          )}
        </div>

        {loadState !== 'loading' && (
          <div className="flex justify-end gap-3">
            {loadState === 'partial_error' && (
              <button 
                onClick={() => setLoadState('loaded')}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Continuar de todos modos
              </button>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium bg-cyanData/10 text-cyanData hover:bg-cyanData/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
