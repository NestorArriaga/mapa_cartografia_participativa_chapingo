import React, { useState } from "react";
import { MAPVIVO } from "../../lib/colorScales";

interface LegendItem {
  key: string;
  label: string;
  color: string;
  desc: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { key: "orientacion", label: "Orientación", color: MAPVIVO.softWhite, desc: "Puntos cardinales, accesos y hitos de referencia." },
  { key: "documental", label: "Documental", color: MAPVIVO.magentaCare, desc: "Registros históricos y archivos institucionales." },
  { key: "cualitativo", label: "Cualitativo", color: MAPVIVO.amberAttention, desc: "Señales de percepción de seguridad y cuidado." },
  { key: "memoria", label: "Memoria Colectiva", color: MAPVIVO.coralAlert, desc: "Narrativas vivas e historia oral." },
  { key: "recurso", label: "Apoyo / Recurso", color: MAPVIVO.agriGreen, desc: "Zonas iluminadas, casetas e infraestructura de auxilio." },
  { key: "infraestructura", label: "Infraestructura", color: MAPVIVO.orangeRoute, desc: "Muros, paradas de transporte y equipamiento." },
  { key: "movilidad", label: "Movilidad", color: MAPVIVO.chapingoGold, desc: "Rutas peatonales y paraderos." },
  { key: "participacion", label: "Aporte Local", color: MAPVIVO.leafSoft, desc: "Reportes participativos recientes." },
  { key: "protegido", label: "Protegido", color: MAPVIVO.violetReview, desc: "Datos confidenciales en proceso de resguardo académico." }
];

interface NodeLegendProps {
  onHighlightCategory?: (category: string | null) => void;
}

export const NodeLegend: React.FC<NodeLegendProps> = ({ onHighlightCategory }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleItemClick = (key: string) => {
    const nextCategory = activeCategory === key ? null : key;
    setActiveCategory(nextCategory);
    if (onHighlightCategory) {
      onHighlightCategory(nextCategory);
    }
  };

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: 12,
      padding: 10,
      marginTop: 6
    }}>
      <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#9AA9BA", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-title)" }}>
        Leyenda de Señales
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 8px" }}>
        {LEGEND_ITEMS.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: item.color,
              display: "inline-block",
              boxShadow: `0 0 8px ${item.color}80, inset 0 0 0 1px rgba(255,255,255,0.4)`
            }} />
            <span style={{ fontSize: "10px", color: "#9AA9BA", fontFamily: "var(--font-ui)" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
