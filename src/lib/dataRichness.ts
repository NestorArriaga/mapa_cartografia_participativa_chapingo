/**
 * dataRichness.ts
 * 
 * Unified interface to extract safe and rich metadata from geojson properties.
 * Provides fallback values if data is missing.
 */

export interface RichFeatureData {
  id: string;
  nombre: string;
  tipo: string;
  categoria: string;
  prioridad: string;
  pct_alerta: number;
  score_integrado: number;
  resumen: string;
  popup: string;
  etica: string;
  precision: string;
  zona: string;
  recomendaciones: string;
  evidencias: number;
  recursos: string;
  pendientes: string;
}

export function extractRichData(properties: any, fallbackType: string = 'node'): RichFeatureData {
  if (!properties) {
    return createEmptyData(fallbackType);
  }

  const p = properties;

  return {
    id: p.ID || p.id || 'sin-id',
    nombre: p.nombre || p.Name || 'Sin título',
    tipo: p.tipo || p.Layer || fallbackType,
    categoria: p.categoria || p.tipo || 'Sin categoría',
    prioridad: p.prioridad_v05 || p.prioridad || p.nivel_prioridad || 'sin_datos',
    pct_alerta: p.pct_alerta ? Number(p.pct_alerta) : 0,
    score_integrado: p.score_integrado_alerta_cuantitativa_v06 ? Number(p.score_integrado_alerta_cuantitativa_v06) : 0,
    resumen: p.descripcion || p.Description || '',
    popup: p.popup || '',
    etica: p.etica || p.nota_etica || '',
    precision: p.precision || 'aproximada',
    zona: p.zona || p.Area || 'Desconocida',
    recomendaciones: p.recomendacion || '',
    evidencias: p.n_evidencias || p.evidencias || 0,
    recursos: p.recursos || '',
    pendientes: p.pendientes || ''
  };
}

function createEmptyData(tipo: string): RichFeatureData {
  return {
    id: 'unknown',
    nombre: 'Elemento desconocido',
    tipo,
    categoria: 'Sin categoría',
    prioridad: 'sin_datos',
    pct_alerta: 0,
    score_integrado: 0,
    resumen: '',
    popup: '',
    etica: '',
    precision: 'aproximada',
    zona: 'Desconocida',
    recomendaciones: '',
    evidencias: 0,
    recursos: '',
    pendientes: ''
  };
}
