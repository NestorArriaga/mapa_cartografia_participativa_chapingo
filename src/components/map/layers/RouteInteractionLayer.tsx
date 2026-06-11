import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { useMapStore } from "../../../stores/mapStore";

interface RouteInteractionLayerProps {
  map: maplibregl.Map | null;
}

export const RouteInteractionLayer: React.FC<RouteInteractionLayerProps> = ({ map }) => {
  const computedRoutes = useMapStore((state) => state.computedRoutes);

  useEffect(() => {
    if (!map) return;

    const sourceId = "computed-routes-source";
    const data = {
      type: "FeatureCollection",
      features: computedRoutes
    };

    try {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data as any);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: data as any
        });
      }

      // Glow Layer (wide blur)
      if (!map.getLayer("computed-routes-glow")) {
        map.addLayer({
          id: "computed-routes-glow",
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#F43F9D", // magentaCare
            "line-width": 12,
            "line-opacity": 0.4,
            "line-blur": 6
          },
          layout: {
            "line-cap": "round",
            "line-join": "round"
          }
        });
      }

      // Core Layer
      if (!map.getLayer("computed-routes-core")) {
        map.addLayer({
          id: "computed-routes-core",
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#D6A83A", // chapingoGold
            "line-width": 5,
            "line-opacity": 0.9
          },
          layout: {
            "line-cap": "round",
            "line-join": "round"
          }
        });
      }
    } catch (err) {
      console.error("Error updating computed routes layer:", err);
    }

    return () => {
      // Clean up layer but preserve source or cleanup both safely
      if (!map) return;
      try {
        if (map.getLayer("computed-routes-glow")) map.removeLayer("computed-routes-glow");
        if (map.getLayer("computed-routes-core")) map.removeLayer("computed-routes-core");
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (err) {
        // ignore cleanup errors
      }
    };
  }, [map, computedRoutes]);

  return null;
};
export default RouteInteractionLayer;
