 
import { MAPVIVO, getNodeCategoryColor, getPriorityColor } from "../lib/colorScales";

export interface EncodedProperties {
  visualColor: string;
  visualRadius: number;
  visualOpacity: number;
  visualHaloWidth: number;
  visualSortKey: number;
  visualLabel: string;
  visualClass: string;
  visualCleanDescription: string;
  visualPriorityLabel?: string;
  isSensitive: boolean;
  [key: string]: any;
}

/**
 * Checks if a string or property set contains sensitive information
 */
export function isSensitiveFeature(properties: any): boolean {
  if (!properties) return false;

  const sensitiveKeywords = [
    "baño", "sanitario", "toilet", "residencia", "dormitorio", "habitación", 
    "habitacion", "casa", "apoyo informal", "informal support", "testimonio",
    "baños", "sanitarios", "residencias", "dormitorios", "cuarto"
  ];

  const searchFields = [
    properties.name,
    properties.displayName,
    properties.category,
    properties.categoria,
    properties.tipo,
    properties.descripcion,
    properties.description,
    properties.notes,
    properties.notas,
    properties.testimonio,
    properties.testimony
  ];

  for (const field of searchFields) {
    if (typeof field === "string") {
      const lower = field.toLowerCase();
      if (sensitiveKeywords.some(keyword => lower.includes(keyword))) {
        return true;
      }
    }
  }

  // Check specific categories/types
  const typeField = (properties.tipo || properties.category || properties.categoria || "").toLowerCase();
  if (
    typeField.includes("sensible") || 
    typeField.includes("delicado") || 
    typeField.includes("apoyo_informal") ||
    typeField.includes("sanitario") ||
    typeField.includes("residencia")
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitizes a description for public safety (hiding sensitive contents/testimonies)
 */
export function sanitizeDescription(properties: any, isPublic: boolean): string {
  if (!properties) return "Sin descripción";

  const rawDesc = properties.descripcion || properties.description || properties.notes || properties.notas || "";
  
  if (isPublic) {
    // If it's sensitive or contains testimony, replace it with a generalized academic summary
    if (isSensitiveFeature(properties) || properties.testimonio || properties.testimony) {
      return "Registro territorial de percepción y uso del espacio (sanitizado para resguardo de privacidad).";
    }
    // Remove exact room numbers or names
    return rawDesc.replace(/\b(room|cuarto|habitación|habitacion|dormitorio|casa)\s+\d+\b/gi, "Área Residencial");
  }

  return rawDesc || "Sin descripción disponible";
}

/**
 * Cleans technical names to present friendly UI labels
 */
export function cleanLabel(properties: any): string {
  if (!properties) return "Elemento";

  const rawName = properties.displayName || properties.name || properties.label || properties.tipo || properties.category || properties.id || "Elemento";
  
  // Exclude technical uppercase layer names
  if (typeof rawName === "string") {
    const clean = rawName
      .replace(/DOCUMENTARYNODES/gi, "Nodos Documentales")
      .replace(/nodos_orientacion_base/gi, "Puntos de Orientación")
      .replace(/vias_contexto_movilidad/gi, "Vías de Movilidad")
      .replace(/conectores_visualizacion/gi, "Conectores Territoriales")
      .replace(/_/g, " ");

    // Capitalize first letter of each word
    return clean.replace(/\b\w/g, c => c.toUpperCase());
  }

  return String(rawName);
}

/**
 * Precomputes visual encoding variables directly onto the GeoJSON features.
 * In public mode, filters out exact sensitive points and sanitizes descriptions.
 */
export function encodeMapVivoFeatures(
  geojson: GeoJSON.FeatureCollection,
  layerId: string,
  mode: "public_safe" | "academic_internal"
): GeoJSON.FeatureCollection {
  if (!geojson || !geojson.features) {
    return { type: "FeatureCollection", features: [] };
  }

  const isPublic = mode === "public_safe";

  const encodedFeatures = geojson.features
    .map(feature => {
      const props = { ...feature.properties };
      const isSensitive = isSensitiveFeature(props);

      // 1. Determine Class and Category
      let visualClass = "General";
      let categoryColor = MAPVIVO.chapingoGold;
      let radius = 6;
      let haloWidth = 2;
      let sortKey = 1;

      // Clean label
      const visualLabel = cleanLabel(props);
      const visualCleanDescription = sanitizeDescription(props, isPublic);

      // Handle specific layer types
      if (layerId.includes("node") || layerId.includes("nodo") || props.tipo_nodo || props.nodo_id) {
        // It's a node
        const cat = props.categoria || props.category || props.tipo || "orientacion";
        visualClass = cleanLabel({ displayName: cat });
        categoryColor = getNodeCategoryColor(cat);

        // Visual rules for nodes
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes("documental")) {
          radius = 8;
          haloWidth = 4;
          sortKey = 10;
        } else if (lowerCat.includes("memoria")) {
          radius = 8;
          haloWidth = 4;
          sortKey = 9;
        } else if (lowerCat.includes("recurso") || lowerCat.includes("apoyo")) {
          radius = 7;
          haloWidth = 3;
          sortKey = 8;
        } else if (lowerCat.includes("orientacion") || lowerCat.includes("orientación")) {
          radius = 5;
          haloWidth = 2;
          sortKey = 2;
        } else {
          radius = 6;
          haloWidth = 2;
          sortKey = 5;
        }
      } else if (layerId.includes("route") || layerId.includes("via") || layerId.includes("connector") || props.ruta_id) {
        // It's a route/line
        const type = (props.tipo || props.category || "").toLowerCase();
        visualClass = type.includes("corredor") ? "Corredor Regional" : "Ruta Peatonal";
        
        // DICIFO-Boyeros special case
        const name = (props.name || props.displayName || props.nombre || "").toLowerCase();
        if (name.includes("boyeros") || name.includes("dicifo")) {
          categoryColor = MAPVIVO.coralAlert; // Special V3 highlighting
          radius = 6; // line width
          sortKey = 15;
          visualClass = "Corredor Prioritario DICIFO-Boyeros";
        } else if (type.includes("regional")) {
          categoryColor = MAPVIVO.orangeRoute;
          radius = 5;
          sortKey = 8;
        } else {
          categoryColor = MAPVIVO.chapingoGold;
          radius = 3.5;
          sortKey = 4;
        }
      } else if (layerId.includes("zone") || layerId.includes("zona") || props.zona || props.prioridad) {
        // It's a zone/polygon
        const zoneName = (props.displayName || props.zona || props.name || "").toLowerCase();
        let prio = props.prioridad || "media";

        // Boyeros special validation: must not be classified as "sin datos"
        if (zoneName.includes("boyeros")) {
          prio = "muy_alta";
          visualClass = "Zona Boyeros (Atención Especial)";
        } else {
          visualClass = `Prioridad ${prio.replace("_", " ").toUpperCase()}`;
        }

        categoryColor = getPriorityColor(prio);
        radius = 2; // border line width
        sortKey = 1;
      }

      const encodedProps: EncodedProperties = {
        ...props,
        visualColor: categoryColor,
        visualRadius: radius,
        visualOpacity: layerId.includes("zone") ? 0.22 : 0.85,
        visualHaloWidth: haloWidth,
        visualSortKey: sortKey,
        visualLabel,
        visualClass,
        visualCleanDescription,
        isSensitive
      };

      return {
        ...feature,
        properties: encodedProps
      };
    })
    // 2. Public Safe Filter: If in public mode, completely omit exact sensitive features from the features array
    .filter(feature => {
      if (isPublic && feature.properties.isSensitive) {
        // Do not render sensitive exact point locations (nodes) or lines
        if (feature.geometry.type === "Point" || feature.geometry.type === "LineString") {
          return false;
        }
      }
      return true;
    });

  return {
    type: "FeatureCollection",
    features: encodedFeatures
  };
}

/**
 * Encodes all layers in the application dataset
 */
export function encodeDatasetLayers(
  layers: any[],
  mode: "public_safe" | "academic_internal"
): any[] {
  return layers.map(layer => {
    return {
      ...layer,
      data: encodeMapVivoFeatures(layer.data, layer.id, mode)
    };
  });
}
