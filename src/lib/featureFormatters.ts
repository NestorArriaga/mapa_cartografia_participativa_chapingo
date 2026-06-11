/**
 * Mapa Vivo UACh-Texcoco
 * Feature Formatters
 *
 * Convierte las propiedades crudas del GeoJSON a textos legibles y elegantes para la UI.
 */

export function formatPriority(priority: string | undefined | null): string {
  if (!priority) return 'Sin Datos';
  switch (priority.toLowerCase().trim()) {
    case 'muy_alta': return 'Muy Alta';
    case 'alta': return 'Alta';
    case 'media': return 'Media';
    case 'media_alta': return 'Media-Alta';
    case 'baja': return 'Baja';
    case 'sin_datos': return 'Sin Datos';
    case 'recurso_apoyo': return 'Recurso de Apoyo';
    case 'recurso': return 'Recurso';
    case 'revision': return 'En Revisión';
    case 'memoria': return 'Memoria Histórica';
    case 'critica': return 'Crítica';
    default: return priority;
  }
}

export function formatPercentage(value: number | string | undefined | null): string {
  if (value == null) return '0%';
  const num = Number(value);
  if (isNaN(num)) return '0%';
  return `${num.toFixed(1)}%`;
}

export function formatScore(value: number | string | undefined | null): string {
  if (value == null) return '0.0';
  const num = Number(value);
  if (isNaN(num)) return '0.0';
  return num.toFixed(1);
}

export function formatEthicalStatus(etica: string | undefined | null): string {
  if (!etica) return 'Datos agregados protegidos bajo protocolo ético.';
  return etica;
}

export function formatNivelUso(nivel: string | undefined | null): string {
  if (!nivel) return 'Público agregado';
  if (nivel.includes('01_web_publico')) return 'Público agregado';
  if (nivel.includes('03_revision_controlada')) return 'Revisión controlada (oculto)';
  if (nivel.includes('04_no_publicar')) return 'No publicable (sensible)';
  return 'Público agregado';
}

export function formatCategory(cat: string | undefined | null): string {
  if (!cat) return 'No especificado';
  const clean = cat.toLowerCase().trim();
  switch (clean) {
    case 'percepcion_espacio': return 'Percepción del espacio';
    case 'trayecto_perimetral': return 'Trayecto perimetral';
    case 'factor_estructural': return 'Factor estructural';
    case 'recurso_apoyo': return 'Recurso de apoyo';
    case 'caso_documentado': return 'Caso documentado';
    case 'acceso_movilidad': return 'Acceso / movilidad';
    case 'establecimiento_nocturno': return 'Establecimiento nocturno';
    case 'apoyo_informal': return 'Apoyo informal';
    default: 
      return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export function formatEvidenceSummary(resumen: string | undefined | null, popup: string | undefined | null): string {
  if (popup && popup.trim()) return popup;
  if (resumen && resumen.trim()) return resumen;
  return 'No hay descripción disponible para esta ubicación.';
}

export function formatLayerName(raw: string): string {
  if (!raw) return '';
  const r = raw.toLowerCase();
  if (r.includes('evidencia documental agregada por zona')) return 'Evidencia agregada';
  if (r.includes('zonas prioridad integrada o indicadores')) return 'Zonas de prioridad';
  if (r.includes('nodos documentales publicos agregados')) return 'Nodos documentales';
  if (r.includes('nodos orientacion base')) return 'Nodos de orientación';
  if (r.includes('conectores visualizacion')) return 'Conectores visuales';
  if (r.includes('vías de contexto movilidad') || r.includes('vias_contexto')) return 'Movilidad ligera';
  if (r.includes('trayectos de lectura') || r.includes('trayectos_lectura')) return 'Trayectos de lectura';
  
  const clean = raw.replace(/_v\d+$/, '').replace(/_/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
