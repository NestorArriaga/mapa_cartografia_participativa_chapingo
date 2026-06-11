import { PathLayer } from '@deck.gl/layers';
import { ComputedRoute } from '../../../services/routeEngine';
import { hexToRgb } from '../../../lib/colorScales';

export function createComputedRoutesLayer({
  id, routes, visible, debugMode
}: {
  id: string;
  routes: ComputedRoute[];
  visible: boolean;
  debugMode: boolean;
}) {
  if (!visible || routes.length === 0) return [];

  const multiplier = debugMode ? 3 : 1;

  const getColor = (mode: string) => {
    if (debugMode) return [53, 208, 127]; // Green diagnostic
    if (mode === 'lectura') return hexToRgb('#D6A83A'); // Gold
    if (mode === 'ruta_sugerida_para_revision') return hexToRgb('#F43F9D'); // Magenta
    if (mode === 'validacion_participativa') return hexToRgb('#FF4D5E'); // Coral
    return hexToRgb('#EAF2FF'); // Context
  };

  return [
    new PathLayer({
      id: `${id}-computed`,
      data: routes,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 4 * multiplier,
      getPath: (d: ComputedRoute) => d.geometry.coordinates,
      getColor: (d: ComputedRoute) => getColor(d.mode) as unknown as readonly [number, number, number],
      getWidth: 4 * multiplier,
      updateTriggers: {
        getColor: [debugMode],
        getWidth: [multiplier]
      }
    })
  ];
}
