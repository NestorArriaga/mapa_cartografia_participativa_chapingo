import { PolygonLayer } from '@deck.gl/layers';
import { hexToRgb } from '../../../lib/colorScales';
import { LiveZoneMetrics } from '../../../services/liveDataEngine';

export function createZonePriorityLayer({
  id, data, visible, liveMetrics, debugMode, isSelected, isHovered, setHoveredFeature
}: any) {
  if (!visible) return [];

  const multiplier = debugMode ? 3 : 1;

  const getPriorityColor = (metrics?: LiveZoneMetrics) => {
    if (debugMode) return [214, 168, 58]; // Gold diagnostics
    const prio = metrics?.recalculatedPriority || 'sin_datos';
    if (prio === 'muy_alta') return hexToRgb('#FF4D5E'); // Coral
    if (prio === 'alta') return hexToRgb('#F43F9D'); // Magenta
    if (prio === 'media') return hexToRgb('#FBBF24'); // Amber
    if (prio === 'baja') return hexToRgb('#35D07F'); // Green
    return hexToRgb('#9AA9BA'); // Gray sin datos
  };

  const getOpacity = (metrics?: LiveZoneMetrics) => {
    if (debugMode) return 150;
    const score = metrics?.recalculatedScore || 0;
    return Math.floor(20 + (score * 60)); // 20 to 80 alpha
  };

  return [
    new PolygonLayer({
      id: `${id}-zones`,
      data,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,
      wireframe: true,
      lineWidthMinPixels: debugMode ? 3 : 1.5,
      getPolygon: (d: any) => d.geometry.coordinates,
      getFillColor: (d: any) => {
        const metrics = liveMetrics[d.id || d.properties?.id_zona];
        const base = getPriorityColor(metrics);
        return [...base, getOpacity(metrics)] as [number, number, number, number];
      },
      getLineColor: (d: any) => {
        const metrics = liveMetrics[d.id || d.properties?.id_zona];
        return getPriorityColor(metrics) as unknown as readonly [number, number, number];
      },
      getLineWidth: (d: any) => {
        return (isSelected(d.id) || isHovered(d.id)) ? 4 * multiplier : 1.5 * multiplier;
      },
      onHover: (info: any) => {
        if (info.object) setHoveredFeature(info.object.id);
        else setHoveredFeature(null);
      },
      updateTriggers: {
        getFillColor: [liveMetrics, debugMode],
        getLineColor: [liveMetrics, debugMode],
        getLineWidth: [isSelected, isHovered, multiplier]
      }
    })
  ];
}
