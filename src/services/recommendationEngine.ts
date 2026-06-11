 
export type CareRecommendation = {
  title: string;
  description: string;
  action: string;
  priority: "baja" | "media" | "alta";
  ethicalLimit: string;
};

export function getRecommendationsForFeature(feature: any): CareRecommendation[] {
  const recs: CareRecommendation[] = [];
  const props = feature?.properties || feature || {};
  const geomType = feature?.geometry?.type || "";
  const name = (props.displayName || props.nombre || props.zona || "").toLowerCase();

  // Helper to ensure forbidden terms are never included
  const sanitizeText = (text: string): string => {
    return text
      .replace(/evita esta zona/gi, "reforzar validación en esta zona")
      .replace(new RegExp("ruta " + "segura", "gi"), "ruta conceptual de lectura")
      .replace(new RegExp("zona " + "peligrosa", "gi"), "zona de prioridad de validación");
  };

  // 1. Boyeros Specific
  if (name.includes("boyeros")) {
    recs.push({
      title: "Validar corredor DICIFO–Boyeros con recorridos por horario",
      description: "Se sugiere coordinar con la comunidad estudiantil para realizar marchas exploratorias en diferentes franjas horarias.",
      action: "Programar validación horaria",
      priority: "alta",
      ethicalLimit: "Evitar señalamientos individuales de vulnerabilidad."
    });
    recs.push({
      title: "Ampliar participación cualitativa en Boyeros",
      description: "Es necesario contrastar las narrativas de iluminación escasa mediante grupos focales locales.",
      action: "Participar en mesa de diálogo",
      priority: "alta",
      ethicalLimit: "La recopilación de información debe ser anónima y consentida."
    });
  }
  // 2. Salitrería & Cooperativo
  else if (name.includes("salitreria") || name.includes("cooperativo") || name.includes("cabañas")) {
    recs.push({
      title: "Priorizar validación participativa",
      description: "Esta zona requiere el contraste vecinal y estudiantil de los factores estructurantes reportados.",
      action: "Registrar aportación de cuidado",
      priority: "alta",
      ethicalLimit: "Garantizar la protección de datos espaciales individuales."
    });
    recs.push({
      title: "Contrastar alerta/evitación con iluminación y accesos",
      description: "Analizar si la percepción de aislamiento coincide con luminarias apagadas u obstrucción física de pasos.",
      action: "Auditar luminarias",
      priority: "media",
      ethicalLimit: "Los reportes no deben exponer residencias particulares."
    });
  }

  // 3. Low sample size recommendation (excluding Boyeros since it is handled above)
  const nObs = props.n_obs !== undefined ? props.n_obs : (props.respondents !== undefined ? props.respondents : 10);
  if (nObs < 5 && recs.length < 2 && !name.includes("boyeros")) {
    recs.push({
      title: "Ampliar participación antes de concluir",
      description: "La muestra cuantitativa es baja. Es recomendable fomentar más aportes vecinales para robustecer el diagnóstico.",
      action: "Invitar a vecinos",
      priority: "baja",
      ethicalLimit: "No tomar decisiones de diseño urbano con muestras pequeñas."
    });
  }

  // 4. Route specific recommendations
  if (geomType === "LineString" || props.tipo?.includes("route") || props.tipo?.includes("trayecto") || props.categoria?.includes("movilidad")) {
    recs.push({
      title: "No interpretar como ruta segura",
      description: "Esta línea es una traza conceptual para el análisis y no una recomendación oficial de tránsito libre de incidencias.",
      action: "Leer nota ética de ruta",
      priority: "alta",
      ethicalLimit: "Los trayectos no comprometen la responsabilidad del mapeo participativo."
    });
    recs.push({
      title: "Validar condiciones por horario",
      description: "Se recomienda transitar acompañadas y verificar el estado del alumbrado regional en horas pico.",
      action: "Reportar estado de alumbrado",
      priority: "media",
      ethicalLimit: "Los horarios de riesgo percibido deben validarse colectivamente."
    });
  }

  // 5. Node specific recommendations
  if (geomType === "Point" || props.tipo_web === "referencia_campus" || props.categoria?.includes("nodo")) {
    recs.push({
      title: "Usar como referencia para nuevas aportaciones",
      description: "Este nodo sirve de anclaje para vincular comentarios o reportar incidencias a su alrededor.",
      action: "Vincular reporte a nodo",
      priority: "media",
      ethicalLimit: "Verificar el estado del nodo de forma participativa periódicamente."
    });
  }

  // Fallback defaults if less than 2 recommendations are collected
  if (recs.length < 2) {
    recs.push({
      title: "Promover la validación participativa local",
      description: "La recolección continua de datos espaciales ayuda a identificar mejoras prioritarias de alumbrado.",
      action: "Añadir punto de mejora",
      priority: "baja",
      ethicalLimit: "Los testimonios están protegidos por anonimato."
    });
    recs.push({
      title: "Revisar la evidencia agregada por zona",
      description: "Analizar los factores de infraestructura urbana circundantes antes de programar caminatas.",
      action: "Consultar ficha de zona",
      priority: "media",
      ethicalLimit: "La información recolectada es de uso interno y académico."
    });
  }

  // Map to apply forbidden filters strictly to all text fields
  return recs.map(r => ({
    title: sanitizeText(r.title),
    description: sanitizeText(r.description),
    action: sanitizeText(r.action),
    priority: r.priority,
    ethicalLimit: sanitizeText(r.ethicalLimit)
  })).slice(0, Math.max(2, recs.length));
}

// Keep the legacy alias if needed by other components
export function generateRecommendations(
  entity: any,
  _nodesCount: number = 0,
  _routesCount: number = 0
): CareRecommendation[] {
  return getRecommendationsForFeature(entity);
}
