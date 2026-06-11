export function getFallbackDescription(kind: string | null, properties: any): string {
  if (!properties) return '';

  const tipo = String(properties.categoria || properties.tipo || '').toLowerCase();

  if (kind === 'node') {
    if (tipo.includes('orientacion') || tipo.includes('orientación')) {
      return 'Este nodo funciona como referencia territorial dentro del mapa. Ayuda a ubicar edificios, accesos o puntos de lectura espacial vinculados a la movilidad cotidiana en Chapingo–Texcoco.';
    }
    if (tipo.includes('documental')) {
      return 'Este nodo representa evidencia o contexto agregado. Su posición puede ser aproximada y debe leerse como apoyo para comprender el territorio, no como ubicación exacta de un hecho sensible.';
    }
    if (tipo.includes('recurso') || tipo.includes('apoyo')) {
      return 'Este punto es referenciado como un recurso, apoyo o espacio seguro por la comunidad. Ayuda a comprender las redes de cuidado local.';
    }
    return 'Este nodo forma parte del sistema de orientación territorial del mapa. Puede usarse para explorar relaciones entre zonas, nodos, movilidad y aportaciones participativas.';
  }

  if (kind === 'zone') {
    return 'Esta zona forma parte de las unidades de movilidad vivida del proyecto. Su prioridad se construye con información agregada y sirve para orientar validación participativa, no para afirmar un dictamen definitivo.';
  }

  if (kind === 'route' || tipo === 'trayecto_lectura') {
    return 'Este trayecto conecta zonas de movilidad vivida como lectura visual. No representa una recomendación garantizada ni de traslado exacto.';
  }

  if (kind === 'connector') {
    return 'Este conector ayuda a relacionar nodos con la red de movilidad. Es una guía visual, no una ruta recomendada.';
  }

  return 'Este elemento forma parte del sistema territorial del mapa.';
}
