import { GeoJsonLayer } from '@deck.gl/layers';

export function createMobilityLayer({
  id,
  data,
  visible
}: any) {
  return new GeoJsonLayer({
    id: `${id}-lines`,
    data,
    visible,
    pickable: false,
    stroked: true,
    filled: false,
    getLineColor: [34, 211, 238, 45], // CyanData with low opacity
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1
  });
}
