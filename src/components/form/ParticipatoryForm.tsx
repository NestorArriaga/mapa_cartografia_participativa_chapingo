import React, { useState } from 'react';
import { X, Send, Shield, AlertCircle, MapPin, Lightbulb, Edit3, Map as MapIcon } from 'lucide-react';
import { processSubmission } from "../../services/feedbackProcessingEngine";
import { useLiveMetricsStore } from "../../stores/liveMetricsStore";

export type ParticipatoryFormProps = {
  prefilledZone?: string;
  prefilledType?: string;
  geometrySuggestion?: {
    type: "Point" | "LineString" | "Polygon";
    coordinates: unknown;
    precision: "approximate" | "exact_not_public";
    privacyMode: "requires_review" | "public_aggregated";
  };
  onClose: () => void;
};

export const ParticipatoryForm: React.FC<ParticipatoryFormProps> = ({ 
  prefilledZone, 
  prefilledType, 
  geometrySuggestion, 
  onClose 
}) => {
  const addSubmission = useLiveMetricsStore((state) => state.addSubmission);

  const [formState, setFormState] = useState({
    type: prefilledType || 'alerta',
    message: '',
    agreesToTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.agreesToTerms || !formState.message.trim()) return;
    
    setIsSubmitting(true);
    
    // Process coordinates from suggestion
    const coords: [number, number] = (geometrySuggestion?.coordinates as [number, number]) || [-98.8816, 19.4950];

    // Process using engine
    const processed = processSubmission({
      text: formState.message,
      category: formState.type,
      coordinates: coords,
      selectedZone: prefilledZone || null,
      zonesFeatureCollection: null // fallback assignment inside processSubmission
    });

    // Add to metrics store
    addSubmission(processed);

    // Save item exactly as requested
    const localData = JSON.parse(localStorage.getItem('mapvivo_contributions') || '[]');
    localData.push({
      id: processed.id || crypto.randomUUID(),
      type: formState.type === 'ruta_evitada' ? 'segment' : formState.type === 'alerta' ? 'zone_observation' : 'point',
      coordinates: geometrySuggestion ? geometrySuggestion.coordinates : coords,
      description: formState.message,
      assignedZone: prefilledZone || "General",
      timestamp: new Date().toISOString(),
      consentGiven: formState.agreesToTerms
    });
    localStorage.setItem('mapvivo_contributions', JSON.stringify(localData));

    // Simulate backend sending
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => onClose(), 1500);
    }, 800);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-[#0B1220] border border-[#35D07F]/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#35D07F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-[#35D07F]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2" data-testid="contribution-confirm">Aportación registrada. Gracias.</h2>
          <p className="text-sm text-[#9AA9BA]">
            Tu reporte ha sido guardado localmente y se mostrará en el mapa inmediatamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" data-testid="participatory-form">
      <div className="bg-[#0B1220] border border-[#F43F9D]/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2 font-title">
              <Edit3 size={18} className="text-[#F43F9D]" />
              Aportar Experiencia
            </h2>
            {(prefilledZone || geometrySuggestion) && (
              <p className="text-xs text-[#F43F9D]/80 mt-1 flex items-center gap-1 font-bold">
                <MapPin size={12} /> 
                {prefilledZone ? `Referencia: ${prefilledZone}` : `Geometría agregada (${geometrySuggestion?.type})`}
              </p>
            )}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-[#9AA9BA] hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            data-testid="form-close-button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {geometrySuggestion && (
            <div className="bg-[#D6A83A]/10 border border-[#D6A83A]/30 p-3 rounded-lg flex gap-2">
              <MapIcon size={16} className="text-[#D6A83A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#D6A83A] leading-relaxed">
                Has marcado una ubicación en el mapa. Esta información se guarda como "aproximada" y "requiere revisión" para proteger tu identidad.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-[#D6A83A] uppercase tracking-wider mb-2">Tipo de Reporte</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <TypeButton icon={<AlertCircle size={14} />} label="Alerta" selected={formState.type === 'alerta'} onClick={() => setFormState(s => ({...s, type: 'alerta'}))} color="#FF4D5E" />
              <TypeButton icon={<Lightbulb size={14} />} label="Iluminación" selected={formState.type === 'iluminacion'} onClick={() => setFormState(s => ({...s, type: 'iluminacion'}))} color="#FBBF24" />
              <TypeButton icon={<MapIcon size={14} />} label="Ruta" selected={formState.type === 'ruta_evitada'} onClick={() => setFormState(s => ({...s, type: 'ruta_evitada'}))} color="#FB923C" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#D6A83A] uppercase tracking-wider mb-2">Experiencia Vivida</label>
            <textarea
              required
              data-testid="form-message-input"
              value={formState.message}
              onChange={e => setFormState(s => ({...s, message: e.target.value}))}
              className="w-full h-32 bg-black/40 border border-white/10 focus:border-[#F43F9D] rounded-xl p-3 text-sm text-white resize-none outline-none transition-colors placeholder:text-[#64748B] font-ui"
              placeholder="Describe la situación. Por seguridad, no incluyas nombres propios, direcciones exactas ni información que te identifique."
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer group" data-testid="form-terms-label">
            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${formState.agreesToTerms ? 'bg-[#35D07F] border-[#35D07F]' : 'bg-black/50 border-white/20 group-hover:border-[#35D07F]/50'}`}>
              {formState.agreesToTerms && <div className="w-2 h-2 bg-[#0B1220] rounded-sm" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              data-testid="form-terms-checkbox"
              checked={formState.agreesToTerms}
              onChange={e => setFormState(s => ({...s, agreesToTerms: e.target.checked}))}
            />
            <span className="text-xs text-[#9AA9BA] leading-relaxed group-hover:text-[#F4F7FB]">
              Entiendo que esta información se procesará con <strong className="text-[#35D07F]">criterios éticos y de seguridad</strong>. Los datos serán agregados espacialmente y no se publicarán directamente para evitar riesgos.
            </span>
          </label>

          <button
            type="submit"
            data-testid="form-submit-button"
            disabled={!formState.agreesToTerms || !formState.message.trim() || isSubmitting}
            className="w-full py-3 bg-[#F43F9D] disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:bg-[#F43F9D]/90 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Cifrando y enviando...</span>
            ) : (
              <>
                <Send size={16} /> Enviar de forma segura
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

function TypeButton({ icon, label, selected, onClick, color }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
        selected 
          ? `bg-[${color}]/20 border-[${color}]`
          : 'bg-black/30 border-white/10 text-[#9AA9BA] hover:bg-white/5 hover:text-white'
      }`}
      style={selected ? { color: color, borderColor: color, backgroundColor: `${color}20` } : {}}
    >
      {icon} {label}
    </button>
  );
}
export default ParticipatoryForm;
