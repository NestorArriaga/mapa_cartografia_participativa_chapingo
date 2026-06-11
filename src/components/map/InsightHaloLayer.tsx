import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";

interface Props {
  map: maplibregl.Map | null;
  haloData: any;
}

export const InsightHaloLayer: React.FC<Props> = ({ map, haloData }) => {
  useEffect(() => {
    if (!map || !haloData) return;

    if (map.getSource("insight-halo-source")) {
      (map.getSource("insight-halo-source") as maplibregl.GeoJSONSource).setData(haloData);
    } else {
      map.addSource("insight-halo-source", {
        type: "geojson",
        data: haloData
      });

      // Animated heatmap or halo layer for dense regions
      map.addLayer({
        id: "insight-halo-heatmap",
        type: "heatmap",
        source: "insight-halo-source",
        maxzoom: 16,
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 1, 0, 5, 1],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 11, 0.5, 15, 2],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(244,63,157,0)",
            0.2, "rgba(214,168,58,0.2)",
            0.5, "rgba(244,63,157,0.5)",
            0.8, "rgba(53,208,127,0.8)",
            1, "rgba(255,255,255,0.9)"
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 11, 15, 15, 40],
          "heatmap-opacity": 0.6
        }
      });
    }

    return () => {
      // Clean up if unmounted
    };
  }, [map, haloData]);

  return null;
};
