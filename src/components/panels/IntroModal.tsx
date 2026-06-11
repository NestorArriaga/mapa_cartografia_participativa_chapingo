import React from 'react';
import { Modal } from '../ui/Modal';
import { useUIStore } from '../../stores/uiStore';
import { GlowButton } from '../ui/GlowButton';
import { Shield } from 'lucide-react';

export const IntroModal: React.FC = () => {
  const { isIntroModalOpen, closeIntroModal } = useUIStore();

  return (
    <Modal isOpen={isIntroModalOpen} hideClose className="max-w-xl">
      <div className="p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-mapCyan/10 flex items-center justify-center mb-6 glow-border-cyan">
          <Shield className="text-mapCyan" size={32} />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
          Este no es un mapa de peligro.<br />
          Es una cartografía de cuidado.
        </h1>
        
        <p className="text-textPrimary text-base mb-8 leading-relaxed max-w-md mx-auto text-balance">
          Esta plataforma reúne datos abiertos, percepción colectiva, evidencia documental y aportaciones participativas para comprender cómo se vive la movilidad cotidiana de mujeres en Chapingo y su entorno Texcoco. La información se presenta de forma agregada y no representa peligro generalizado.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <GlowButton onClick={closeIntroModal} className="w-full sm:w-auto min-w-[160px]">
            Entrar al mapa
          </GlowButton>
          <GlowButton variant="secondary" onClick={closeIntroModal} className="w-full sm:w-auto min-w-[160px]">
            Leer reglas éticas
          </GlowButton>
        </div>
      </div>
    </Modal>
  );
};
