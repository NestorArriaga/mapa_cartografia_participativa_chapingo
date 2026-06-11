import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

interface MapLibreAnimationControllerProps {
  map: maplibregl.Map | null;
}

export const MapLibreAnimationController: React.FC<MapLibreAnimationControllerProps> = ({ map }) => {
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!map) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      console.log("Animation disabled: prefers-reduced-motion is active");
      return;
    }

    const renderLoop = () => {
      if (!map || !map.getStyle()) return;

      const elapsed = (Date.now() - startTimeRef.current) / 1000;

      try {
        // 1. Node Aura Pulse (intensity 4 equivalent via halo layer)
        if (map.getLayer("territorial-nodes-halo")) {
          const baseOpacity = 0.12;
          const pulse = Math.sin(elapsed * 2.0) * 0.08;
          map.setPaintProperty("territorial-nodes-halo", "circle-opacity", baseOpacity + pulse);
        }

        // 2. Corridor Glow Pulse (Boyeros shimmer)
        if (map.getLayer("territorial-corridors-glow")) {
          const baseOpacity = 0.5;
          const pulse = Math.sin(elapsed * 1.5) * 0.2; // stronger pulse
          map.setPaintProperty("territorial-corridors-glow", "line-opacity", baseOpacity + pulse);
        }

        // 3. Pulse zones fill opacity slightly for breathing effect
        if (map.getLayer("zones-fill")) {
          const baseOpacity = 0.15 + Math.sin(elapsed * 1.0) * 0.05;
          map.setPaintProperty("zones-fill", "fill-opacity", baseOpacity);
        }
      } catch (err) {
        // Fail-safe: animation failure must not hide layers or crash execution
      }

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [map]);

  return null;
};
export default MapLibreAnimationController;
