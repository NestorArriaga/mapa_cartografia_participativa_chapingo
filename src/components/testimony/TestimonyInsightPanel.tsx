import React from "react";
import { MessageSquare, Heart, ShieldAlert, AlertCircle, PlusCircle } from "lucide-react";
import { useDataModeStore } from "../../stores/dataModeStore";
import { useLiveMetricsStore } from "../../stores/liveMetricsStore";

interface TestimonyInsightPanelProps {
  onOpenForm: () => void;
  selectedZoneName?: string | null;
}

export const TestimonyInsightPanel: React.FC<TestimonyInsightPanelProps> = ({ onOpenForm, selectedZoneName }) => {
  const { mode } = useDataModeStore();
  const localSubmissions = useLiveMetricsStore((state) => state.localSubmissions);

  // Sanitized fragments list for academic mode
  const academicFragments = [
    {
      zone: "SALITRERIA",
      text: "...el trayecto hacia Salitrería carece por completo de alumbrado público secundario en las noches...",
      factors: ["iluminación", "soledad"]
    },
    {
      zone: "COOPERATIVO/CABAÑAS",
      text: "...en la zona arbolada de las Cabañas el paso peatonal se siente muy aislado por las tardes...",
      factors: ["soledad", "acompañamiento"]
    },
    {
      zone: "TRAMO ISSSTE - CHAPINGO",
      text: "...los desvíos generados por el acceso cerrado incrementan el tiempo de traslado expuesto...",
      factors: ["acceso cerrado", "transporte"]
    },
    {
      zone: "Boyeros",
      text: "...evidencia testimonial señala soledad, baja iluminación y escaso acompañamiento hacia Boyeros...",
      factors: ["soledad", "iluminación", "acompañamiento"]
    }
  ];

  // Filter based on selected zone if any
  const filteredFragments = selectedZoneName
    ? academicFragments.filter(f => f.zone.toLowerCase() === selectedZoneName.toLowerCase())
    : academicFragments;

  const zoneCount: Record<string, number> = {
    "Chapingo": 8,
    "Salitrería": 5,
    "Cooperativo/Cabañas": 4,
    "Tramo ISSSTE": 6,
    "Boyeros": 2
  };

  const themes = [
    "iluminación",
    "soledad",
    "acompañamiento",
    "acceso cerrado",
    "transporte",
    "rumores/señalamientos",
    "apoyo informal",
    "vulnerabilidad percibida",
    "validación pendiente"
  ];

  return (
    <div className="space-y-4 p-4 rounded-xl bg-black/30 border border-white/5" data-testid="testimony-insight-panel">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-[#D6A83A] uppercase tracking-wider flex items-center gap-2 font-title">
          <MessageSquare size={16} />
          Testimonios Sanitizados
        </h3>
        <button
          onClick={onOpenForm}
          className="flex items-center gap-1 text-[11px] font-bold text-[#F43F9D] bg-[#F43F9D]/10 hover:bg-[#F43F9D]/20 px-2.5 py-1 rounded-lg border border-[#F43F9D]/25 transition-all cursor-pointer"
          data-testid="btn-add-testimony"
        >
          <PlusCircle size={12} />
          Aportar testimonio cuidado
        </button>
      </div>

      {/* Testimony counts by zone */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {Object.entries(zoneCount).map(([zone, count]) => (
          <div key={zone} className="bg-white/5 p-2 rounded-lg border border-white/5 flex justify-between items-center">
            <span className="text-[#9AA9BA]">{zone}</span>
            <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{count}</span>
          </div>
        ))}
      </div>

      {/* Detected themes and factors */}
      <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
        <h4 className="text-[10px] font-bold text-[#9AA9BA] uppercase tracking-wider flex items-center gap-1 font-title">
          <Heart size={10} className="text-[#F43F9D]" />
          Factores y Temas Frecuentes
        </h4>
        <div className="flex flex-wrap gap-1">
          {themes.map(t => (
            <span key={t} className="text-[9px] font-medium bg-black/40 text-[#9AA9BA] px-2 py-0.5 rounded border border-white/5">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Local submissions count */}
      {localSubmissions.length > 0 && (
        <div className="bg-[#35D07F]/10 border border-[#35D07F]/20 p-2.5 rounded-lg text-xs text-[#35D07F] flex items-center gap-2">
          <AlertCircle size={14} />
          <span>Tienes {localSubmissions.length} aportaciones locales agregadas en esta sesión.</span>
        </div>
      )}

      {/* Sanitized fragments based on mode */}
      <div className="space-y-2.5">
        {mode === "academic_internal" ? (
          <>
            <div className="bg-[#A855F7]/10 border border-[#A855F7]/20 p-2.5 rounded-lg text-[10px] text-[#A855F7] flex items-center gap-2">
              <ShieldAlert size={14} />
              <span>Modo académico: mostrando fragmentos cualitativos sanitizados.</span>
            </div>
            {filteredFragments.map((f, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-2">
                <p className="text-white italic leading-relaxed font-ui">"{f.text}"</p>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#D6A83A] font-bold uppercase tracking-wider">{f.zone}</span>
                  <div className="flex gap-1 text-[#9AA9BA]">
                    {f.factors.map(fact => (
                      <span key={fact} className="bg-black/20 px-1.5 py-0.5 rounded text-[8px]">{fact}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center space-y-2">
            <ShieldAlert size={20} className="text-[#A855F7] mx-auto" />
            <p className="text-xs text-[#9AA9BA] font-ui leading-relaxed">
              Ingresa al Modo Académico para consultar fragmentos sanitizados bajo principios éticos de cuidado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default TestimonyInsightPanel;
