import { MAPVIVO } from "../../../lib/colorScales";

export interface NodeVisualProperties {
  visualClass: string;
  visualColor: string;
  visualHaloColor: string;
  visualRingColor: string;
  visualLabel: string;
  visualGlyph: string;
  visualScale: number;
  visualImportance: number;
  relatedZoneName: string | null;
  relatedRouteIds: string[];
  signalCount: number;
  recommendationCount: number;
}

export const getNodeClassStyles = (nodeClass: string) => {
  const c = String(nodeClass).toLowerCase();
  
  if (c.includes("orientaci")) return {
    visualColor: MAPVIVO.softWhite,
    visualHaloColor: "rgba(244,247,251,0.26)",
    visualRingColor: MAPVIVO.chapingoGold,
    visualScale: 5.5,
    visualHaloRadius: 24,
    glyphId: "glyph-compass"
  };
  
  if (c.includes("documental")) return {
    visualColor: MAPVIVO.magentaCare,
    visualHaloColor: "rgba(244,63,157,0.34)",
    visualRingColor: MAPVIVO.maize,
    visualScale: 7.5,
    visualHaloRadius: 42,
    glyphId: "glyph-document"
  };
  
  if (c.includes("cualitativo")) return {
    visualColor: MAPVIVO.amberAttention,
    visualHaloColor: "rgba(251,191,36,0.40)",
    visualRingColor: MAPVIVO.magentaCare,
    visualScale: 8.5,
    visualHaloRadius: 52,
    glyphId: "glyph-quote"
  };
  
  if (c.includes("memoria")) return {
    visualColor: MAPVIVO.coralAlert,
    visualHaloColor: "rgba(255,77,94,0.36)",
    visualRingColor: MAPVIVO.magentaCare,
    visualScale: 8.5,
    visualHaloRadius: 54,
    glyphId: "glyph-spark"
  };
  
  if (c.includes("recurso") || c.includes("cuidado")) return {
    visualColor: MAPVIVO.agriGreen,
    visualHaloColor: "rgba(53,208,127,0.34)",
    visualRingColor: MAPVIVO.leafSoft,
    visualScale: 8.5,
    visualHaloRadius: 48,
    glyphId: "glyph-leaf"
  };
  
  if (c.includes("infraestructura")) return {
    visualColor: MAPVIVO.orangeRoute,
    visualHaloColor: "rgba(251,146,60,0.34)",
    visualRingColor: MAPVIVO.amberAttention,
    visualScale: 8.0,
    visualHaloRadius: 44,
    glyphId: "glyph-triangle"
  };
  
  if (c.includes("movilidad")) return {
    visualColor: MAPVIVO.chapingoGold,
    visualHaloColor: "rgba(214,168,58,0.34)",
    visualRingColor: MAPVIVO.orangeRoute,
    visualScale: 7.0,
    visualHaloRadius: 38,
    glyphId: "glyph-route"
  };
  
  if (c.includes("participaci") || c.includes("aporte")) return {
    visualColor: MAPVIVO.leafSoft,
    visualHaloColor: "rgba(126,226,168,0.42)",
    visualRingColor: MAPVIVO.chapingoGold,
    visualScale: 8.5,
    visualHaloRadius: 56,
    glyphId: "glyph-plus"
  };
  
  if (c.includes("protegido")) return {
    visualColor: MAPVIVO.violetReview,
    visualHaloColor: "rgba(168,85,247,0.30)",
    visualRingColor: MAPVIVO.protectedGray,
    visualScale: 8.0,
    visualHaloRadius: 60,
    glyphId: "glyph-protected"
  };
  
  // Default
  return {
    visualColor: MAPVIVO.chapingoGold,
    visualHaloColor: "rgba(214,168,58,0.30)",
    visualRingColor: MAPVIVO.magentaCare,
    visualScale: 6.0,
    visualHaloRadius: 32,
    glyphId: "glyph-dot"
  };
};

export const precomputeNodeVisuals = (feature: any): any => {
  const props = feature.properties || {};
  const nodeClass = props.clase || props.type || props.tipo || "orientacion";
  
  const styles = getNodeClassStyles(nodeClass);
  
  return {
    ...feature,
    properties: {
      ...props,
      visualClass: nodeClass,
      visualColor: styles.visualColor,
      visualHaloColor: styles.visualHaloColor,
      visualRingColor: styles.visualRingColor,
      visualLabel: props.nombre || props.name || "",
      visualGlyph: styles.glyphId,
      visualScale: styles.visualScale,
      visualHaloRadius: styles.visualHaloRadius,
      visualImportance: props.priority || 1,
      relatedZoneName: props.zona || null,
      relatedRouteIds: props.rutas ? String(props.rutas).split(",") : [],
      signalCount: props.senales || 1,
      recommendationCount: props.recomendaciones || 0
    }
  };
};
