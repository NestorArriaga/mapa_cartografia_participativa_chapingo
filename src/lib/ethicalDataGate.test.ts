import { describe, it, expect } from 'vitest';
import { getEthicalVisibility, isFeaturePublicSafe, sanitizeFeatureProperties } from './ethicalDataGate';
import { Feature } from 'geojson';

describe('Ethical Data Gate', () => {
  it('should block explicit no_publicar', () => {
    const f: Feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { nivel_uso: '04_no_publicar_sensible' }
    };
    expect(getEthicalVisibility(f)).toBe('blocked');
    expect(isFeaturePublicSafe(f)).toBe(false);
  });

  it('should block categoria sensible', () => {
    const f: Feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { categoria: 'sensible' }
    };
    expect(getEthicalVisibility(f)).toBe('blocked');
  });

  it('should flag for review if point has sensitive text', () => {
    const f: Feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { resumen: 'Este punto cerca del internado' }
    };
    expect(getEthicalVisibility(f)).toBe('review');
    expect(isFeaturePublicSafe(f)).toBe(false);
  });

  it('should allow safe public aggregated zone', () => {
    const f: Feature = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 1], [0, 1], [0, 0]]] },
      properties: { nivel_uso: '01_publico_general', resumen: 'Zona de movilidad agregada' }
    };
    expect(getEthicalVisibility(f)).toBe('public');
    expect(isFeaturePublicSafe(f)).toBe(true);
  });

  it('should sanitize strings by replacing sensitive words', () => {
    const props = { nombre: 'Cerca del baño principal', extra: 'OK' };
    const clean = sanitizeFeatureProperties(props);
    expect(clean.nombre).toContain('[CONTENIDO PROTEGIDO]');
    expect(clean.extra).toBe('OK');
  });
});
