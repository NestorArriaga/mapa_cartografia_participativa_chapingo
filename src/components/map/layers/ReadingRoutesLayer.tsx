import { PathLayer } from '@deck.gl/layers';
import { hexToRgb } from '../../../lib/colorScales';

export function createReadingRoutesLayer({
  id,
  data,
  visible,
  isSelected,
  isHovered,
  setHoveredFeature
}: any) {
  if (!visible) return [];

  const baseColor = hexToRgb('#D6A83A'); // chapingoGold
  const highlightColor = hexToRgb('#F2C14E'); // maize

  return [
    new PathLayer({
      id: `${id}-routes`,
      data,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 2,
      widthMaxPixels: 10,
      getPath: (d: any) => d.geometry.coordinates,
      getColor: (d: any) => {
        if (isSelected(d.properties.id)) return [...highlightColor, 255];
        if (isHovered(d.properties.id)) return [...baseColor, 255];
        return [...baseColor, 180];
      },
      getWidth: (d: any) => {
        if (isSelected(d.properties.id)) return 5;
        if (isHovered(d.properties.id)) return 4;
        return 2;
      },
      onHover: ({ object }) => setHoveredFeature(object ? object.properties.id : null),
      updateTriggers: {
        getColor: [isSelected, isHovered],
        getWidth: [isSelected, isHovered]
      }
    })
  ];
}
