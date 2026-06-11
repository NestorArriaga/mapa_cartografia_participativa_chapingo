 
import { MAPVIVO } from "../lib/colorScales";

export type NodeIntelligenceProfile = {
  coreColor: string;
  ringColor: string;
  auraColor: string;
  coreRadius: number;
  ringRadius: number;
  auraIntensity: number;
  categoryLabel: string;
};

export function computeNodeIntelligence(props: any): NodeIntelligenceProfile {
  const category = (props.category || props.categoria || props.nodeClass || "general").toLowerCase();
  const intensity = props.intensity || props.intensidad || 1;
  const isProtected = props.isProtected || category === "protegido_agregado";

  let baseColor = MAPVIVO.agriGreen;
  let categoryLabel = "Señal Territorial";

  if (isProtected) {
    baseColor = MAPVIVO.protectedGray;
    categoryLabel = "Testimonio Protegido";
  } else if (category.includes("documental") || category.includes("cualitativo")) {
    baseColor = MAPVIVO.magentaCare;
    categoryLabel = "Señal Cualitativa";
  } else if (category.includes("orientacion") || category.includes("infraestructura")) {
    baseColor = MAPVIVO.amberAttention;
    categoryLabel = "Orientación / Infraestructura";
  } else if (category.includes("recurso")) {
    baseColor = MAPVIVO.leafSoft;
    categoryLabel = "Recurso de Cuidado";
  }

  // Dynamic scaling based on intensity (1 to 5)
  const normalizedIntensity = Math.min(Math.max(intensity, 1), 5);
  
  return {
    coreColor: baseColor,
    ringColor: MAPVIVO.obsidian,
    auraColor: baseColor,
    coreRadius: isProtected ? 4 : 5 + (normalizedIntensity * 1.5),
    ringRadius: isProtected ? 6 : 7 + (normalizedIntensity * 1.5),
    auraIntensity: isProtected ? 0 : 0.2 + (normalizedIntensity * 0.1),
    categoryLabel
  };
}

export function generateNodeMapLibreStyles() {
  // Returns MapLibre paint properties logic derived from above
  return {
    coreColorExpr: [
      "match", ["get", "nodeClass"],
      "protegido_agregado", MAPVIVO.protectedGray,
      "documental", MAPVIVO.magentaCare,
      "cualitativo", MAPVIVO.magentaCare,
      "orientacion", MAPVIVO.amberAttention,
      "infraestructura", MAPVIVO.amberAttention,
      "recurso", MAPVIVO.leafSoft,
      MAPVIVO.agriGreen
    ],
    radiusExpr: [
      "interpolate", ["linear"], ["zoom"],
      14, ["+", 3, ["*", ["coalesce", ["get", "intensity"], 1], 1]],
      18, ["+", 6, ["*", ["coalesce", ["get", "intensity"], 1], 2]]
    ]
  };
}
