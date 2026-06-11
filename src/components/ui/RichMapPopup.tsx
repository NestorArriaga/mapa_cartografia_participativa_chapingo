import React from "react";
import { useLayoutStore } from "../../stores/layoutStore";
import { ShieldAlert, Route, MapPin, Layers } from "lucide-react";

interface RichMapPopupProps {
  feature: any;
  type: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  orientacion: "#D6A83A",
  documental: "#7EE2A8",
  cualitativo: "#F43F9D",
  memoria: "#F2C14E",
  recurso: "#35D07F",
  infraestructura: "#FB923C",
  movilidad: "#FBBF24",
  participacion: "#A855F7",
  protegido_agregado: "#64748B",
};

export const RichMapPopup: React.FC<RichMapPopupProps> = ({ feature, type }) => {
  const { setLeftPanelState, setRightPanelState } = useLayoutStore();
  const p = feature?.properties || {};

  // -- BOYESOS SPECIAL HANDLING --
  if (p._isBoyeros || String(p.id).toLowerCase() === "boyeros" || String(p.corridorType) === "corredor_cualitativo_validacion") {
    return (
      <div className="flex flex-col gap-4 animate-fade-in-up">
        <div className="bg-[#FBBF24]/10 rounded-xl p-4 border border-[#FBBF24]/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={18} className="text-[#FBBF24]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24]">Señal de validación cualitativa</span>
          </div>
          <h3 className="title-font text-xl font-bold text-white mb-2">Trayecto DICIFO–Boyeros</h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {p.summary || p.ethicalNote || "Evidencia testimonial de soledad, baja iluminación y baja presencia de acompañamiento."}
          </p>
          <div className="bg-black/20 rounded-lg p-3 border-l-2 border-[#FBBF24]">
            <p className="text-xs text-[#FBBF24] opacity-90 leading-tight m-0">
              Se muestra como señal agregada. No representa un punto exacto ni condición absoluta de riesgo, sino una vivencia documentada.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -- CORRIDOR HANDLING --
  if (type === "route-source" || p.corridorType) {
    const cType = String(p.corridorType || "ruta_territorial").replace(/_/g, " ");
    return (
      <div className="flex flex-col gap-4 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#35D07F] bg-[#35D07F]/10 px-2 py-1 rounded-md">
            {cType}
          </span>
          <Route size={16} className="text-gray-500" />
        </div>
        <div>
          <h3 className="title-font text-xl font-bold text-white mb-2">{p.title || p.nombre || "Trayecto"}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{p.summary || p.description || "Trayecto registrado en el sistema de movilidad."}</p>
        </div>
        {p.ethicalNote && (
          <div className="bg-[#FBBF24]/10 rounded-lg p-3 border-l-2 border-[#FBBF24]">
            <p className="text-xs text-[#FBBF24] leading-tight m-0">{p.ethicalNote}</p>
          </div>
        )}
        <button className="glass-button bg-white/5 border border-white/10 w-full py-3 rounded-xl mt-2 text-xs font-bold text-white uppercase tracking-wider">
          Calcular trayecto desde aquí
        </button>
      </div>
    );
  }

  // -- NODE HANDLING --
  if (type === "node-source" || p.category) {
    const catColor = CATEGORY_COLORS[p.category] || "#9AA9BA";
    const intensity = p.intensity || 2;
    
    return (
      <div className="flex flex-col gap-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1 items-end">
             {[1,2,3,4].map(l => (
               <div key={l} className="w-1 rounded-full" style={{ height: l*4, background: l <= intensity ? catColor : 'rgba(255,255,255,0.1)' }} />
             ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ color: catColor, background: `${catColor}15` }}>
            {p.category || "Nodo"}
          </span>
        </div>
        <div>
          <h3 className="title-font text-2xl font-bold text-white mb-2 leading-tight">{p.title || p.nombre || "Punto de Interés"}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3 font-medium">
            <MapPin size={12} /> {p.zoneName || p.zona || "Ubicación General"}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{p.description || p.summary || "Sin descripción disponible."}</p>
        </div>
        <button className="glass-button bg-white/5 border border-white/10 w-full py-3 rounded-xl mt-2 text-xs font-bold text-white uppercase tracking-wider">
          Ver Detalles Completos
        </button>
      </div>
    );
  }

  // -- ZONE HANDLING --
  if (type === "zone-source" || p.priorityLabel) {
    const label = p.priorityLabel || "Atención Base";
    const score = p.priorityScore || 0;
    
    return (
      <div className="flex flex-col gap-5 animate-fade-in-up">
        <div>
          <h3 className="title-font text-3xl font-bold text-white mb-1 tracking-tight">{p.name || p.nombre || "Zona Territorial"}</h3>
          <div className="text-sm font-bold" style={{ color: p.color || "#D6A83A" }}>{label}</div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
          <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">
            <span>Prioridad Calculada</span>
            <span>{Math.round(score)} / 100</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, score)}%`, background: p.color || "#D6A83A" }} />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase text-gray-500 mb-3 tracking-wider flex items-center gap-2">
            <Layers size={12} /> Señales Integradas
          </div>
          <div className="flex flex-wrap gap-2">
            {['Documental', 'Cualitativa', 'Participativa'].map(t => (
               <span key={t} className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded-md">{t}</span>
            ))}
          </div>
        </div>

        {p.notes && (
          <div className="text-sm text-gray-400 italic border-l-2 border-gray-600 pl-3 py-1">
            "{p.notes}"
          </div>
        )}

        <button 
          onClick={() => {
            setLeftPanelState("contracted");
            setRightPanelState("expanded");
          }}
          className="glass-button bg-[#D6A83A]/10 border border-[#D6A83A]/30 w-full py-3 rounded-xl mt-2 text-xs font-bold text-[#D6A83A] uppercase tracking-wider"
        >
          Explorar Zona
        </button>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-sm text-gray-300 animate-fade-in-up">
      <h3 className="title-font text-lg font-bold text-white mb-2">Elemento Seleccionado</h3>
      <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden bg-black/30 p-3 rounded-lg border border-white/10">
        {JSON.stringify(p, null, 2)}
      </pre>
    </div>
  );
};
