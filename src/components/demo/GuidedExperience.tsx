import React, { useState } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { GlassPanel } from '../ui/GlassPanel';
import { Play, ChevronRight, X, MapPin, Eye, Route, Layers, ShieldAlert, Edit3 } from 'lucide-react';

const STEPS = [
  {
    id: 'intro',
    title: 'Lee el territorio',
    desc: 'Observatorio Vivo no es un mapa estático. Aquí la información se computa en tiempo real según las aportaciones y evidencias recolectadas.',
    icon: <Eye size={18} className="text-[#D6A83A]" />,
    viewState: { longitude: -98.8816, latitude: 19.4950, zoom: 14.5, pitch: 0, bearing: 0 },
    layers: ['zonas_prioridad_integrada_o_indicadores'],
    action: 'Observar'
  },
  {
    id: 'priorities',
    title: 'Observa prioridades',
    desc: 'Las zonas recalculan su color y opacidad basándose en el motor dinámico. Zonas en Magenta (Coral) requieren atención inmediata.',
    icon: <ShieldAlert size={18} className="text-[#FF4D5E]" />,
    viewState: { longitude: -98.8816, latitude: 19.4950, zoom: 15.5, pitch: 45, bearing: 15 },
    layers: ['zonas_prioridad_integrada_o_indicadores'],
    action: 'Siguiente'
  },
  {
    id: 'nodes',
    title: 'Explora nodos',
    desc: 'Los puntos pulsantes son los nodos. Su tamaño e intensidad reflejan su categoría institucional o comunitaria. La red los interconecta.',
    icon: <MapPin size={18} className="text-[#F43F9D]" />,
    viewState: { longitude: -98.8816, latitude: 19.4950, zoom: 16.5, pitch: 45, bearing: -15 },
    layers: ['zonas_prioridad_integrada_o_indicadores', 'nodos_orientacion_base', 'nodos_recursos_cuidado'],
    action: 'Ver Red'
  },
  {
    id: 'routes',
    title: 'Sigue trayectos',
    desc: 'Observa los flujos de movilidad y trayectos de lectura. La plataforma computa rutas sugeridas directamente sobre la marcha.',
    icon: <Route size={18} className="text-[#35D07F]" />,
    viewState: { longitude: -98.8840, latitude: 19.4970, zoom: 15.5, pitch: 50, bearing: 30 },
    layers: ['zonas_prioridad_integrada_o_indicadores', 'nodos_orientacion_base', 'trayectos_lectura'],
    action: 'Siguiente'
  },
  {
    id: 'contribute',
    title: 'Aporta al mapa',
    desc: 'Utiliza la barra de herramientas a tu derecha. Dibuja trayectos, marca zonas o lanza reportes rápidos. Tu información recalculará el mapa.',
    icon: <Edit3 size={18} className="text-[#A855F7]" />,
    viewState: { longitude: -98.8840, latitude: 19.4970, zoom: 15.5, pitch: 50, bearing: 30 },
    layers: ['zonas_prioridad_integrada_o_indicadores', 'nodos_orientacion_base', 'trayectos_lectura'],
    action: 'Terminar'
  }
];

export const GuidedExperience: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const { setViewState, setLayers } = useMapStore();

  const handleStart = () => goToStep(0);

  const goToStep = (index: number) => {
    if (index >= STEPS.length) {
      setActiveStepIndex(null);
      return;
    }
    
    const step = STEPS[index];
    setActiveStepIndex(index);
    setViewState({ ...step.viewState, transitionDuration: 2500 } as any);
    setLayers(step.layers);
  };

  if (activeStepIndex === null) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30" data-testid="guided-experience">
        <button 
          onClick={handleStart}
          className="flex items-center gap-2 px-4 py-2 bg-[#D6A83A]/20 hover:bg-[#D6A83A]/40 border border-[#D6A83A] text-[#D6A83A] rounded-full text-xs font-bold transition-all shadow-[0_0_15px_rgba(214,168,58,0.3)] backdrop-blur-md animate-pulse-slow"
        >
          <Play size={14} fill="currentColor" /> Iniciar Inmersión
        </button>
      </div>
    );
  }

  const step = STEPS[activeStepIndex];

  return (
    <GlassPanel className="absolute top-20 left-1/2 -translate-x-1/2 w-[350px] z-40 rounded-2xl shadow-2xl animate-slide-down border border-[#D6A83A]/50 bg-[#030712]/90 backdrop-blur-xl">
      <div className="p-6 relative">
        <button onClick={() => setActiveStepIndex(null)} className="absolute top-4 right-4 text-[#9AA9BA] hover:text-white transition-colors bg-white/5 p-1 rounded-full">
          <X size={16} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border border-white/5 shadow-inner">
            {step.icon}
          </div>
          <h3 className="font-['Sora'] font-extrabold text-white text-lg tracking-tight">{step.title}</h3>
        </div>
        
        <p className="text-sm text-[#9AA9BA] leading-relaxed mb-6 font-['Inter']">
          {step.desc}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeStepIndex ? 'w-6 bg-[#D6A83A]' : 'w-2 bg-white/20'}`} />
            ))}
          </div>
          
          <button 
            onClick={() => goToStep(activeStepIndex + 1)}
            className="flex items-center gap-1.5 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-xs font-bold text-white transition-all shadow-lg hover:scale-105"
          >
            {step.action} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
};
