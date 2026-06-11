export const DISPLAY_NAMES_MAP: Record<string, string> = {
  ZONES: "Zonas de prioridad",
  EVIDENCEPOLYGONS: "Evidencia agregada",
  DOCUMENTARYNODES: "Nodos documentales",
  ORIENTATIONNODES: "Nodos de orientación",
  MOBILITYLINES: "Movilidad ligera",
  CONNECTORS: "Conexiones visuales",
  READINGROUTES: "Trayectos de lectura",
  CAMPUSROUTES: "Rutas internas del campus",
  PROTECTEDAGGREGATES: "Señales protegidas agregadas",
  QUALITATIVESIGNALS: "Señales cualitativas",
  NODENETWORK: "Red de nodos",

  // Lowercase/camelCase keys from dataset mapping
  zones: "Zonas de prioridad",
  evidencePolygons: "Evidencia agregada",
  documentaryNodes: "Nodos documentales",
  orientationNodes: "Nodos de orientación",
  mobilityLines: "Movilidad ligera",
  connectors: "Conexiones visuales",
  readingRoutes: "Trayectos de lectura",
  campusRoutes: "Rutas internas del campus",
  protectedAggregates: "Señales protegidas agregadas",
  protectedAggregatesByZone: "Señales protegidas agregadas",
  qualitativeSignals: "Señales cualitativas",
  qualitativeSignalsByZone: "Señales cualitativas",
  reviewAggregatesByZone: "Reportes en revisión",
  nodeNetwork: "Red de nodos",
  localFeedback: "Aportaciones locales"
};

export function layerDisplayName(raw: string): string {
  const upper = (raw || "").trim().toUpperCase();
  if (DISPLAY_NAMES_MAP[upper]) {
    return DISPLAY_NAMES_MAP[upper];
  }
  
  const clean = (raw || "").trim();
  if (DISPLAY_NAMES_MAP[clean]) {
    return DISPLAY_NAMES_MAP[clean];
  }

  // Double fallback to ensure no technical layer names leak
  if (upper.includes("ZONE")) return "Zonas de prioridad";
  if (upper.includes("EVIDENCE")) return "Evidencia agregada";
  if (upper.includes("DOCUMENTARY")) return "Nodos documentales";
  if (upper.includes("ORIENTATION")) return "Nodos de orientación";
  if (upper.includes("MOBILITY")) return "Movilidad ligera";
  if (upper.includes("CONNECTOR")) return "Conexiones visuales";
  if (upper.includes("READING") || upper.includes("ROUTE")) return "Trayectos de lectura";
  if (upper.includes("CAMPUS")) return "Rutas internas del campus";
  if (upper.includes("PROTECTED")) return "Señales protegidas agregadas";
  if (upper.includes("QUALITATIVE")) return "Señales cualitativas";
  if (upper.includes("NETWORK")) return "Red de nodos";

  return raw;
}

export function layerDescription(raw: string): string {
  const upper = (raw || "").toUpperCase();
  if (upper.includes("ZONE")) {
    return "Prioridades territoriales identificadas mediante diagnóstico y encuestas. No representa un dictamen absoluto.";
  }
  if (upper.includes("EVIDENCE")) {
    return "Registros de evidencia documental agregada a nivel territorial.";
  }
  if (upper.includes("DOCUMENTARY")) {
    return "Puntos de memoria y testimonios documentados de manera comunitaria.";
  }
  if (upper.includes("ORIENTATION")) {
    return "Puntos de orientación y referencia física dentro de la Universidad Autónoma Chapingo.";
  }
  if (upper.includes("MOBILITY")) {
    return "Vías de circulación y contexto de conectividad peatonal.";
  }
  if (upper.includes("CONNECTOR")) {
    return "Ejes visuales y de conexión entre los distintos nodos.";
  }
  if (upper.includes("READING") || (upper.includes("ROUTE") && !upper.includes("CAMPUS"))) {
    return "Rutas y trayectos de lectura académica fuera del campus. No son rutas seguras.";
  }
  if (upper.includes("CAMPUS")) {
    return "Trayectos sugeridos y caminos internos de movilidad en el campus. No son rutas seguras.";
  }
  if (upper.includes("PROTECTED")) {
    return "Agregaciones de señales sensibles protegidas por zona. Modo Académico Interno.";
  }
  if (upper.includes("QUALITATIVE")) {
    return "Señales y trayectos cualitativos identificados por testimonios en proceso de validación.";
  }
  if (upper.includes("NETWORK")) {
    return "Grafo conceptual de conectividad y proximidad de la red de nodos.";
  }
  return "Capa de información cartográfica de Mapa Vivo.";
}
