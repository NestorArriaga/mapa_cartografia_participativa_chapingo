import { Feature } from 'geojson';

const SENSITIVE_TERMS = [
  'zona peligrosa', 'riesgo absoluto', 'foco rojo', 'mapa de delitos',
  'lugar inseguro', 'denuncia comprobada', 'victima', 'violador',
  'violación', 'acoso exacto', 'sangre', 'muerte', 'asesinato',
  'internado', 'residencias', 'baño', 'cuarto', 'casa'
];

/**
 * Normaliza y limpia una cadena para comparación.
 */
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Detecta si un texto contiene algún término sensible.
 */
function containsSensitiveTerm(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  return SENSITIVE_TERMS.some(term => normalized.includes(normalizeText(term)));
}

/**
 * Clasifica la visibilidad de un feature desde una perspectiva ética.
 */
export function getEthicalVisibility(feature: Feature): "public" | "review" | "blocked" {
  const p = feature.properties || {};
  const nivelUso = String(p.nivel_uso || '').toLowerCase();
  const categoria = String(p.categoria || '').toLowerCase();

  // 1. HARD BLOCKED: Uso explícitamente prohibido o categorías vulnerables
  if (nivelUso.includes('no_publicar') || nivelUso.includes('sensible')) {
    return "blocked";
  }
  if (categoria === 'sensible' || categoria === 'apoyo_informal') {
    return "blocked";
  }

  // 2. TEXT ANALYSIS: Check text fields for sensitive content
  const textFields = ['resumen', 'popup', 'nota', 'nombre', 'etica'];
  for (const field of textFields) {
    if (p[field] && containsSensitiveTerm(String(p[field]))) {
      // Coordenada exacta con texto sensible -> Review
      // If it's a Point feature, it needs review
      if (feature.geometry?.type === 'Point') {
        return "review";
      }
      return "review";
    }
  }

  // 3. REVISION REQUIRED explicitly
  if (nivelUso.includes('revision') || p.estado === 'under_review') {
    return "review";
  }

  // 4. Default to public if it passed filters
  return "public";
}

/**
 * Limpia propiedades de un feature si tienen textos prohibidos y son publicables.
 * No cambia el estado de visibilidad, sólo sanitiza el payload antes de mandar a UI.
 */
export function sanitizeFeatureProperties(properties: Record<string, unknown>): Record<string, unknown> {
  const clean = { ...properties };
  const textFields = ['resumen', 'popup', 'nota', 'nombre', 'etica'];
  
  for (const field of textFields) {
    if (clean[field] && typeof clean[field] === 'string') {
      let text = clean[field] as string;
      // Reemplazo básico destructivo para demo (en backend real sería más sofisticado)
      SENSITIVE_TERMS.forEach(term => {
        const regex = new RegExp(term, 'gi');
        if (regex.test(text)) {
          text = text.replace(regex, '[CONTENIDO PROTEGIDO]');
        }
      });
      clean[field] = text;
    }
  }

  return clean;
}

/**
 * Retorna true si es completamente seguro para uso público.
 */
export function isFeaturePublicSafe(feature: Feature): boolean {
  return getEthicalVisibility(feature) === "public";
}

/**
 * Lanza una excepción si la colección tiene features que no son seguros.
 */
export function assertPublicLayerSafety(features: Feature[], layerId: string): void {
  const unsafeCount = features.filter(f => !isFeaturePublicSafe(f)).length;
  if (unsafeCount > 0) {
    throw new Error(`[Ethical Gate] Layer ${layerId} contains ${unsafeCount} unsafe features that violate public deployment policies.`);
  }
}
