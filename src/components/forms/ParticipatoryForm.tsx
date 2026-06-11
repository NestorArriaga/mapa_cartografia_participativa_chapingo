import React, { useState } from 'react';
import { useLiveMetricsStore } from '../../stores/liveMetricsStore';

export const ParticipatoryForm: React.FC<{
  onClose: () => void;
  geometrySuggestion?: any;
  initialSubmissionType?: string;
}> = ({ onClose, geometrySuggestion, initialSubmissionType }) => {
  const { addLocalSubmission, refreshMetrics } = useLiveMetricsStore();
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save locally
    const existing = JSON.parse(localStorage.getItem('ecoFemSubmissions') || '[]');
    const sub = {
      type: 'Feature',
      geometry: geometrySuggestion || null,
      properties: {
        description: desc,
        submissionType: initialSubmissionType || 'general',
        timestamp: new Date().toISOString(),
        requires_review: true,
        privacyMode: 'requires_review'
      }
    };
    
    existing.push(sub);
    localStorage.setItem('ecoFemSubmissions', JSON.stringify(existing));
    
    addLocalSubmission(sub);
    refreshMetrics();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#030712] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <h2 className="text-[#F43F9D] font-bold font-['Space_Grotesk'] text-xl mb-2 tracking-tight">
          Aportar al Territorio
        </h2>
        <p className="text-[#9AA9BA] text-xs mb-6 font-['Inter'] leading-relaxed">
          La información aquí depositada será tratada éticamente. Ningún punto exacto será publicado. Tus observaciones enriquecerán estadísticamente el mapa base.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#D6A83A] mb-2">Narrativa de lo vivido</label>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#F43F9D] focus:ring-1 focus:ring-[#F43F9D] min-h-[120px] font-['Inter']"
              placeholder="Ej: Frecuentemente esta vía carece de iluminación después de las 20:00hrs..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg text-xs font-bold bg-white/5 text-[#9AA9BA] hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-3 rounded-lg text-xs font-bold bg-[#F43F9D]/20 text-[#F43F9D] border border-[#F43F9D]/50 hover:bg-[#F43F9D] hover:text-white transition-all shadow-[0_0_15px_rgba(244,63,157,0.3)] hover:shadow-[0_0_25px_rgba(244,63,157,0.6)] uppercase tracking-wider font-['Space_Grotesk']">
              Someter Aporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
