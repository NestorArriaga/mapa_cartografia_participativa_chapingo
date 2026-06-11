import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { MAPVIVO } from "../../../lib/colorScales";

interface EvidenceRingsProps {
  map: maplibregl.Map | null;
  evidenceData: any;
}

export const EvidenceRings: React.FC<EvidenceRingsProps> = ({ map, evidenceData }) => {
  useEffect(() => {
    if (!map || !evidenceData) return;

    const sourceId = "evidence-rings-source";

    try {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(evidenceData);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: evidenceData,
        });
      }

      // Render concentric rings around the evidence boundaries
      // Outer ring
      if (!map.getLayer("evidence-rings-outer")) {
        map.addLayer({
          id: "evidence-rings-outer",
          type: "line",
          source: sourceId,
          paint: {
            "line-color": MAPVIVO.magentaCare,
            "line-width": 2,
            "line-opacity": 0.4,
            "line-dasharray": [3, 3],
          },
        });
      }

      // Middle ring
      if (!map.getLayer("evidence-rings-mid")) {
        map.addLayer({
          id: "evidence-rings-mid",
          type: "line",
          source: sourceId,
          paint: {
            "line-color": MAPVIVO.coralAlert,
            "line-width": 3,
            "line-opacity": 0.6,
            "line-offset": -4,
          },
        });
      }

      // Inner ring (evidence-rings)
      if (!map.getLayer("evidence-rings")) {
        map.addLayer({
          id: "evidence-rings",
          type: "line",
          source: sourceId,
          paint: {
            "line-color": MAPVIVO.maize,
            "line-width": 1.5,
            "line-opacity": 0.8,
            "line-offset": -8,
          },
        });
      }

      // Fill layer to give a textured overlay feel
      if (!map.getLayer("evidence-fill")) {
        map.addLayer({
          id: "evidence-fill",
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": MAPVIVO.magentaCare,
            "fill-opacity": 0.15,
          },
        });
      }
    } catch (err) {
      console.error("Error setting up evidence rings:", err);
    }

    return () => {
      if (!map || !map.getStyle()) return;
      try {
        const layers = ["evidence-rings-outer", "evidence-rings-mid", "evidence-rings", "evidence-fill"];
        layers.forEach((lid) => {
          if (map.getLayer(lid)) map.removeLayer(lid);
        });
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (err) {
        // Ignore style destruction errors
      }
    };
  }, [map, evidenceData]);

  return null;
};
