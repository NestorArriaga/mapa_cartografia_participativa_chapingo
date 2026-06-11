/**
 * copyGuard.ts — Guardia terminológica para el Mapa Vivo UACh-Texcoco.
 *
 * Este módulo protege el lenguaje del proyecto. Reemplaza términos que
 * reproducen marcos punitivos o estigmatizantes con alternativas que
 * respetan la cartografía de cuidado ecofeminista.
 */

/** Términos aprobados para uso público en la interfaz. */
export const ALLOWED_TERMS: string[] = [
  'prioridad de validación',
  'movilidad vivida',
  'alerta/evitación reportada',
  'percepción agregada',
  'evidencia contextual',
  'recurso por validar',
  'nodo aproximado',
  'condición estructural',
  'cartografía de cuidado',
];

/** Términos prohibidos: reproducen marcos punitivos o estigmatizantes. */
export const PROHIBITED_TERMS: string[] = [
  'zona peligrosa',
  'punto seguro',
  'riesgo absoluto',
  'mapa de delitos',
  'denuncia comprobada',
  'lugar inseguro',
  'foco rojo',
];

/**
 * Mapa de reemplazo: cada término prohibido se asocia con su equivalente permitido.
 */
const REPLACEMENT_MAP: Record<string, string> = {
  'zona peligrosa': 'prioridad de validación',
  'punto seguro': 'recurso por validar',
  'riesgo absoluto': 'percepción agregada',
  'mapa de delitos': 'cartografía de cuidado',
  'denuncia comprobada': 'evidencia contextual',
  'lugar inseguro': 'condición estructural',
  'foco rojo': 'alerta/evitación reportada',
};

/**
 * Reemplaza términos prohibidos en un texto con sus equivalentes permitidos.
 * La detección es case-insensitive.
 *
 * @param text - Texto a procesar
 * @returns Texto con términos reemplazados
 */
export function guardTerm(text: string): string {
  let result = text;
  for (const [prohibited, allowed] of Object.entries(REPLACEMENT_MAP)) {
    const regex = new RegExp(prohibited, 'gi');
    result = result.replace(regex, allowed);
  }
  return result;
}

/**
 * Verifica si un término es permitido (no está en la lista de prohibidos).
 * La detección es case-insensitive.
 *
 * @param term - Término a verificar
 * @returns true si el término es seguro de usar
 */
export function isTermAllowed(term: string): boolean {
  const lowerTerm = term.toLowerCase();
  return !PROHIBITED_TERMS.some(
    prohibited => lowerTerm.includes(prohibited.toLowerCase())
  );
}
