import React from "react";
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { MAPVIVO } from "../../lib/colorScales";

interface InsightDeckProps {
  onSelectZone: (zoneName: string) => void;
}

export const InsightDeck: React.FC<InsightDeckProps> = ({ onSelectZone }) => {
  const insights = [
    {
      type: "priority",
      title: "Zona de Mayor Prioridad",
      value: "TRAMO ISSSTE - CHAPINGO",
      detail: "Registra el mayor número de incidencias acumuladas y reclamos de iluminación.",
      color: MAPVIVO.coralAlert,
      zoneKey: "TRAMO ISSSTE - CHAPINGO"
    },
    {
      type: "low_data",
      title: "Zona con Menos Datos",
      value: "BOYEROS",
      detail: "Se encuentra clasificada bajo 'Validación cualitativa' debido a testimonios locales pero baja muestra.",
      color: MAPVIVO.amberAttention,
      zoneKey: "Boyeros"
    },
    {
      type: "recommendation",
      title: "Recomendación Principal",
      value: "Validar corredor DICIFO–Boyeros",
      detail: "Se aconseja realizar recorridos por horario acompañados antes de emitir un diagnóstico estructural.",
      color: MAPVIVO.chapingoGold,
      zoneKey: "Boyeros"
    }
  ];

  return (
    <div className="space-y-3" data-testid="insight-deck">
      <h3 className="text-xs font-black text-[#D6A83A] uppercase tracking-wider mb-2 font-title">
        Alertas y Recomendaciones Clave
      </h3>
      <div className="space-y-2.5">
        {insights.map((ins, idx) => (
          <div
            key={idx}
            onClick={() => onSelectZone(ins.zoneKey)}
            className="p-3.5 rounded-xl border transition-all hover:bg-white/5 cursor-pointer bg-white/5"
            style={{ borderColor: `${ins.color}25` }}
            data-testid={`insight-card-${ins.type}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {ins.type === "priority" && <AlertCircle size={14} style={{ color: ins.color }} />}
              {ins.type === "low_data" && <FileText size={14} style={{ color: ins.color }} />}
              {ins.type === "recommendation" && <CheckCircle2 size={14} style={{ color: ins.color }} />}
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9AA9BA] font-title">
                {ins.title}
              </span>
            </div>
            <h4 className="text-xs font-black text-white leading-tight font-title mb-1">
              {ins.value}
            </h4>
            <p className="text-[11px] text-[#9AA9BA] leading-relaxed font-ui">
              {ins.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default InsightDeck;
