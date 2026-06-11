import { ScatterplotLayer } from '@deck.gl/layers';

export function createMobilityFlowLayer({
  id,
  data,
  visible,
  time = 0
}: any) {
  if (!visible || !data || data.length === 0) return [];

  // Very simplified particle flow. For real flow, we'd interpolate along the LineString geometry.
  // Here we just use the first and last coordinate for a simple bouncing particle or just midpoints.
  
  const particles: any[] = [];
  data.forEach((d: any) => {
    if (d.geometry.type === 'LineString') {
      const coords = d.geometry.coordinates;
      if (coords.length >= 2) {
        const start = coords[0];
        const end = coords[coords.length - 1];
        
        // Simple linear interpolation based on time
        const duration = 10000; // ms
        const t = (time % duration) / duration; 
        
        // Ping-pong
        const currentT = t < 0.5 ? t * 2 : 2 - (t * 2);
        
        const lon = start[0] + (end[0] - start[0]) * currentT;
        const lat = start[1] + (end[1] - start[1]) * currentT;

        particles.push({
          position: [lon, lat],
          color: [53, 208, 127] // agriGreen
        });
      }
    }
  });

  return [
    new ScatterplotLayer({
      id: `${id}-particles`,
      data: particles,
      pickable: false,
      opacity: 0.8,
      stroked: false,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 3,
      radiusMaxPixels: 6,
      getPosition: d => d.position,
      getFillColor: d => [d.color[0], d.color[1], d.color[2], 255],
      updateTriggers: {
        getPosition: [time]
      }
    }),
    new ScatterplotLayer({
      id: `${id}-particles-glow`,
      data: particles,
      pickable: false,
      opacity: 0.3,
      stroked: false,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 8,
      radiusMaxPixels: 15,
      getPosition: d => d.position,
      getFillColor: d => [d.color[0], d.color[1], d.color[2], 100],
      updateTriggers: {
        getPosition: [time]
      }
    })
  ];
}
