// No need for WebLayerRegistryItem import

export type AppBootResult = {
  ok: boolean;
  basemapReady: boolean;
  registryReady: boolean;
  publicLayersFound: number;
  publicLayersLoaded: number;
  errors: string[];
};

// Validates a layer URL to prevent leaking sensitive data or loading heavy files
export function isSafeToLoad(url: string, layerId: string): boolean {
  if (!url) return false;
  if (url.includes('05_no_publicar_sensible')) return false;
  if (url.includes('04_revision_controlada')) return false;
  if (url.endsWith('.gpkg')) return false;
  if (url.includes('chapingo_web_v06_final_nodos_integrados.gpkg')) return false;
  
  // Bloqueo explícito de la capa vial pesada original (4.3GB o cruda)
  if (layerId === 'vias_contexto_movilidad' && !url.includes('.light')) return false;

  return true;
}

export async function bootMapVivoApp(registry: any[]): Promise<AppBootResult> {
  const result: AppBootResult = {
    ok: true,
    basemapReady: true,
    registryReady: false,
    publicLayersFound: 0,
    publicLayersLoaded: 0,
    errors: []
  };

  try {
    if (!registry || !Array.isArray(registry)) {
      throw new Error("El registry de capas es inválido o no existe.");
    }
    result.registryReady = true;

    // Filter public sanitized layers
    const publicLayers = registry.filter(layer => 
      layer.ethicalVisibility === 'public' || layer.ethicalVisibility === 'public_aggregated'
    );

    result.publicLayersFound = publicLayers.length;

    if (publicLayers.length === 0) {
      throw new Error("No se encontraron capas públicas sanitizadas en el registry.");
    }

    // Check paths for safety
    publicLayers.forEach(layer => {
      if (!isSafeToLoad(layer.publicPath, layer.id)) {
        console.warn(`[Boot] Capa bloqueada por seguridad/peso: ${layer.id}`);
        // We do not throw, we just won't load it later, or we could mark the registry as tampered
      }
    });

  } catch (err: any) {
    result.ok = false;
    result.errors.push(err.message);
  }

  return result;
}
