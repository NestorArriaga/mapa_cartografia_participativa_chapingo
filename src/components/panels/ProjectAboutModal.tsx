import React from 'react';
import { Modal } from '../ui/Modal';
import { useUIStore } from '../../stores/uiStore';
import { Shield, BookOpen, AlertTriangle } from 'lucide-react';
import { GlowButton } from '../ui/GlowButton';

export const ProjectAboutModal: React.FC = () => {
  const isEthicsModalOpen = useUIStore((s) => s.isEthicsModalOpen);
  const closeEthicsModal = useUIStore((s) => s.closeEthicsModal);

  if (!isEthicsModalOpen) return null;

  return (
    <Modal isOpen={isEthicsModalOpen} onClose={closeEthicsModal} className="max-w-2xl">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Acerca del Mapa Vivo</h2>
        <p className="text-textSecondary mb-8 text-sm">Cartografía participativa ecofeminista de movilidad, cuidado y alerta.</p>

        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-full bg-mapCyan/10 border border-mapCyan/20 text-mapCyan mt-1">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">¿Qué es este mapa?</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Es una plataforma interactiva diseñada para visualizar dinámicas territoriales desde la perspectiva de las mujeres universitarias. No busca estigmatizar espacios, sino proveer evidencia para la toma de decisiones institucionales y el diseño de políticas de cuidado.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-full bg-mapViolet/10 border border-mapViolet/20 text-mapViolet mt-1">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">¿Cómo se protege la información?</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Utilizamos protocolos estrictos de ética de datos: los nombres, fechas exactas, números de matrícula y direcciones sensibles (internados, baños) <strong>jamás se exponen públicamente</strong>. La plataforma utiliza un Filtro Ético que difumina u oculta características vulnerables automáticamente.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-full bg-mapAmber/10 border border-mapAmber/20 text-mapAmber mt-1">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">¿Qué significa prioridad?</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                La "Prioridad Integrada" resulta de combinar altos porcentajes de alerta/evitación con deficiencias estructurales e incidentes reportados. Una zona prioritaria roja no es una "zona de delito generalizado", es un espacio de oportunidad urgente para la intervención física (iluminación, poda, pavimentación, cámaras).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
          <GlowButton onClick={closeEthicsModal}>Comprendido</GlowButton>
        </div>
      </div>
    </Modal>
  );
};
