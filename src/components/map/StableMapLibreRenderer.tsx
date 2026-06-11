import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SafeLayer } from "../../lib/safeDataLoader";

import { MapLibreAnimationController } from "./MapLibreAnimationController";
import { computeNodeIntelligence } from "../../services/nodeIntelligenceEngine";
import { MAPVIVO } from "../../lib/colorScales";

// ESRI Satellite style object (free, no API key needed)
const SATELLITE_STYLE = {
  version: 8 as const,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
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

interface StableMapLibreRendererProps {
  layers: SafeLayer[];
  onMapLoaded: (loaded: boolean) => void;
  onLayersLoaded: (loaded: boolean) => void;
  onLayerCounts: (counts: { zones: number; nodes: number; routes: number }) => void;
  addErrors: (errs: string[]) => void;
  // Callback when a feature is clicked (for panels interaction)
  onFeatureClick?: (type: "zone" | "node" | "route", feature: any) => void;
}

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

export const StableMapLibreRenderer: React.FC<StableMapLibreRendererProps> = ({
  layers,
  onMapLoaded,
  onLayersLoaded,
  onLayerCounts,
  addErrors,
  onFeatureClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoadedState, setMapLoadedState] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!isWebGLSupported()) {
      console.warn("WebGL not supported. Fallback mock map activated.");
      setMapLoadedState(true);
      onMapLoaded(true);
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: SATELLITE_STYLE,
      center: [-98.8816, 19.4950],
      zoom: 14.5,
      pitch: 45,
      bearing: -17.6,
      attributionControl: false
    });

    mapRef.current = map;
    (window as any).maplibreMapInstance = map;

    map.on("load", () => {
      setMapLoadedState(true);
      onMapLoaded(true);
    });

    map.on("error", (e) => {
      console.warn("MapLibre error (often font 404), proceeding anyway:", e);
      // Even if there's a 404 for a tile or font, we should unlock the app
      setMapLoadedState((prev) => {
        if (!prev) onMapLoaded(true);
        return true;
      });
      addErrors([`MapLibre warning: ${e.error?.message || "Unknown error"}`]);
    });

    // Fallback: if MapLibre gets stuck loading tiles and never fires "load"
    const loadTimeout = setTimeout(() => {
      setMapLoadedState((prev) => {
        if (!prev) {
          console.warn("MapLibre load event timed out, forcing map loaded state.");
          onMapLoaded(true);
        }
        return true;
      });
    }, 2500);

    return () => {
      clearTimeout(loadTimeout);
      (window as any).maplibreMapInstance = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Effect to load layers once map is loaded and layers are available
  useEffect(() => {
    if (!mapLoadedState || layers.length === 0) return;

    let zonesCount = 0;
    let nodesCount = 0;
    let routesCount = 0;

    const findLayer = (idPattern: string) => {
      return layers.find(l => l.id.toLowerCase().includes(idPattern) || idPattern.toLowerCase().includes(l.id));
    };

    const zonesLayer = findLayer("zone");
    if (zonesLayer) zonesCount = zonesLayer.featureCount;

    const routesLayer = findLayer("route") || findLayer("via") || findLayer("trayectos");
    if (routesLayer) routesCount = routesLayer.featureCount;

    const nodesLayer = findLayer("node") || findLayer("nodos");
    if (nodesLayer) nodesCount = nodesLayer.featureCount;

    onLayerCounts({
      zones: zonesCount,
      nodes: nodesCount,
      routes: routesCount
    });

    if (!isWebGLSupported()) {
      onLayersLoaded(true);
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    // 1. ZONAS
    if (zonesLayer) {
      try {
        zonesCount = zonesLayer.featureCount;
        if (map.getSource("zones-source")) {
          (map.getSource("zones-source") as maplibregl.GeoJSONSource).setData(zonesLayer.data);
        } else {
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

          // Click handler for zones
          map.on("click", "zones-fill", (e) => {
            if (e.features && e.features[0] && onFeatureClick) {
              onFeatureClick("zone", e.features[0].properties);
            }
          });

          map.on("mouseenter", "zones-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "zones-fill", () => {
            map.getCanvas().style.cursor = "";
          });
        }
      } catch (err: any) {
        addErrors([`Error rendering zones layer: ${err.message}`]);
      }
    }

    // 2. RUTAS

    if (routesLayer) {
      try {
        routesCount = routesLayer.featureCount;
        if (map.getSource("routes-source")) {
          (map.getSource("routes-source") as maplibregl.GeoJSONSource).setData(routesLayer.data);
        } else {
          map.addSource("routes-source", {
            type: "geojson",
            data: routesLayer.data
          });
          map.addLayer({
            id: "routes-line",
            type: "line",
            source: "routes-source",
            paint: {
              "line-color": MAPVIVO.orangeRoute,
              "line-width": 3,
              "line-opacity": 0.8
            }
          });

          map.on("click", "routes-line", (e) => {
            if (e.features && e.features[0] && onFeatureClick) {
              onFeatureClick("route", e.features[0].properties);
            }
          });
        }
      } catch (err: any) {
        addErrors([`Error rendering routes layer: ${err.message}`]);
      }
    }

    // 3. CONECTORES
    const connectorsLayer = findLayer("connector") || findLayer("conectores");
    if (connectorsLayer) {
      try {
        if (map.getSource("connectors-source")) {
          (map.getSource("connectors-source") as maplibregl.GeoJSONSource).setData(connectorsLayer.data);
        } else {
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
        }
      } catch (err: any) {
        addErrors([`Error rendering connectors layer: ${err.message}`]);
      }
    }

    // 4. NODOS
    if (nodesLayer) {
      try {
        nodesCount = nodesLayer.featureCount;

        // Precompute styling fields for each node feature to enable data-driven styling
        const rawFeatures = nodesLayer.data?.features || [];
        const styledFeatures = rawFeatures.map((f: any) => {
          const profile = computeNodeIntelligence(f.properties);
          return {
            ...f,
            properties: {
              ...f.properties,
              coreColor: profile.coreColor,
              ringColor: profile.ringColor,
              auraColor: profile.auraColor,
              coreRadius: profile.coreRadius,
              ringRadius: profile.ringRadius,
              auraIntensity: profile.auraIntensity,
              categoryLabel: profile.categoryLabel,
              // Legacy properties required by some components temporarily:
              haloRadius: profile.coreRadius * 4,
              haloColor: profile.auraColor,
              color: profile.coreColor
            }
          };
        });

        const precomputedGeoJSON = {
          ...nodesLayer.data,
          features: styledFeatures
        };

        if (map.getSource("nodes-source")) {
          (map.getSource("nodes-source") as maplibregl.GeoJSONSource).setData(precomputedGeoJSON as any);
        } else {
          map.addSource("nodes-source", {
            type: "geojson",
            data: precomputedGeoJSON as any
          });

          // Add required halo layers for orientations, documentary, qualitative, resources
          const classesWithHalos = ["orientacion", "documental", "cualitativo", "recurso"];
          classesWithHalos.forEach((cls) => {
            const layerId = `nodes-halo-${cls}`;
            if (!map.getLayer(layerId)) {
              map.addLayer({
                id: layerId,
                type: "circle",
                source: "nodes-source",
                filter: ["==", ["get", "nodeClass"], cls],
                paint: {
                  "circle-radius": ["coalesce", ["get", "haloRadius"], 20],
                  "circle-color": ["coalesce", ["get", "haloColor"], "rgba(255,255,255,0)"],
                  "circle-opacity": 0.4
                }
              });
            }
          });

          // Add nodes-core-by-class
          if (!map.getLayer("nodes-core-by-class")) {
            map.addLayer({
              id: "nodes-core-by-class",
              type: "circle",
              source: "nodes-source",
              paint: {
                "circle-radius": ["coalesce", ["get", "coreRadius"], 6],
                "circle-color": ["coalesce", ["get", "color"], "#eab308"]
              }
            });
          }

          // Add nodes-stroke
          if (!map.getLayer("nodes-stroke")) {
            map.addLayer({
              id: "nodes-stroke",
              type: "circle",
              source: "nodes-source",
              paint: {
                "circle-radius": ["coalesce", ["get", "coreRadius"], 6],
                "circle-color": "transparent",
                "circle-stroke-color": "#050805",
                "circle-stroke-width": 1.5
              }
            });
          }

          // Add nodes-label symbol layer
          if (!map.getLayer("nodes-label")) {
            map.addLayer({
              id: "nodes-label",
              type: "symbol",
              source: "nodes-source",
              layout: {
                "text-field": ["coalesce", ["get", "label"], ""],
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
          }

          // Add legacy layers just to maintain compatibility if references exist
          if (!map.getLayer("nodes-circle")) {
            map.addLayer({
              id: "nodes-circle",
              type: "circle",
              source: "nodes-source",
              paint: {
                "circle-radius": 1,
                "circle-color": "transparent"
              }
            });
          }

          if (!map.getLayer("nodes-labels")) {
            map.addLayer({
              id: "nodes-labels",
              type: "symbol",
              source: "nodes-source",
              layout: {
                "text-field": ["coalesce", ["get", "label"], ""],
                "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
                "text-size": 1
              },
              paint: {
                "text-opacity": 0
              }
            });
          }

          // Click and mouse interactions
          map.on("click", "nodes-core-by-class", (e) => {
            if (e.features && e.features[0] && onFeatureClick) {
              onFeatureClick("node", e.features[0].properties);
            }
          });

          map.on("mouseenter", "nodes-core-by-class", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "nodes-core-by-class", () => {
            map.getCanvas().style.cursor = "";
          });
        }
      } catch (err: any) {
        addErrors([`Error rendering nodes layer: ${err.message}`]);
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
      className="stable-maplibregl-map" 
      style={{ width: "100%", height: "100%" }}
    >
      <MapLibreAnimationController map={mapRef.current} />
    </div>
  );
};
