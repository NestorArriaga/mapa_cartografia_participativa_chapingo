import { GeoJsonLayer } from '@deck.gl/layers';

export function createConnectorLayer({
  id,
  data,
  visible
}: any) {
  return new GeoJsonLayer({
    id: `${id}-connectors`,
    data,
    visible,
    pickable: false,
    stroked: true,
    filled: false,
    getLineColor: [255, 255, 255, 60],
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    getLineDashArray: [2, 4],
    lineDashJustified: true,
  });
}
