import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SafeLayer } from "../../lib/safeDataLoader";

// ESRI Satellite style object (free, no API key needed)
const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    satellite: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri &mdash; Source: Esri"
    }
  },
  layers: [
    {
      id: "satellite-layer",
      type: "raster" as const,
      source: "satellite",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};


interface SafeMapLibreMapProps {
  layers: SafeLayer[];
  onMapLoaded: (loaded: boolean) => void;
  onLayersLoaded: (loaded: boolean) => void;
  onLayerCounts: (counts: { zones: number; nodes: number; routes: number }) => void;
  addErrors: (errs: string[]) => void;
}

export const SafeMapLibreMap: React.FC<SafeMapLibreMapProps> = ({
  layers,
  onMapLoaded,
  onLayersLoaded,
  onLayerCounts,
  addErrors
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoadedState, setMapLoadedState] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: SATELLITE_STYLE,
      center: [-98.8816, 19.4950],
      zoom: 14.5,
      pitch: 45,
      attributionControl: false
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log("MapLibre base map loaded");
      setMapLoadedState(true);
      onMapLoaded(true);
    });

    map.on("error", (e) => {
      console.error("MapLibre error:", e);
      addErrors([`MapLibre error: ${e.error?.message || "Unknown error"}`]);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Effect to load layers once map is loaded and layers are available
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedState || layers.length === 0) return;

    let zonesCount = 0;
    let nodesCount = 0;
    let routesCount = 0;

    
    // Helper to find layer by id or sub-pattern
    const findLayer = (idPattern: string) => {
      return layers.find(l => l.id.toLowerCase().includes(idPattern) || idPattern.toLowerCase().includes(l.id));
    };

    // 1. ZONAS
    const zonesLayer = findLayer("zone");
    if (zonesLayer) {
      try {
        zonesCount = zonesLayer.featureCount;
        map.addSource("zones-source", {
          type: "geojson",
          data: zonesLayer.data
        });
        map.addLayer({
          id: "zones-fill",
          type: "fill",
          source: "zones-source",
          paint: {
            "fill-color": "#22d3ee",
            "fill-opacity": 0.25
          }
        });
        map.addLayer({
          id: "zones-stroke",
          type: "line",
          source: "zones-source",
          paint: {
            "line-color": "#22d3ee",
            "line-width": 2
          }
        });
      } catch (err: any) {
        addErrors([`Error rendering zones layer: ${err.message}`]);
      }
    }

    // 2. RUTAS
    const routesLayer = findLayer("route") || findLayer("via") || findLayer("trayectos");
    if (routesLayer) {
      try {
        routesCount = routesLayer.featureCount;
        map.addSource("routes-source", {
          type: "geojson",
          data: routesLayer.data
        });
        map.addLayer({
          id: "routes-line",
          type: "line",
          source: "routes-source",
          paint: {
            "line-color": "#f43f5e",
            "line-width": 3,
            "line-opacity": 0.8
          }
        });
      } catch (err: any) {
        addErrors([`Error rendering routes layer: ${err.message}`]);
      }
    }

    // 3. CONECTORES
    const connectorsLayer = findLayer("connector") || findLayer("conectores");
    if (connectorsLayer) {
      try {
        map.addSource("connectors-source", {
          type: "geojson",
          data: connectorsLayer.data
        });
        map.addLayer({
          id: "connectors-line",
          type: "line",
          source: "connectors-source",
          paint: {
            "line-color": "#c8a23a",
            "line-width": 1.5,
            "line-dasharray": [2, 2]
          }
        });
      } catch (err: any) {
        addErrors([`Error rendering connectors layer: ${err.message}`]);
      }
    }

    // 4. NODOS
    const nodesLayer = findLayer("node") || findLayer("nodos");
    if (nodesLayer) {
      try {
        nodesCount = nodesLayer.featureCount;
        map.addSource("nodes-source", {
          type: "geojson",
          data: nodesLayer.data
        });
        map.addLayer({
          id: "nodes-circle",
          type: "circle",
          source: "nodes-source",
          paint: {
            "circle-radius": 6,
            "circle-color": "#eab308",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 1
          }
        });
      } catch (err: any) {
        addErrors([`Error rendering nodes layer: ${err.message}`]);
      }
    }

    // 5. LABELS
    // Add text labels on nodes
    if (nodesLayer) {
      try {
        map.addLayer({
          id: "nodes-labels",
          type: "symbol",
          source: "nodes-source",
          layout: {
            "text-field": ["coalesce", ["get", "nombre"], ["get", "titulo"], ""],
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            "text-size": 10,
            "text-offset": [0, 1.2],
            "text-anchor": "top"
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#000000",
            "text-halo-width": 1
          }
        });
      } catch (err: any) {
        addErrors([`Error rendering labels layer: ${err.message}`]);
      }
    }

    onLayerCounts({
      zones: zonesCount,
      nodes: nodesCount,
      routes: routesCount
    });

    onLayersLoaded(true);
  }, [mapLoadedState, layers]);

  return (
    <div 
      ref={mapContainerRef} 
      className="safe-map-container" 
      style={{ width: "100%", height: "100%" }}
    />
  );
};
