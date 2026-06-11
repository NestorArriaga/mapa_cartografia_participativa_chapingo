import React from 'react';
import { ParticipatorySubmission } from '../../types/submissions';
import { submissionService } from '../../services/submissionService';
import { GlowButton } from '../ui/GlowButton';
import { moderationService } from '../../services/moderationService';

interface Props {
  submission: ParticipatorySubmission;
  onClose: () => void;
  onUpdated: () => void;
}

export const SubmissionInspector: React.FC<Props> = ({ submission, onClose, onUpdated }) => {
  const flags = moderationService.detectSubmissionSensitivity(submission);
  const reason = moderationService.getModerationReason(submission);

  const handleUpdate = async (status: ParticipatorySubmission['status']) => {
    await submissionService.updateStatus(submission.id, status);
    onUpdated();
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('¿Eliminar esta aportación de forma permanente?')) {
      await submissionService.remove(submission.id);
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="w-80 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white text-base">Detalle</h3>
        <button onClick={onClose} className="text-textMuted hover:text-white">✕</button>
      </div>

      <div className="space-y-3 text-sm flex-1">
        <div>
          <span className="text-textMuted text-xs block">ID</span>
          <span className="text-white font-mono text-[10px]">{submission.id}</span>
        </div>
        <div>
          <span className="text-textMuted text-xs block">Diagnóstico Automático</span>
          <p className="text-mapCoral text-xs mt-1">{reason}</p>
        </div>
        
        {submission.testimonyText && (
          <div className="bg-white/5 p-2 rounded text-textSecondary italic text-xs">
            "{submission.testimonyText}"
          </div>
        )}

        <div>
          <span className="text-textMuted text-xs block">Zona / Ubicación</span>
          <p className="text-white">{submission.zoneName || 'Ubicación aproximada / requiere revisión'}</p>
        </div>

        {flags.length > 0 && (
          <div>
            <span className="text-textMuted text-xs block">Banderas Sensibles</span>
            <ul className="list-disc pl-4 text-mapCoral text-xs mt-1">
              {flags.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <GlowButton variant="secondary" onClick={() => handleUpdate('under_review')} className="text-xs">
          Marcar bajo revisión
        </GlowButton>
        <GlowButton onClick={() => handleUpdate('approved_public_aggregated')} className="text-xs">
          Aprobar para agregación
        </GlowButton>
        <button onClick={() => handleUpdate('rejected_sensitive')} className="text-mapCoral hover:underline text-xs py-1">
          Rechazar por sensible
        </button>
        <button onClick={handleDelete} className="text-textMuted hover:text-mapCoral transition-colors text-xs py-1 mt-2">
          Borrar Local
        </button>
      </div>
    </div>
  );
};
