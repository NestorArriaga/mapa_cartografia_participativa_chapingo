import React, { useEffect, useMemo } from "react";
import maplibregl from "maplibre-gl";
import { getRouteLayers } from "../layers/MapLibreRouteLayers";

interface TerritorialRibbonsProps {
  map: maplibregl.Map | null;
  data: any; // GeoJSON FeatureCollection
  sourceId: string;
}

export const TerritorialRibbons: React.FC<TerritorialRibbonsProps> = ({ map, data, sourceId }) => {
  const routeClasses = [
    "ruta_boyeros_cualitativa",
    "ruta_territorial",
    "ruta_campus",
    "conector_visual"
  ];

  const processedData = useMemo(() => {
    if (!data || !data.features) return data;
    return {
      ...data,
      features: data.features.map((f: any) => {
        let styleClass = "ruta_territorial"; // default
        const type = f.properties?.type || f.properties?.tipo || "";
        const name = f.properties?.name || f.properties?.nombre || "";
        
        if (type === "corredor_cualitativo" || name.includes("Boyeros")) {
          styleClass = "ruta_boyeros_cualitativa";
        } else if (type === "campus") {
          styleClass = "ruta_campus";
        } else if (type === "conector") {
          styleClass = "conector_visual";
        }

        return {
          ...f,
          properties: {
            ...f.properties,
            visualClass: styleClass,
            visualLabel: styleClass === "ruta_boyeros_cualitativa" 
              ? "DICIFO <-> Boyeros · validación cualitativa" 
              : name
          }
        };
      })
    };
  }, [data]);

  useEffect(() => {
    if (!map || !processedData) return;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: processedData
      });

      routeClasses.forEach((styleClass) => {
        const layers = getRouteLayers(sourceId, styleClass);
        layers.forEach((layerProps) => {
          if (layerProps.id && !map.getLayer(layerProps.id)) {
            map.addLayer(layerProps as any);
          }
        });
      });
    } else {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(processedData);
    }

    return () => {
      // Optional: cleanup layers and source if necessary, but map manages its own state
    };
  }, [map, processedData, sourceId]);

  return null;
};
