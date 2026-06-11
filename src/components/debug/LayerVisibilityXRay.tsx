import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { Eye, EyeOff, Layers } from 'lucide-react';

export const LayerVisibilityXRay: React.FC = () => {
  const { debugMode, toggleDebugMode } = useMapStore();

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
      <button 
        onClick={toggleDebugMode}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Space Grotesk'] font-bold uppercase tracking-wider text-sm transition-all border ${
          debugMode 
            ? 'bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E] shadow-[0_0_20px_rgba(255,77,94,0.5)] animate-pulse'
            : 'bg-[#030712]/80 text-[#9AA9BA] border-white/10 hover:text-white hover:border-white/30 backdrop-blur-md'
        }`}
      >
        {debugMode ? <Eye size={18} /> : <EyeOff size={18} />}
        Rayos X
      </button>

      {debugMode && (
        <div className="bg-[#030712]/95 border border-[#FF4D5E] p-4 rounded-lg shadow-2xl backdrop-blur-xl w-64 animate-slide-left">
          <h4 className="text-[#FF4D5E] font-['Space Grotesk'] font-bold text-xs mb-3 flex items-center gap-2">
            <Layers size={14} /> DIAGNÓSTICO VISUAL FORZADO
          </h4>
          <p className="text-xs text-[#9AA9BA] mb-3 leading-relaxed font-['Inter']">
            Modo X-Ray activo. Los grosores se multiplicaron x4 y los colores se forzaron a la capa coral de alerta para detectar fugas de renderizado.
          </p>
          <div className="space-y-1 text-[10px] font-['JetBrains Mono'] text-white/70">
            <div className="flex justify-between"><span>Zonas Renderizadas</span><span className="text-[#35D07F]">ON</span></div>
            <div className="flex justify-between"><span>Nodos Amplificados</span><span className="text-[#35D07F]">ON</span></div>
            <div className="flex justify-between"><span>Datos Sensibles</span><span className="text-[#FF4D5E]">OFF (Seguro)</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
