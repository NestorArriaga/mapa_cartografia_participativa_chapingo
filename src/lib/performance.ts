/**
 * performance.ts — Utilidades de rendimiento para el Mapa Vivo.
 *
 * Detecta capacidades del dispositivo y estima el peso de las capas
 * para adaptar la experiencia según los recursos disponibles.
 */

/**
 * Verifica si el usuario prefiere movimiento reducido.
 * Respeta la preferencia del sistema operativo.
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Detecta el modo de rendimiento según las capacidades del dispositivo.
 *
 * Criterios para modo reducido:
 * - Pocos núcleos lógicos (≤ 2)
 * - Poca memoria (≤ 4 GB)
 * - Prefiere movimiento reducido
 * - Conexión lenta (saveData o effectiveType lento)
 */
export function getPerformanceMode(): 'normal' | 'reduced' {
  if (typeof window === 'undefined') return 'normal';

  // Check reduced motion preference
  if (shouldReduceMotion()) return 'reduced';

  // Check hardware concurrency (CPU cores)
  if (typeof navigator !== 'undefined') {
    const cores = navigator.hardwareConcurrency;
    if (cores && cores <= 2) return 'reduced';
  }

  // Check device memory (Chrome/Edge only)
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory && memory <= 4) return 'reduced';
  }

  // Check network connection
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn) {
      if (conn.saveData) return 'reduced';
      const slowTypes = ['slow-2g', '2g', '3g'];
      if (conn.effectiveType && slowTypes.includes(conn.effectiveType)) {
        return 'reduced';
      }
    }
  }

  return 'normal';
}

/**
 * Estima el peso de renderización de una capa basado en conteo de features y tamaño de archivo.
 *
 * Umbrales:
 * - light:  < 100 features AND < 1 MB
 * - medium: < 5000 features AND < 50 MB
 * - heavy:  >= 5000 features OR >= 50 MB
 *
 * @param featureCount - Número de features en la capa
 * @param fileSize - Tamaño del archivo en bytes
 */
export function estimateLayerWeight(
  featureCount: number,
  fileSize: number
): 'light' | 'medium' | 'heavy' {
  const fileSizeMB = fileSize / (1024 * 1024);

  // Heavy
  if (featureCount >= 5000 || fileSizeMB >= 50) return 'heavy';

  // Light
  if (featureCount < 100 && fileSizeMB < 1) return 'light';

  // Medium
  return 'medium';
}
