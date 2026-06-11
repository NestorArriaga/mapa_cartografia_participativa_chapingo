import React, { useMemo } from "react";
import maplibregl from "maplibre-gl";
import { InsightHaloLayer } from "./InsightHaloLayer";
import { extractTerritorialSignals } from "../../services/territorialSignalEngine";

interface Props {
  map: maplibregl.Map | null;
  nodesData: any;
}

export const MapDataOverlayController: React.FC<Props> = ({ map, nodesData }) => {
  const haloData = useMemo(() => {
    if (!nodesData) return null;
    const signals = extractTerritorialSignals(nodesData);
    
    // We convert territorial signals into GeoJSON for the heatmap
    return {
      type: "FeatureCollection",
      features: signals.map(s => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: s.coords
        },
        properties: {
          intensity: s.intensity,
          category: s.category
        }
      }))
    };
  }, [nodesData]);

  return (
    <>
      <InsightHaloLayer map={map} haloData={haloData} />
    </>
  );
};
