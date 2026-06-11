import React from "react";
import { useLayoutStore } from "../../stores/layoutStore";
import { useDataModeStore } from "../../stores/dataModeStore";
import { MonitorPlay, ShieldCheck, Database, HelpCircle } from "lucide-react";

export const TopBar: React.FC = () => {
  const { presentationMode, setPresentationMode } = useLayoutStore();
  const { mode } = useDataModeStore();

  if (presentationMode) return null; // In presentation mode, we hide the main top bar, or maybe we show a minimal one? 
  // "En modo presentación: Oculta todos los controles técnicos. Muestra solo el mapa con las capas de datos. Nombre de la plataforma en esquina superior izquierda..."
  // It's better to render the presentation overlay directly in App.stable.tsx.

  return (
    <div 
      className="absolute top-0 left-0 w-full h-12 z-50 glass-panel border-x-0 border-t-0 rounded-none flex items-center justify-between px-6"
      data-testid="top-bar"
    >
      <div className="flex items-baseline gap-3">
        <h1 className="title-font font-bold text-lg text-[#D6A83A] m-0">Mapa Vivo</h1>
        <span className="font-sans text-xs font-semibold text-gray-400">UACh–Texcoco</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 bg-[#030712]/50 border border-white/5 rounded-full">
        {mode === 'academic_internal' ? (
          <>
            <Database size={14} className="text-[#A855F7]" />
            <span className="text-[11px] font-bold text-[#A855F7] uppercase tracking-wider">Modo Académico</span>
          </>
        ) : (
          <>
            <ShieldCheck size={14} className="text-[#35D07F]" />
            <span className="text-[11px] font-bold text-[#35D07F] uppercase tracking-wider">Público Seguro</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setPresentationMode(true)}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          title="Modo Presentación (Tecla P)"
        >
          <MonitorPlay size={16} /> Presentación
        </button>
        <button className="text-gray-400 hover:text-white transition-colors" title="Ayuda">
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  );
};
