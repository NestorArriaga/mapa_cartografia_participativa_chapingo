import React from "react";
import { Camera, Code, Link2, FileText, ClipboardList } from "lucide-react";
import { useMapStore } from "../../stores/mapStore";
import { useLiveMetricsStore } from "../../stores/liveMetricsStore";
import { getRecommendationsForFeature } from "../../services/recommendationEngine";
import { getSignalsByZone } from "../../services/territorialSignalEngine";

interface ExportToolsProps {
  selectedZoneName?: string | null;
}

export const ExportTools: React.FC<ExportToolsProps> = ({ selectedZoneName }) => {
  const { selectedFeatureId } = useMapStore();
  const localSubmissions = useLiveMetricsStore((state) => state.localSubmissions);

  const handleDownloadPNG = () => {
    const canvas = (document.querySelector(".maplibregl-canvas") || 
                    document.querySelector(".mapboxgl-canvas")) as HTMLCanvasElement;
    if (!canvas) {
      alert("No se pudo capturar el canvas del mapa en este momento.");
      return;
    }
    const link = document.createElement("a");
    link.download = `mapa-vivo-export-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(localSubmissions, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `aportaciones_locales_${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    if (selectedFeatureId) url.searchParams.set("feature", selectedFeatureId);
    navigator.clipboard.writeText(url.toString());
    alert("¡Enlace de vista copiado al portapapeles!");
  };

  const handleDownloadZoneReport = () => {
    const zoneName = selectedZoneName || "UNIVERSIDAD AUTONOMA CHAPINGO";
    const signals = getSignalsByZone(zoneName);
    const recommendations = getRecommendationsForFeature({ properties: { displayName: zoneName } });

    // Build the report content
    const report = `# Ficha Académica de Zona: ${zoneName}

## Resumen de Prioridad
- **Clasificación:** ${zoneName.toLowerCase().includes("boyeros") ? "Validación cualitativa" : "Prioridad Alta"}
- **Confianza:** Media/Alta
- **Nota Ética:** Los datos espaciales y testimonios están agrupados territorialmente para salvaguardar la privacidad individual.

## Desglose Cuantitativo y Cualitativo
${signals.map(s => `- **${s.title}** (${s.source}): ${s.summary}`).join("\n")}

## Recomendaciones de Cuidado
${recommendations.map((r, i) => `${i + 1}. **${r.title}**: ${r.description} *(Límite ético: ${r.ethicalLimit})*`).join("\n")}

---
Generado de forma segura por la Plataforma Académica Mapa Vivo UACh-Texcoco.
`;

    const blob = new Blob([report], { type: "text/markdown" });
    const link = document.createElement("a");
    link.download = `ficha_zona_${zoneName.replace(/\s+/g, "_")}.md`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleExportAcademicMarkdown = () => {
    const report = `# Resumen Académico Completo - Mapa Vivo UACh-Texcoco

## Resumen del Diagnóstico Territorial
Esta plataforma consolida el análisis de conectividad y cuidado de la Universidad Autónoma Chapingo y sus zonas periféricas (Salitrería, Cooperativo, ISSSTE-Chapingo, Boyeros).

## Aportaciones Recibidas (Locales)
Actualmente se registran ${localSubmissions.length} aportaciones locales en memoria.

## Límite de Uso
Este reporte contiene datos agregados y está restringido a uso docente, de investigación y planeación de movilidad de cuidado.
`;
    const blob = new Blob([report], { type: "text/markdown" });
    const link = document.createElement("a");
    link.download = `resumen_academico_completo_${Date.now()}.md`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }} data-testid="export-tools-container">
      <button 
        onClick={handleDownloadPNG} 
        data-testid="export-btn-png"
        style={{
          padding: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: "#9AA9BA",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        title="Descargar captura PNG del Mapa"
      >
        <Camera size={14} />
      </button>
      <button 
        onClick={handleExportJSON} 
        data-testid="export-btn-json"
        style={{
          padding: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: "#35D07F",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        title="Exportar Aportaciones de Participación (JSON)"
      >
        <Code size={14} />
      </button>
      <button 
        onClick={handleCopyLink} 
        data-testid="export-btn-link"
        style={{
          padding: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: "#D6A83A",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        title="Copiar Enlace de Vista actual"
      >
        <Link2 size={14} />
      </button>
      <button 
        onClick={handleDownloadZoneReport} 
        data-testid="export-btn-zone"
        style={{
          padding: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: "#F43F9D",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        title="Descargar Ficha Académica de Zona"
      >
        <FileText size={14} />
      </button>
      <button 
        onClick={handleExportAcademicMarkdown} 
        data-testid="export-btn-summary"
        style={{
          padding: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          color: "#A855F7",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
        title="Exportar Resumen Académico Markdown"
      >
        <ClipboardList size={14} />
      </button>
    </div>
  );
};
export default ExportTools;
