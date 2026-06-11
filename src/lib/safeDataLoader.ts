/**
 * Fallback loader for local GeoJSON files when backend/database is unavailable.
 * Implements strict size limits and data validation to prevent UI freezing.
 */
import { normalizeNodesGeoJSON } from "./normalizeNodesGeoJSON";

export type SafeLayer = {
  id: string;
  name: string;
  path: string;
  geometryType: string;
  featureCount: number;
  data: GeoJSON.FeatureCollection;
};

export type SafeDataLoadResult = {
  ok: boolean;
  layers: SafeLayer[];
  errors: string[];
  bbox: [number, number, number, number] | null;
};

// Helper to determine geometry type
function getGeometryType(features: any[]): string {
  if (!features || !Array.isArray(features) || features.length === 0) return "Unknown";
  const first = features[0];
  return first?.geometry?.type || "Unknown";
}

// Resilient GeoJSON validator
function validateGeoJSON(data: any): GeoJSON.FeatureCollection {
  if (!data || typeof data !== "object") {
    return { type: "FeatureCollection", features: [] };
  }
  const collection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: []
  };
  if (data.type === "FeatureCollection") {
    if (Array.isArray(data.features)) {
      collection.features = data.features.filter((f: any) => f && typeof f === "object");
    }
  } else if (Array.isArray(data.features)) {
    collection.features = data.features.filter((f: any) => f && typeof f === "object");
  } else if (data.geometry || data.properties) {
    // Single feature, wrap it
    collection.features = [data];
  }
  return collection;
}

export async function loadSafeMapVivoLayers(): Promise<SafeDataLoadResult> {
  const result: SafeDataLoadResult = {
    ok: false,
    layers: [],
    errors: [],
    bbox: null
  };

  // List of potential aggregated dataset paths
  const datasetPaths = [
    "/data/mapvivo.academic.dataset.json",
    "/data/mapvivo.dataset.json"
  ];

  for (const path of datasetPaths) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching ${path}`);
      }
      const rawText = await response.text();
      const data = JSON.parse(rawText);

      if (data && typeof data === "object") {
        const layersObj = data.publicLayers || data.layers || data;
        const keys = Object.keys(layersObj).filter(k => k !== "generatedAt" && k !== "bbox" && k !== "center");
        
        const layers: SafeLayer[] = [];
        for (const key of keys) {
          try {
            let geojson = validateGeoJSON(layersObj[key]);
            
            if (key.toLowerCase().includes("node") || key === "nodos") {
              geojson = normalizeNodesGeoJSON(geojson);
            }

            layers.push({
              id: key,
              name: key.toUpperCase(),
              path: path,
              geometryType: getGeometryType(geojson.features),
              featureCount: geojson.features.length,
              data: geojson
            });
          } catch (layerErr: any) {
            result.errors.push(`Error parsing layer "${key}" in ${path}: ${layerErr.message}`);
          }
        }

        if (layers.length > 0) {
          result.ok = true;
          result.layers = layers;
          if (Array.isArray(data.bbox) && data.bbox.length === 4) {
            result.bbox = data.bbox as [number, number, number, number];
          }
          return result;
        }
      }
    } catch (err: any) {
      result.errors.push(`Failed loading ${path}: ${err.message}`);
    }
  }

  // Fallback: load individual sanitized geojson files
  const fallbackLayers = [
    { id: "zones", name: "ZONAS", file: "zonas_prioridad_integrada_o_indicadores.public.geojson" },
    { id: "routes", name: "RUTAS", file: "vias_contexto_movilidad.light.geojson" },
    { id: "connectors", name: "CONECTORES", file: "conectores_visualizacion.public.geojson" },
    { id: "nodes", name: "NODOS", file: "nodos_orientacion_base.public.geojson" },
    { id: "evidence", name: "EVIDENCIA", file: "evidencia_documental_agregada_por_zona.public.geojson" }
  ];

  const loadedFallbackLayers: SafeLayer[] = [];
  for (const layer of fallbackLayers) {
    const fullPath = `/data/sanitized/${layer.file}`;
    try {
      const response = await fetch(fullPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const rawText = await response.text();
      const data = JSON.parse(rawText);
      let geojson = validateGeoJSON(data);

      if (layer.id === "nodes") {
        geojson = normalizeNodesGeoJSON(geojson);
      }

      loadedFallbackLayers.push({
        id: layer.id,
        name: layer.name,
        path: fullPath,
        geometryType: getGeometryType(geojson.features),
        featureCount: geojson.features.length,
        data: geojson
      });
    } catch (err: any) {
      result.errors.push(`Failed fallback load for ${layer.id} (${fullPath}): ${err.message}`);
    }
  }

  if (loadedFallbackLayers.length > 0) {
    result.ok = true;
    result.layers = loadedFallbackLayers;
    // Default bbox for Chapingo/Texcoco area
    result.bbox = [-98.92, 19.46, -98.84, 19.52];
  } else {
    result.ok = false;
    result.errors.push("All aggregated datasets and fallback files failed to load.");
  }

  return result;
}
