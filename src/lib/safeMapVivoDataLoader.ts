/**
 * Safe data loader with per-file try/catch, size limits, and no-throw guarantee.
 */
import { normalizeNodesGeoJSON } from "./normalizeNodesGeoJSON";

export type SafeLoadLayerResult = {
  id: string;
  name: string;
  geometryType: string;
  featureCount: number;
  data: GeoJSON.FeatureCollection;
  errors: string[];
};

export type SafeLoadResult = {
  ok: boolean;
  layers: SafeLoadLayerResult[];
  errors: string[];
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function validateGeoJSON(data: any): GeoJSON.FeatureCollection {
  if (!data || typeof data !== "object") {
    return { type: "FeatureCollection", features: [] };
  }
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return {
      type: "FeatureCollection",
      features: data.features.filter(
        (f: any) => f && typeof f === "object" && f.geometry
      ),
    };
  }
  if (data.geometry) {
    return { type: "FeatureCollection", features: [data] };
  }
  return { type: "FeatureCollection", features: [] };
}

function detectGeometryType(features: any[]): string {
  if (!features || features.length === 0) return "Unknown";
  return features[0]?.geometry?.type || "Unknown";
}

export async function loadSafeMapVivoData(): Promise<SafeLoadResult> {
  const result: SafeLoadResult = {
    ok: false,
    layers: [],
    errors: [],
  };

  // Try aggregated dataset first
  const datasetPaths = [
    "/data/mapvivo.academic.dataset.json",
    "/data/mapvivo.dataset.json",
  ];

  for (const path of datasetPaths) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;

      // Check content-length
      const cl = response.headers.get("content-length");
      if (cl && parseInt(cl) > MAX_FILE_SIZE) {
        result.errors.push(`Skipped ${path}: exceeds 25MB limit`);
        continue;
      }

      const text = await response.text();
      if (text.length > MAX_FILE_SIZE) {
        result.errors.push(`Skipped ${path}: exceeds 25MB limit`);
        continue;
      }

      const data = JSON.parse(text);
      if (data && typeof data === "object") {
        const layersObj = data.publicLayers || data.layers || data;
        const keys = Object.keys(layersObj).filter(
          (k) => k !== "generatedAt" && k !== "bbox" && k !== "center"
        );

        for (const key of keys) {
          try {
            let geojson = validateGeoJSON(layersObj[key]);
            if (key.toLowerCase().includes("node") || key === "nodos") {
              geojson = normalizeNodesGeoJSON(geojson);
            }
            result.layers.push({
              id: key,
              name: key.toUpperCase(),
              geometryType: detectGeometryType(geojson.features),
              featureCount: geojson.features.length,
              data: geojson,
              errors: [],
            });
          } catch (layerErr: any) {
            result.errors.push(
              `Error parsing layer "${key}": ${layerErr.message}`
            );
          }
        }

        if (result.layers.length > 0) {
          result.ok = true;
          return result;
        }
      }
    } catch (err: any) {
      result.errors.push(`Failed loading ${path}: ${err.message}`);
    }
  }

  // Fallback: load individual files
  const fallbackLayers = [
    { id: "zones", name: "ZONAS", file: "zonas_prioridad_integrada_o_indicadores.public.geojson" },
    { id: "routes", name: "RUTAS", file: "vias_contexto_movilidad.light.geojson" },
    { id: "connectors", name: "CONECTORES", file: "conectores_visualizacion.public.geojson" },
    { id: "nodes", name: "NODOS", file: "nodos_orientacion_base.public.geojson" },
    { id: "evidence", name: "EVIDENCIA", file: "evidencia_documental_agregada_por_zona.public.geojson" },
  ];

  for (const layer of fallbackLayers) {
    const fullPath = `/data/sanitized/${layer.file}`;
    try {
      const response = await fetch(fullPath);
      if (!response.ok) {
        result.errors.push(`Skipped ${layer.id}: HTTP ${response.status}`);
        continue;
      }

      const text = await response.text();
      if (text.length > MAX_FILE_SIZE) {
        result.errors.push(`Skipped ${layer.id}: exceeds 25MB limit`);
        continue;
      }

      const data = JSON.parse(text);
      let geojson = validateGeoJSON(data);

      if (layer.id === "nodes") {
        geojson = normalizeNodesGeoJSON(geojson);
      }

      result.layers.push({
        id: layer.id,
        name: layer.name,
        geometryType: detectGeometryType(geojson.features),
        featureCount: geojson.features.length,
        data: geojson,
        errors: [],
      });
    } catch (err: any) {
      result.errors.push(`Failed ${layer.id}: ${err.message}`);
    }
  }

  result.ok = result.layers.length > 0;
  return result;
}
