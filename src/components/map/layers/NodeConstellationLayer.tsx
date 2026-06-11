import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { useMapStore } from '../../../stores/mapStore';
import { hexToRgb } from '../../../lib/colorScales';

const NODE_COLORS: Record<string, [number, number, number]> = {
  orientacion: hexToRgb('#EAF2FF'),
  documental: hexToRgb('#F43F9D'),
  memoria: hexToRgb('#FF4D5E'),
  recurso: hexToRgb('#35D07F'),
  infraestructura: hexToRgb('#FBBF24'),
  movilidad: hexToRgb('#D6A83A'),
  participacion: hexToRgb('#7EE2A8'),
  revision: hexToRgb('#A855F7')
};

const NODE_SIZES: Record<string, { core: number, halo: number }> = {
  orientacion: { core: 5, halo: 22 },
  documental: { core: 8, halo: 42 },
  memoria: { core: 9, halo: 52 },
  recurso: { core: 9, halo: 48 },
  infraestructura: { core: 8, halo: 44 },
  movilidad: { core: 7, halo: 38 },
  participacion: { core: 8, halo: 50 },
  default: { core: 7, halo: 32 }
};

export function createNodeConstellationLayer({
  id, data, visible, time, debugMode, isSelected, isHovered, setHoveredFeature
}: any) {
  if (!visible) return [];

  const multiplier = debugMode ? 3 : 1;

  // Hashing function to offset the animation per node
  const hashStr = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    return Math.abs(hash);
  };

  const haloLayer = new ScatterplotLayer({
    id: `${id}-halo`,
    data,
    pickable: false,
    opacity: debugMode ? 1 : 0.15,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 1,
    radiusMaxPixels: 500,
    lineWidthMinPixels: 0,
    getPosition: (d: any) => d.geometry?.coordinates,
    getRadius: (d: any) => {
      const cat = d.properties?.categoria || 'default';
      const baseHalo = (NODE_SIZES[cat] || NODE_SIZES.default).halo * multiplier;
      
      const offset = hashStr(d.id || d.properties?.id || '0') % 2000;
      const phase = ((time + offset) % 2000) / 2000;
      const pulse = Math.sin(phase * Math.PI) * 0.3 + 0.8; // 0.8 to 1.1

      return isSelected(d.id) ? baseHalo * 1.5 : (isHovered(d.id) ? baseHalo * 1.2 : baseHalo * pulse);
    },
    getFillColor: (d: any) => {
      if (debugMode) return [244, 63, 157, 100]; // Magenta diagnostic
      const cat = d.properties?.categoria || 'default';
      return NODE_COLORS[cat] || NODE_COLORS.orientacion;
    },
    getLineColor: (d: any) => {
      const cat = d.properties?.categoria || 'default';
      return NODE_COLORS[cat] || NODE_COLORS.orientacion;
    },
    getLineWidth: 1,
    updateTriggers: {
      getRadius: [time, isSelected, isHovered, multiplier],
      getFillColor: [debugMode],
      opacity: [debugMode]
    }
  });

  const coreLayer = new ScatterplotLayer({
    id: `${id}-core`,
    data,
    pickable: true,
    opacity: 1,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1.5,
    getPosition: (d: any) => d.geometry?.coordinates,
    getRadius: (d: any) => {
      const cat = d.properties?.categoria || 'default';
      const baseCore = (NODE_SIZES[cat] || NODE_SIZES.default).core * multiplier;
      return (isSelected(d.id) || isHovered(d.id)) ? baseCore * 1.2 : baseCore;
    },
    getFillColor: (d: any) => {
      const cat = d.properties?.categoria || 'default';
      return NODE_COLORS[cat] || NODE_COLORS.orientacion;
    },
    getLineColor: [255, 255, 255],
    onHover: (info: any) => {
      if (info.object) setHoveredFeature(info.object.id);
      else setHoveredFeature(null);
    },
    updateTriggers: {
      getRadius: [isSelected, isHovered, multiplier]
    }
  });

  const layers = [haloLayer, coreLayer];

  if (useMapStore.getState().showLabels && !debugMode) {
    layers.push(
      new TextLayer({
        id: `${id}-labels`,
        data: data.filter((d: any) => isSelected(d.id) || isHovered(d.id) || d.properties?.importante),
        getPosition: (d: any) => d.geometry?.coordinates,
        getText: (d: any) => d.properties?.nombre || d.properties?.name || '',
        getSize: 12,
        getColor: [255, 255, 255],
        getBackgroundColor: [3, 7, 18, 200], // Obsidian
        getPixelOffset: [0, -20],
        fontFamily: '"Inter", sans-serif',
        fontWeight: 'bold',
        pickable: false
      }) as any
    );
  }

  return layers;
}
