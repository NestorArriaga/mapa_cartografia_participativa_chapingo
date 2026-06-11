import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { GlowButton } from '../ui/GlowButton';
import { MapPin, ArrowRight, ArrowLeft, Shield, Eye, Layers } from 'lucide-react';

const STEPS = [
  {
    title: 'Zonas de Prioridad',
    content: 'El mapa destaca en colores cálidos las áreas donde las mujeres reportaron mayores niveles de alerta o evitación durante sus trayectos. No son "zonas peligrosas", sino áreas que requieren intervención prioritaria.',
    icon: <Layers className="text-mapCoral" size={32} />
  },
  {
    title: 'Nodos Documentales',
    content: 'Cada punto representa evidencia cualitativa: incidentes, fallas estructurales o recursos de apoyo. Puedes interactuar con ellos para leer un resumen de la situación.',
    icon: <MapPin className="text-mapCyan" size={32} />
  },
  {
    title: 'Participación Anónima',
    content: 'Puedes sumar tu experiencia a la cartografía en tiempo real usando el formulario de participación. Tu información se agrega de manera segura y no publica datos personales.',
    icon: <Eye className="text-mapAmber" size={32} />
  },
  {
    title: 'Ética y Protección',
    content: 'Las ubicaciones de residencias, baños y lugares privados nunca se muestran de forma exacta. Usamos técnicas de difuminación espacial (anillos punteados o halos amplios) para proteger a las personas.',
    icon: <Shield className="text-mapViolet" size={32} />
  }
];

export const DemoTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Can be triggered globally via UI store, but kept local for demo
  const [step, setStep] = useState(0);

  // In a real implementation we would control map view state via mapStore

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="absolute top-4 left-[380px] z-10 glass-panel px-4 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-colors">
      <ArrowRight size={14} className="text-mapCyan" /> Demo Guiada
    </button>
  );

  const current = STEPS[step];

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} hideClose={true}>
      <div className="p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 neon-ring">
          {current.icon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{current.title}</h2>
        <p className="text-textSecondary leading-relaxed mb-8 max-w-sm">
          {current.content}
        </p>

        <div className="flex items-center gap-4 w-full">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 rounded-full border border-white/10 text-white hover:bg-white/5">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="flex-1">
            <GlowButton className="w-full justify-center" onClick={() => {
              if (step < STEPS.length - 1) setStep(s => s + 1);
              else setIsOpen(false);
            }}>
              {step < STEPS.length - 1 ? 'Siguiente' : 'Comenzar a explorar'}
            </GlowButton>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-mapCyan' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </Modal>
  );
};
