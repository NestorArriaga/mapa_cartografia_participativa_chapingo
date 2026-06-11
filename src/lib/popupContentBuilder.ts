export interface PopupData {
  title: string;
  className: string;
  color: string;
  description: string;
  metrics?: { label: string; value: string }[];
  warning?: string;
  relevance?: string;
}

/**
 * Builds structured popup/tooltip content for a map feature
 */
export function buildPopupContent(properties: any, type: "node" | "route" | "zone"): PopupData {
  if (!properties) {
    return {
      title: "Elemento Territorial",
      className: "General",
      color: "#D6A83A",
      description: "Sin información disponible"
    };
  }

  const title = properties.visualLabel || properties.displayName || properties.name || "Elemento";
  const className = properties.visualClass || "General";
  const color = properties.visualColor || "#D6A83A";
  const description = properties.visualCleanDescription || properties.descripcion || properties.description || "";

  const data: PopupData = {
    title,
    className,
    color,
    description
  };

  // Node specific additions
  if (type === "node") {
    const metrics = [];
    if (properties.categoria || properties.category) {
      metrics.push({ label: "Categoría", value: String(properties.categoria || properties.category) });
    }
    if (properties.fuente || properties.source) {
      metrics.push({ label: "Origen", value: String(properties.fuente || properties.source) });
    }
    data.metrics = metrics;
  }

  // Route specific additions
  if (type === "route") {
    const metrics = [];
    const distanceMeters = properties.distancia_m || properties.distance || null;
    if (distanceMeters) {
      const dist = parseFloat(distanceMeters);
      const walkTimeMinutes = Math.round(dist / 80); // Average walking speed is ~80m/min (4.8 km/h)
      metrics.push({ label: "Distancia", value: `${dist.toFixed(0)} metros` });
      metrics.push({ label: "Caminata Est.", value: `${walkTimeMinutes} min` });
    }

    const nameLower = title.toLowerCase();
    if (nameLower.includes("boyeros") || nameLower.includes("dicifo")) {
      data.warning = "Advertencia de Tránsito: Corredor regional con alta afluencia y tramos de visibilidad reducida. Precaución peatonal sugerida.";
      data.relevance = "Corredor regional prioritario para la conectividad y movilidad intermunicipal.";
    }

    data.metrics = metrics;
  }

  // Zone specific additions
  if (type === "zone") {
    const metrics = [];
    const priority = properties.prioridad || "media";
    metrics.push({ label: "Prioridad", value: priority.replace("_", " ").toUpperCase() });

    const nameLower = title.toLowerCase();
    if (nameLower.includes("boyeros")) {
      data.warning = "Atención Preferente: Zona con alto índice de aportes cualitativos. Requiere intervención urbana ecológica.";
      data.relevance = "Región de validación social y diagnóstico ecofeminista activo.";
    } else {
      data.relevance = `Sector catalogado con prioridad de intervención: ${priority.toUpperCase()}`;
    }

    data.metrics = metrics;
  }

  return data;
}
