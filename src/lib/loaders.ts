import { WebLayerRegistryItem } from '../types/layers';
import { layerRegistry } from '../data/layerRegistry.sanitized.generated';
import { sanitizedLayerStats } from '../data/sanitizedLayerStats.generated';

// ---------------------------------------------------------------------------
// Layer Interfaces
// ---------------------------------------------------------------------------

export type LoadedLayer = {
  id: string;
  name: string;
  path: string;
  status: "loaded" | "empty" | "error" | "blocked";
  featureCount: number;
  geometryTypes: string[];
  bbox?: [number, number, number, number];
  data?: GeoJSON.FeatureCollection;
  error?: string;
};

// ---------------------------------------------------------------------------
// Privacy / Ethical Filters
// ---------------------------------------------------------------------------

/** IDs of layers that must NEVER be loaded in the public client */
const BLOCKED_LAYER_IDS = new Set([
  'nodos_documentales_NO_PUBLICAR_v06',
  'nodos_revision_sensible_base_v06',
]);

export function filterPublicFeatures(
  geojson: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
  if (!geojson?.features) return geojson;

  let removedCount = 0;

  const filtered = geojson.features.filter((f) => {
    const p = f.properties ?? {};

    // nivel_uso check
    const nivelUso = String(p.nivel_uso ?? '').toLowerCase();
    if (nivelUso.includes('no_publicar') || nivelUso.includes('sensible')) {
      removedCount++;
      return false;
    }

    // categoria check
    const cat = String(p.categoria ?? '').toLowerCase();
    if (cat === 'sensible' || cat === 'apoyo_informal') {
      removedCount++;
      return false;
    }

    // regla_pub check
    const reglaPub = String(p.regla_pub ?? '').toUpperCase();
    if (reglaPub.includes('NO_PUBLICAR')) {
      removedCount++;
      return false;
    }

    // publicacion check
    const pub = String(p.publicacion ?? '').toUpperCase();
    if (pub === 'NO') {
      removedCount++;
      return false;
    }

    return true;
  });

  if (removedCount > 0) {
    console.info(
      `[loaders] filterPublicFeatures: removed ${removedCount} sensitive feature(s)`,
    );
  }

  _lastFilteredCount = removedCount;
  return { ...geojson, features: filtered };
}

let _lastFilteredCount = 0;
export function getLastFilteredCount(): number {
  return _lastFilteredCount;
}

// ---------------------------------------------------------------------------
// Data Cache & Loader
// ---------------------------------------------------------------------------

const layerCache: Record<string, LoadedLayer> = {};
const loadingPromises: Record<string, Promise<LoadedLayer>> = {};

export async function loadLayerData(layer: WebLayerRegistryItem): Promise<LoadedLayer> {
  const stat = sanitizedLayerStats.layers.find(s => s.id === layer.id.replace('_v06', ''));

  const resultFallback: LoadedLayer = {
    id: layer.id,
    name: layer.name,
    path: layer.publicPath || '',
    status: 'error',
    featureCount: 0,
    geometryTypes: []
  };

  if (!layer.publicPath) return { ...resultFallback, error: 'No public path' };

  if (BLOCKED_LAYER_IDS.has(layer.id) || layer.loadStrategy === 'disabled_too_large') {
    return { ...resultFallback, status: 'blocked', error: 'Blocked by size or ethics' };
  }

  if (stat && (!stat.renderable || stat.featureCount === 0)) {
    return { ...resultFallback, status: 'empty', error: 'Empty layer' };
  }

  if (layerCache[layer.id]) return layerCache[layer.id];
  if (layer.id in loadingPromises) return loadingPromises[layer.id];

  const promise = (async (): Promise<LoadedLayer> => {
    try {
      const response = await fetch(layer.publicPath!);
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${layer.publicPath}`);

      let data = await response.json();

      if (data?.type === 'FeatureCollection') {
        data = filterPublicFeatures(data);
        
        if (data.features.length === 0) {
          const res: LoadedLayer = { ...resultFallback, status: 'empty' };
          layerCache[layer.id] = res;
          return res;
        }

        const res: LoadedLayer = {
          id: layer.id,
          name: layer.name,
          path: layer.publicPath!,
          status: 'loaded',
          featureCount: data.features.length,
          geometryTypes: stat?.geometryTypes || [],
          bbox: stat?.bbox as any,
          data
        };
        layerCache[layer.id] = res;
        return res;
      }

      return { ...resultFallback, error: 'Not a FeatureCollection' };
    } catch (err: any) {
      console.error(`[loaders] Error loading layer "${layer.id}":`, err);
      return { ...resultFallback, error: err.message };
    } finally {
      delete loadingPromises[layer.id];
    }
  })();

  loadingPromises[layer.id] = promise;
  return promise;
}

// ---------------------------------------------------------------------------
// Registry Helpers
// ---------------------------------------------------------------------------

export function getPublicLayers(): WebLayerRegistryItem[] {
  return layerRegistry.filter(
    (l) => l.canShowOnPublicMap && !BLOCKED_LAYER_IDS.has(l.id) && l.loadStrategy !== 'disabled_too_large',
  );
}

export function getAllLayers(): WebLayerRegistryItem[] {
  return layerRegistry;
}

export function getLayerById(id: string): WebLayerRegistryItem | undefined {
  return layerRegistry.find((l) => l.id === id);
}

export function isLayerBlocked(id: string): boolean {
  return BLOCKED_LAYER_IDS.has(id);
}

export function getCachedLayerData(id: string): LoadedLayer | null {
  return layerCache[id] ?? null;
}
