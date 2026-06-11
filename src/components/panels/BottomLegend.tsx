import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { Layers, Activity, Eye, Network, EyeOff, X } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { Switch } from '../ui/Switch';

export const BottomLegend: React.FC = () => {
  const { 
    showHalos, toggleHalos, 
    showConnectors, toggleConnectors, 
    showLabels, toggleLabels, 
    debugMode, toggleDebugMode 
  } = useMapStore();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
      <GlassPanel className="rounded-2xl px-6 py-3 flex items-center gap-8 shadow-2xl border border-white/10 bg-[#030712]/80">
        
        <div className="flex gap-6">
          <ToggleItem 
            active={showHalos} 
            onClick={toggleHalos} 
            icon={<Activity size={16} />} 
            label="Animaciones Vivas" 
            color="#FF4D5E"
          />
          <ToggleItem 
            active={showConnectors} 
            onClick={toggleConnectors} 
            icon={<Network size={16} />} 
            label="Flujos de Movilidad" 
            color="#35D07F"
          />
          <ToggleItem 
            active={showLabels} 
            onClick={toggleLabels} 
            icon={<Layers size={16} />} 
            label="Etiquetas Contextuales" 
            color="#D6A83A"
          />
        </div>

        <div className="w-[1px] h-8 bg-white/20" />

        <button 
          onClick={toggleDebugMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            debugMode 
              ? 'bg-[#F43F9D]/20 text-[#F43F9D] border border-[#F43F9D]/50 shadow-[0_0_10px_rgba(244,63,157,0.5)]' 
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-transparent'
          }`}
        >
          {debugMode ? <Eye size={14} /> : <EyeOff size={14} />}
          Rayos X
        </button>

      </GlassPanel>
    </div>
  );
};

const ToggleItem = ({ active, onClick, icon, label, color }: any) => (
  <div 
    className="flex items-center gap-2 cursor-pointer group"
    onClick={onClick}
  >
    <div className="text-white/50 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{label}</span>
    <Switch 
      checked={active} 
      onChange={onClick} 
      className={`ml-1 ${active ? `bg-[${color}]` : 'bg-white/20'}`} 
      style={{ backgroundColor: active ? color : undefined }}
    />
  </div>
);
