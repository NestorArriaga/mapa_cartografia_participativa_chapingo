import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/panels.css";
import { loadSafeMapVivoLayers, SafeLayer } from "./lib/safeDataLoader";
import { LeftControlPanel } from "./components/panels/LeftControlPanel";
import { RightDetailPanel } from "./components/panels/RightDetailPanel";
import { MapErrorBoundary } from "./components/system/MapErrorBoundary";
import { useSelectionStore } from "./stores/selectionStore";
import { useLayoutStore } from "./stores/layoutStore";
import { ContributionToolbar } from "./components/tools/ContributionToolbar";
import { ParticipatoryForm } from "./components/form/ParticipatoryForm";
import { TerritorialNodeLayer } from "./components/map/TerritorialNodeLayer";
import { TerritorialCorridorLayer } from "./components/map/TerritorialCorridorLayer";
import { EvidenceRings } from "./components/map/visualLayers/EvidenceRings";
import { RelationshipArcs } from "./components/map/visualLayers/RelationshipArcs";
import { FeedbackPulseLayer } from "./components/map/visualLayers/FeedbackPulseLayer";
import { MapLibreAnimationController } from "./components/map/MapLibreAnimationController";
import { ToastProvider } from "./components/ui/ToastProvider";
import { StatsDashboard } from "./components/analytics/StatsDashboard";
import { useMapStore } from "./stores/mapStore";
import { useDataModeStore } from "./stores/dataModeStore";
import { useLiveMetricsStore } from "./stores/liveMetricsStore";
import { calculateZonePriority, recalculateWithContribution } from "./lib/signals/TerritorialPriorityEngine";

// Raster-only satellite style — no glyphs, no symbol layers
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri",
    },
  },
  layers: [
    {
      id: "satellite",
      type: "raster",
      source: "satellite",
    },
  ],
};

type MapStatus = "mounting" | "loading" | "loaded" | "errored";

/** Panel error fallback — small, non-blocking */
function PanelFallback({ side }: { side: "left" | "right" }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        [side === "left" ? "left" : "right"]: 16,
        background: "rgba(3,7,18,0.9)",
        border: "1px solid rgba(255,77,94,0.2)",
        borderRadius: 12,
        padding: "10px 14px",
        color: "#9AA9BA",
        fontSize: 11,
        zIndex: 30,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      Panel no disponible temporalmente
    </div>
  );
}

export default function StableApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [mapStatus, setMapStatus] = useState<MapStatus>("mounting");
  const [layers, setLayers] = useState<SafeLayer[]>([]);
  const [layerCounts, setLayerCounts] = useState({ zones: 0, nodes: 0, routes: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [panelsHidden, setPanelsHidden] = useState(false);

  const { mode } = useDataModeStore();
  const { 
    leftPanelState, 
    setLeftPanelState, 
    rightPanelState, 
    setRightPanelState,
    presentationMode,
    setPresentationMode,
    setFocusMode,
    showDashboard
  } = useLayoutStore();
  const { setSelection, clearSelection } = useSelectionStore();

  const { activeTool, setActiveTool } = useMapStore();
  const localSubmissions = useLiveMetricsStore((state) => state.localSubmissions);

  const [formOpen, setFormOpen] = useState(false);
  const [formGeometry, setFormGeometry] = useState<any>(null);

  // ─── Keyboard shortcuts (H, F, E, P) ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const key = e.key.toUpperCase();

      if (key === "P") {
        setPresentationMode(!useLayoutStore.getState().presentationMode);
      } else if (key === "H") {
        // Toggle show/hide both panels simultaneously
        const bothHidden =
          useLayoutStore.getState().leftPanelState === "hidden" &&
          useLayoutStore.getState().rightPanelState === "hidden";
        if (bothHidden) {
          setLeftPanelState("expanded");
          setRightPanelState("expanded");
          setPanelsHidden(false);
          document.body.removeAttribute("data-testid");
        } else {
          setLeftPanelState("hidden");
          setRightPanelState("hidden");
          setPanelsHidden(true);
          document.body.setAttribute("data-testid", "panels-hidden");
        }
      } else if (key === "F") {
        // Focus mode: hide panels, expand map to 100vw
        setLeftPanelState("hidden");
        setRightPanelState("hidden");
        setFocusMode(true);
        setPanelsHidden(true);
        document.body.setAttribute("data-testid", "panels-hidden");
      } else if (key === "E") {
        // Expand: open both panels
        setLeftPanelState("expanded");
        setRightPanelState("expanded");
        setFocusMode(false);
        setPanelsHidden(false);
        document.body.removeAttribute("data-testid");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setLeftPanelState, setRightPanelState, setFocusMode]);

  // ─── Contribution Toolbar Logic ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const canvas = map.getCanvas();
    if (activeTool === "add_point" || activeTool === "draw_route" || activeTool === "draw_zone") {
      canvas.style.cursor = "crosshair";
    } else {
      canvas.style.cursor = "";
    }

    if (activeTool === "radial_menu") {
      setFormGeometry(null);
      setFormOpen(true);
      setActiveTool("none");
    }
  }, [activeTool, mapStatus, setActiveTool]);

  // ─── Phase 8: Zone Selection Micro-interactions ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== "loaded") return;

    const useSelection = useSelectionStore.getState().selectedFeature;
    const zoneLayers = layers.filter(l => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon");

    zoneLayers.forEach(layer => {
      const fillLayerId = `${layer.id}-fill`;
      const strokeLayerId = `${layer.id}-stroke`;
      if (!map.getLayer(fillLayerId)) return;

      if (useSelection && useSelection.geometry.type.includes("Polygon")) {
        const selectedId = useSelection.properties?.id || useSelection.properties?.zona;

        map.setPaintProperty(fillLayerId, "fill-opacity", [
          "case",
          ["==", ["coalesce", ["get", "id"], ["get", "zona"]], selectedId],
          [
            "match",
            ["get", "priorityLabel"],
            "prioridad_alta", 0.45,
            "prioridad_media", 0.38,
            "validacion_cualitativa", 0.35,
            "sin_datos_estructurados", 0.28,
            0.28
          ],
          0.03 // Dimmed unselected
        ]);

        map.setPaintProperty(strokeLayerId, "line-width", [
          "case",
          ["==", ["coalesce", ["get", "id"], ["get", "zona"]], selectedId],
          3,
          1
        ]);

        map.setPaintProperty(strokeLayerId, "line-color", [
          "case",
          ["==", ["coalesce", ["get", "id"], ["get", "zona"]], selectedId],
          "#D6A83A", // Gold border when selected
          [
            "match",
            ["get", "priorityLabel"],
            "prioridad_alta", "#FF4D5E",
            "prioridad_media", "#FBBF24",
            "validacion_cualitativa", "#A855F7",
            "sin_datos_estructurados", "#64748B",
            "#64748B"
          ]
        ]);
      } else {
        // Reset to normal
        map.setPaintProperty(fillLayerId, "fill-opacity", [
          "match",
          ["get", "priorityLabel"],
          "prioridad_alta", 0.25,
          "prioridad_media", 0.18,
          "validacion_cualitativa", 0.15,
          "sin_datos_estructurados", 0.08,
          0.08
        ]);
        map.setPaintProperty(strokeLayerId, "line-width", 1.5);
        map.setPaintProperty(strokeLayerId, "line-color", [
          "match",
          ["get", "priorityLabel"],
          "prioridad_alta", "#FF4D5E",
          "prioridad_media", "#FBBF24",
          "validacion_cualitativa", "#A855F7",
          "sin_datos_estructurados", "#64748B",
          "#64748B"
        ]);
      }
    });
  }, [useSelectionStore.getState().selectedFeature, layers, mapStatus]);

  // ─── Load data ───
  useEffect(() => {
    (async () => {
      try {
        const result = await loadSafeMapVivoLayers();
        if (result.ok) {
          setLayers(result.layers);
        }
        if (result.errors.length > 0) {
          setErrors((prev) => [...prev, ...result.errors]);
        }
      } catch (err: any) {
        setErrors((prev) => [...prev, `Data load error: ${err.message}`]);
      } finally {
        setDataLoaded(true);
      }
    })();
  }, []);

  // ─── Init map ───
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    setMapStatus("loading");

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: SATELLITE_STYLE,
        center: [-98.8800, 19.4553],
        zoom: 14.5,
        pitch: 45,
        bearing: -17.6,
        attributionControl: false,
      });

      mapRef.current = map;
      (window as any).maplibreMapInstance = map;

      map.on("load", () => {
        setMapStatus("loaded");
      });

      map.on("error", (e) => {
        console.warn("MapLibre error:", e);
        setMapStatus((prev) => (prev === "loaded" ? "loaded" : "loaded"));
      });

      // Fallback timeout
      const timeout = setTimeout(() => {
        setMapStatus((prev) => {
          if (prev !== "loaded") {
            console.warn("MapLibre load timed out, forcing loaded state");
            return "loaded";
          }
          return prev;
        });
      }, 4000);

      return () => {
        clearTimeout(timeout);
        (window as any).maplibreMapInstance = null;
        map.remove();
        mapRef.current = null;
      };
    } catch (err: any) {
      setMapStatus("errored");
      setErrors((prev) => [...prev, `Map init error: ${err.message}`]);
    }
  }, []);

  // ─── Add layers to map ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== "loaded" || !dataLoaded || layers.length === 0) return;

    let zoneCount = 0;
    let nodeCount = 0;
    let routeCount = 0;

    for (const layer of layers) {
      try {
        const sourceId = `${layer.id}-source`;
        if (map.getSource(sourceId)) continue;

        map.addSource(sourceId, {
          type: "geojson",
          data: layer.data,
        });

        const geomType = layer.geometryType;

        if (geomType === "Polygon" || geomType === "MultiPolygon") {
          // Pre-process priorities
          const features = (layer.data as GeoJSON.FeatureCollection).features;
          features.forEach(f => {
            const zId = String(f.properties?.id || f.properties?.zona || Math.random());
            const zName = String(f.properties?.displayName || f.properties?.zona || "Desconocida");
            const result = calculateZonePriority(zId, zName, []);
            if (!f.properties) f.properties = {};
            f.properties.priorityScore = result.priorityScore;
            f.properties.priorityLabel = result.priorityLabel;
            f.properties.validationStatus = result.validationStatus;
          });

          // Glowing underlying borders
          map.addLayer({
            id: `${layer.id}-glow`,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": [
                "match",
                ["get", "priorityLabel"],
                "prioridad_alta", "#FF4D5E",
                "prioridad_media", "#FBBF24",
                "validacion_cualitativa", "#A855F7",
                "sin_datos_estructurados", "#64748B",
                "#64748B"
              ] as any,
              "line-width": 8,
              "line-blur": 12,
              "line-opacity": 0.4,
            },
          });

          // Fill with rich transparency
          map.addLayer({
            id: `${layer.id}-fill`,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": [
                "match",
                ["get", "priorityLabel"],
                "prioridad_alta", "#FF4D5E",
                "prioridad_media", "#FBBF24",
                "validacion_cualitativa", "#A855F7",
                "sin_datos_estructurados", "#64748B",
                "#64748B"
              ] as any,
              "fill-opacity": [
                "match",
                ["get", "priorityLabel"],
                "prioridad_alta", 0.18,
                "prioridad_media", 0.12,
                "validacion_cualitativa", 0.10,
                "sin_datos_estructurados", 0.05,
                0.05
              ] as any,
            },
          });

          // Crisp stroke
          map.addLayer({
            id: `${layer.id}-stroke`,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": [
                "match",
                ["get", "priorityLabel"],
                "prioridad_alta", "#FF4D5E",
                "prioridad_media", "#FBBF24",
                "validacion_cualitativa", "#A855F7",
                "sin_datos_estructurados", "#64748B",
                "#64748B"
              ] as any,
              "line-width": 1.5,
              "line-opacity": 0.8,
            },
          });
          zoneCount += layer.featureCount;
        } else if (geomType === "Point" || geomType === "MultiPoint") {
          // We no longer add the simple circle layer here.
          // TerritorialNodeLayer will handle the rendering of points.
          nodeCount += layer.featureCount;
        } else if (
          geomType === "LineString" ||
          geomType === "MultiLineString"
        ) {
          // We no longer add the simple line layer here.
          // TerritorialCorridorLayer will handle the rendering of routes/corridors.
          routeCount += layer.featureCount;
        }
      } catch (err: any) {
        setErrors((prev) => [
          ...prev,
          `Layer ${layer.id} render error: ${err.message}`,
        ]);
      }
    }

    setLayerCounts({ zones: zoneCount, nodes: nodeCount, routes: routeCount });
  }, [mapStatus, dataLoaded, layers]);

  // ─── Render Local Submissions ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== "loaded") return;

    const sourceId = "local-contributions-source";
    const layerId = "local-contributions-layer";

    const features = localSubmissions.map((sub: any) => ({
      type: "Feature",
      geometry: {
        type: sub.geom?.type || sub.coordinates ? "Point" : "Point",
        coordinates: sub.geom?.coordinates || sub.coordinates || [-98.8816, 19.4950]
      },
      properties: {
        id: sub.id,
        type: sub.type,
        message: sub.message || sub.description
      }
    }));

    const data = {
      type: "FeatureCollection",
      features
    };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data as any);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: data as any
      });

      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 8,
          "circle-color": "#F43F9D",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
          "circle-opacity": 0.9,
          "circle-pitch-alignment": "map"
        }
      });
    }

    // Update zone priorities based on new submissions
    const zonesLayer = layers.find(l => l.geometryType === "Polygon" || l.geometryType === "MultiPolygon");
    if (zonesLayer) {
      const zSourceId = `${zonesLayer.id}-source`;
      const zSource = map.getSource(zSourceId) as maplibregl.GeoJSONSource;
      if (zSource) {
        const clonedFeatures = JSON.parse(JSON.stringify(zonesLayer.data as GeoJSON.FeatureCollection));
        clonedFeatures.features.forEach((f: any) => {
          const zId = String(f.properties?.id || f.properties?.zona || Math.random());
          const zName = String(f.properties?.displayName || f.properties?.zona || "Desconocida");
          
          let result = calculateZonePriority(zId, zName, []);
          
          localSubmissions.forEach(sub => {
            // Simple geographic assignment: if sub has zone property, or we just apply to all for demo
            if (sub.zone === zName || sub.zone === zId || (sub.message && sub.message.includes(zName))) {
              result = recalculateWithContribution(zId, zName, [], {
                signalType: "participatory_feedback",
                rawScore: 100,
                confidence: "media"
              });
            }
          });

          if (!f.properties) f.properties = {};
          f.properties.priorityScore = result.priorityScore;
          f.properties.priorityLabel = result.priorityLabel;
          f.properties.validationStatus = result.validationStatus;
        });
        zSource.setData(clonedFeatures);
      }
    }
  }, [mapStatus, localSubmissions, layers]);

  // ─── Click on map: feature selection or clear ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== "loaded") return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const tool = useMapStore.getState().activeTool;
      if (tool === "add_point" || tool === "draw_route" || tool === "draw_zone") {
        setFormGeometry({
          type: "Point",
          coordinates: [e.lngLat.lng, e.lngLat.lat],
          precision: "approximate",
          privacyMode: "requires_review"
        });
        setFormOpen(true);
        setActiveTool("none");
        return;
      }

      // Query features under click
      const features = map.queryRenderedFeatures(e.point);
      const hit = features.find(
        (f) =>
          f.layer.id.includes("-fill") ||
          f.layer.id.includes("-circle") ||
          f.layer.id.includes("-line")
      );

      if (hit && hit.properties) {
        const layerId = hit.layer.id;
        const kind: "zone" | "node" | "route" = layerId.includes("-circle")
          ? "node"
          : layerId.includes("-fill") || layerId.includes("-stroke")
          ? "zone"
          : "route";

        setSelection(hit.properties, hit.layer.source as string, kind);

        // Open right panel when something is selected
        if (useLayoutStore.getState().rightPanelState === "hidden") {
          setRightPanelState("expanded");
        }
      } else {
        // Click on empty map → close right panel
        clearSelection();
        setRightPanelState("hidden");
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [mapStatus, clearSelection, setSelection, setRightPanelState]);

  // ─── Panel callbacks ───
  const handleSelectZone = useCallback(
    (zoneName: string) => {
      const zonesLayer = layers.find((l) => l.id.includes("zone"));
      if (zonesLayer?.data?.features) {
        const feat = zonesLayer.data.features.find((f: any) => {
          const name =
            f.properties?.displayName || f.properties?.zona || "";
          return name.toLowerCase() === zoneName.toLowerCase();
        });
        if (feat) {
          setSelection(feat.properties, "zones-source", "zone");
          setRightPanelState("expanded");
          return;
        }
      }
      setSelection({ zona: zoneName }, "zones-source", "zone");
      setRightPanelState("expanded");
    },
    [layers, setSelection, setRightPanelState]
  );

  const handleSelectFeature = useCallback(
    (id: string | null) => {
      if (!id) return;
      for (const layer of layers) {
        if (layer.data?.features) {
          const feat = layer.data.features.find(
            (f: any) =>
              String(f.properties?.id || f.properties?.nodo_id) === String(id)
          );
          if (feat) {
            const kind = layer.id.includes("node")
              ? "node"
              : layer.id.includes("route")
              ? "route"
              : "zone";
            setSelection(
              feat.properties,
              `${layer.id}-source`,
              kind as "zone" | "node" | "route"
            );
            setRightPanelState("expanded");
            return;
          }
        }
      }
    },
    [layers, setSelection, setRightPanelState]
  );

  const handleOpenForm = useCallback(
    (_type?: string, _zone?: string | null, _geom?: any) => {
      // Form integration placeholder — will be re-enabled in future phase
      console.log("Form requested:", _type, _zone);
    },
    []
  );

  return (
    <div
      className={`relative w-full h-screen bg-[#030712] overflow-hidden ${mode === 'academic_internal' ? 'theme-academic' : 'theme-public'}`}
      data-testid="app-root"
    >
      {!useLayoutStore.getState().focusMode && (
        <div className="mv-header-bar">
          <span className="mv-header-title">Mapa Vivo</span>
          <span className="mv-header-sep">/</span>
          <span className="mv-header-sub">UACh–Texcoco · Observatorio de Movilidad Vivida</span>
        </div>
      )}
      <ToastProvider />
      
      {/* ─── Presentation Mode Overlay ─── */}
      {presentationMode && (
        <div className="absolute top-4 left-6 z-50 pointer-events-none">
          <h1 className="title-font text-3xl font-bold text-[#D6A83A] drop-shadow-lg m-0">Mapa Vivo UACh–Texcoco</h1>
          <p className="font-sans text-[#F8FAFC] opacity-90 drop-shadow-md text-sm mt-1">Observatorio de Movilidad Vivida</p>
        </div>
      )}

      {presentationMode && (
        <div className="absolute bottom-6 right-6 z-50">
          <button 
            onClick={() => setPresentationMode(false)}
            className="glass-button bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider"
          >
            Salir de presentación
          </button>
        </div>
      )}

      {/* ─── Stats Dashboard Overlay ─── */}
      {showDashboard && <StatsDashboard />}

      {/* MapErrorBoundary blocks the whole app if there's a fatal map load crash */}
      <MapErrorBoundary moduleName="RootRenderer" fallback={<div className="w-full h-full bg-[#030712] text-white flex items-center justify-center">Error Fatal: Renderer Fallido</div>}>
        <div
          data-testid="stable-map-root"
          ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      />

      {/* ─── Left Control Panel ─── */}
      {leftPanelState !== "hidden" && !useLayoutStore.getState().focusMode && (
        <MapErrorBoundary
          moduleName="LeftControlPanel"
          fallback={<PanelFallback side="left" />}
        >
          <div className="mv-panel mv-panel-left mv-panel-enter">
            <LeftControlPanel
              onSelectZone={handleSelectZone}
              onSelectFeature={handleSelectFeature}
              onOpenForm={handleOpenForm}
              zonesGeoJSON={layers.find(l => l.id === "zones" || l.geometryType === "Polygon" || l.geometryType === "MultiPolygon")?.data}
            />
          </div>
        </MapErrorBoundary>
      )}

      {/* ─── Right Detail Panel ─── */}
      {rightPanelState !== "hidden" && !useLayoutStore.getState().focusMode && (
        <MapErrorBoundary
          moduleName="RightDetailPanel"
          fallback={<PanelFallback side="right" />}
        >
          <div className="mv-panel mv-panel-right mv-panel-enter">
            <RightDetailPanel onOpenForm={handleOpenForm} />
          </div>
        </MapErrorBoundary>
      )}

      {/* Floating instruction banner */}
      {(activeTool === "add_point" || activeTool === "draw_route" || activeTool === "draw_zone") && (
        <div style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(3,7,18,0.9)",
          border: "1px solid rgba(244,63,157,0.5)",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 20,
          zIndex: 40,
          pointerEvents: "none",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          fontWeight: "bold",
          fontSize: "14px"
        }}>
          Haz click en el mapa para indicar la ubicación
        </div>
      )}

      {/* ─── Contribution Toolbar ─── */}
      {!useLayoutStore.getState().focusMode && (
        <MapErrorBoundary
          moduleName="ContributionToolbar"
          fallback={<PanelFallback side="right" />}
        >
          <div className="mv-contrib-toolbar">
            <ContributionToolbar />
          </div>
        </MapErrorBoundary>
      )}

      {/* ─── Participatory Form ─── */}
      {formOpen && (
        <MapErrorBoundary
          moduleName="ParticipatoryForm"
          fallback={null}
        >
          <ParticipatoryForm
            geometrySuggestion={formGeometry}
            onClose={() => {
              setFormOpen(false);
              setFormGeometry(null);
            }}
          />
        </MapErrorBoundary>
      )}

      {/* ─── Territorial Node Layer ─── */}
      {mapStatus === "loaded" && mapRef.current && (
        <MapErrorBoundary moduleName="TerritorialNodeLayer" fallback={null}>
          <TerritorialNodeLayer
            map={mapRef.current}
            nodesGeoJSON={
              ((layers.find(
                (l) => l.geometryType === "Point" || l.geometryType === "MultiPoint"
              )?.data as any) || { type: "FeatureCollection", features: [] }) as any
            }
            onNodeClick={(_id, props) => {
              setSelection(props, "nodes-source", "node");
              setRightPanelState("expanded");
            }}
          />
        </MapErrorBoundary>
      )}

      {/* ─── Territorial Corridor Layer ─── */}
      {mapStatus === "loaded" && mapRef.current && (
        <MapErrorBoundary moduleName="TerritorialCorridorLayer" fallback={null}>
          <TerritorialCorridorLayer
            map={mapRef.current}
            corridorsGeoJSON={
              ((layers.find(
                (l) => l.geometryType === "LineString" || l.geometryType === "MultiLineString"
              )?.data as any) || { type: "FeatureCollection", features: [] }) as any
            }
            onCorridorClick={(feature) => {
              setSelection(feature.properties, "routes-source", "route");
              setRightPanelState("expanded");
            }}
          />
        </MapErrorBoundary>
      )}

      {/* ─── Advanced Visual Layers (Phase 7) ─── */}
      {mapStatus === "loaded" && (
        <>
          <MapErrorBoundary moduleName="EvidenceRings" fallback={null}>
            <EvidenceRings
              map={mapRef.current}
              evidenceData={layers.find(l => l.id.toLowerCase().includes("evidence"))?.data}
            />
          </MapErrorBoundary>
          
          <MapErrorBoundary moduleName="RelationshipArcs" fallback={null}>
            <RelationshipArcs
              map={mapRef.current}
              nodeNetworkData={layers.find(l => l.id.toLowerCase().includes("node") || l.geometryType === "Point")?.data}
              visible={true}
            />
          </MapErrorBoundary>

          <MapErrorBoundary moduleName="FeedbackPulseLayer" fallback={null}>
            <FeedbackPulseLayer map={mapRef.current} />
          </MapErrorBoundary>

          {/* Dynamic "Más que Apple" Animations */}
          <MapLibreAnimationController map={mapRef.current} />
        </>
      )}

      {/* Map Atmosphere */}
      <div className="map-atmosphere" />

      {/* Map status overlay */}
      <div
        data-testid="map-status"
        style={{
          position: "absolute",
          bottom: 16,
          right: rightPanelState !== "hidden" ? 396 : 16,
          background: "rgba(3,7,18,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "12px 16px",
          color: "#F4F7FB",
          fontFamily: "system-ui, sans-serif",
          fontSize: 11,
          zIndex: 20,
          minWidth: 180,
          transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#9AA9BA",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          Mapa Vivo UACh-Texcoco
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <StatusRow
            label="Mapa"
            value={mapStatus}
            ok={mapStatus === "loaded"}
          />
          <StatusRow
            label="Datos"
            value={dataLoaded ? "cargados" : "cargando..."}
            ok={dataLoaded}
          />
          <div
            data-testid="layer-count"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span style={{ color: "#9AA9BA" }}>Capas</span>
            <span style={{ color: "#D6A83A", fontFamily: "monospace" }}>
              {layers.length}
            </span>
          </div>
          <div
            data-testid="zones-count"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span style={{ color: "#9AA9BA" }}>Zonas</span>
            <span style={{ color: "#D6A83A", fontFamily: "monospace" }}>
              {layerCounts.zones}
            </span>
          </div>
          <div
            data-testid="nodes-count"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span style={{ color: "#9AA9BA" }}>Nodos</span>
            <span style={{ color: "#F43F9D", fontFamily: "monospace" }}>
              {layerCounts.nodes}
            </span>
          </div>
          <div
            data-testid="routes-count"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span style={{ color: "#9AA9BA" }}>Rutas</span>
            <span style={{ color: "#35D07F", fontFamily: "monospace" }}>
              {layerCounts.routes}
            </span>
          </div>
        </div>
        {errors.length > 0 && (
          <div
            style={{
              marginTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 8,
              fontSize: 10,
              color: "#FF4D5E",
              maxHeight: 60,
              overflow: "auto",
            }}
          >
            {errors.slice(0, 3).map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden test markers */}
      <div
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div data-testid="map-loaded">
          {mapStatus === "loaded" ? "true" : "false"}
        </div>
        <div data-testid="layers-loaded">
          {dataLoaded ? "true" : "false"}
        </div>
        <div data-testid="map-container">mounted</div>
        <div data-testid="panels-hidden">{panelsHidden ? "true" : "false"}</div>
      </div>
      </MapErrorBoundary>
    </div>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#9AA9BA" }}>{label}</span>
      <span
        style={{
          color: ok ? "#35D07F" : "#FB923C",
          fontFamily: "monospace",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}
