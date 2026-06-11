import React, { useState, useEffect } from "react";
import { StableMapLibreRenderer } from "./StableMapLibreRenderer";
import { TerritorialRibbons } from "./visualLayers/TerritorialRibbons";
import { EvidenceRings } from "./visualLayers/EvidenceRings";
import { RelationshipArcs } from "./visualLayers/RelationshipArcs";
import { FeedbackPulseLayer } from "./visualLayers/FeedbackPulseLayer";
import { RouteInteractionLayer } from "./layers/RouteInteractionLayer";
import { MapRadialMenu } from "./MapRadialMenu";
import { useMapStore } from "../../stores/mapStore";
import { useSelectionStore } from "../../stores/selectionStore";
import { SafeLayer } from "../../lib/safeDataLoader";
import maplibregl from "maplibre-gl";
import { MapErrorBoundary } from "../system/MapErrorBoundary";
import { AdaptivePanelController } from "../layout/AdaptivePanelController";
import { MapDataOverlayController } from "./MapDataOverlayController";

interface EnhancedMapExperienceProps {
  layers: SafeLayer[];
  onMapLoaded: (loaded: boolean) => void;
  onLayersLoaded: (loaded: boolean) => void;
  onLayerCounts: (counts: { zones: number; nodes: number; routes: number }) => void;
  addErrors: (errs: string[]) => void;
  onOpenForm: (prefilledType: string, prefilledZone: string | null, geom: any) => void;
}

export const EnhancedMapExperience: React.FC<EnhancedMapExperienceProps> = ({
  layers,
  onMapLoaded,
  onLayersLoaded,
  onLayerCounts,
  addErrors,
  onOpenForm
}) => {
  const { setActiveTool } = useMapStore();
  const activeLayers = useMapStore((s) => s.activeLayers);
  const { setSelection } = useSelectionStore();

  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [radialMenuPos, setRadialMenuPos] = useState<{ x: number; y: number; latLng: [number, number] } | null>(null);

  // Sync layer visibilities in MapLibre
  useEffect(() => {
    if (!mapInstance) return;

    const toggleVisibility = (layerId: string, visible: boolean) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    };

    // 1. Zonas
    const zonesVisible = activeLayers.includes("zones") || activeLayers.includes("zonas_prioridad_integrada_o_indicadores");
    toggleVisibility("zones-fill", zonesVisible);
    toggleVisibility("zones-stroke", zonesVisible);

    // 2. Evidencia
    const evidenceVisible = activeLayers.includes("evidencePolygons");
    toggleVisibility("evidence-rings-outer", evidenceVisible);
    toggleVisibility("evidence-rings-mid", evidenceVisible);
    toggleVisibility("evidence-rings", evidenceVisible);
    toggleVisibility("evidence-fill", evidenceVisible);

    // 3. Movilidad ligera (mobilityLines)
    const mobilityVisible = activeLayers.includes("mobilityLines") || activeLayers.includes("vias_contexto_movilidad.light");
    toggleVisibility("routes-line", mobilityVisible);

    // 4. Conectores (connectors)
    const connectorsVisible = activeLayers.includes("connectors");
    toggleVisibility("connectors-line", connectorsVisible);

    // 5. Trayectos de lectura (readingRoutes)
    const readingRoutesVisible = activeLayers.includes("readingRoutes");
    toggleVisibility("reading-routes-ribbon-core", readingRoutesVisible);
    toggleVisibility("reading-routes-ribbon-glow", readingRoutesVisible);

    // 6. Rutas del campus (campusRoutes)
    const campusRoutesVisible = activeLayers.includes("campusRoutes");
    toggleVisibility("campus-internal-routes", campusRoutesVisible);

    // 7. Red de nodos (nodeNetwork)
    const nodeNetworkVisible = activeLayers.includes("nodeNetwork");
    toggleVisibility("relationship-arcs", nodeNetworkVisible);

    // 8. Nodos (documentary vs orientation vs protected)
    const showDoc = activeLayers.includes("documentaryNodes");
    const showOri = activeLayers.includes("orientationNodes");
    const showProt = activeLayers.includes("protectedAggregates");

    const activeClasses: string[] = [];
    if (showDoc) {
      activeClasses.push("documental", "cualitativo", "memoria", "recurso", "infraestructura", "movilidad", "participacion");
    }
    if (showOri) {
      activeClasses.push("orientacion");
    }
    if (showProt) {
      activeClasses.push("protegido_agregado");
    }

    const filterExpr = ["in", ["get", "nodeClass"], ["literal", activeClasses]];
    
    const nodeLayers = [
      "nodes-core-by-class",
      "nodes-stroke",
      "nodes-label",
      "nodes-circle",
      "nodes-labels",
      "nodes-halo-orientacion",
      "nodes-halo-documental",
      "nodes-halo-cualitativo",
      "nodes-halo-recurso"
    ];

    nodeLayers.forEach(layerId => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setFilter(layerId, filterExpr as any);
      }
    });

  }, [mapInstance, activeLayers]);

  // Extract layers data for overlays
  const findLayerData = (idPattern: string) => {
    const l = layers.find(l => l.id.toLowerCase().includes(idPattern) || idPattern.toLowerCase().includes(l.id));
    return l ? l.data : null;
  };

  const evidenceData = findLayerData("evidence");
  const routesData = findLayerData("route") || findLayerData("rutas");
  const nodesData = findLayerData("node") || findLayerData("nodos");

  const handleMapLoaded = (loaded: boolean) => {
    onMapLoaded(loaded);
  };

  const handleFeatureClick = (type: "zone" | "node" | "route", properties: any) => {
    setSelection(properties, `${type}-source`, type);
  };

  // Callback to capture the map reference when loaded
  const handleCaptureMap = (map: maplibregl.Map) => {
    setMapInstance(map);

    // Bind map click events for contribution tools
    map.on("click", (e) => {
      const tool = useMapStore.getState().activeTool;
      if (tool === "add_point" || tool === "radial_menu") {
        const point = map.project(e.lngLat);
        setRadialMenuPos({
          x: point.x,
          y: point.y,
          latLng: [e.lngLat.lng, e.lngLat.lat]
        });
        setActiveTool("none");
      } else if (tool === "measure_distance") {
        // Simple measure tool: alerts distance from map center
        const center = map.getCenter();
        const dist = e.lngLat.distanceTo(center);
        alert(`Distancia desde el centro del campus: ${Math.round(dist)} metros (${Math.round(dist / 80)} minutos caminando).`);
        setActiveTool("none");
      }
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }} data-testid="enhanced-map-experience">
      <StableMapLibreRenderer
        layers={layers}
        onMapLoaded={handleMapLoaded}
        onLayersLoaded={onLayersLoaded}
        onLayerCounts={onLayerCounts}
        addErrors={addErrors}
        onFeatureClick={handleFeatureClick}
      />

      {/* Capture Map Instance cleanly using wrapper */}
      <MapInstanceCapturer map={mapInstance} onCapture={handleCaptureMap} layers={layers} />

      {/* Modular Visual Layers overlays */}
      <MapErrorBoundary moduleName="MapDataOverlayController">
        <MapDataOverlayController map={mapInstance} nodesData={nodesData} />
      </MapErrorBoundary>
      <MapErrorBoundary moduleName="TerritorialRibbons">
        <TerritorialRibbons map={mapInstance} data={routesData} sourceId="mobilityLines" />
      </MapErrorBoundary>
      <MapErrorBoundary moduleName="EvidenceRings">
        <EvidenceRings map={mapInstance} evidenceData={evidenceData} />
      </MapErrorBoundary>
      <MapErrorBoundary moduleName="RelationshipArcs">
        <RelationshipArcs map={mapInstance} nodeNetworkData={nodesData} visible={true} />
      </MapErrorBoundary>
      <MapErrorBoundary moduleName="FeedbackPulseLayer">
        <FeedbackPulseLayer map={mapInstance} />
      </MapErrorBoundary>
      <MapErrorBoundary moduleName="RouteInteractionLayer">
        <RouteInteractionLayer map={mapInstance} />
      </MapErrorBoundary>

      {/* Layout Control */}
      <AdaptivePanelController map={mapInstance} />

      {/* Radial Menu for contribution quick adding */}
      {radialMenuPos && (
        <MapRadialMenu
          x={radialMenuPos.x}
          y={radialMenuPos.y}
          latLng={radialMenuPos.latLng}
          onComplete={() => setRadialMenuPos(null)}
          onOpenForm={onOpenForm}
        />
      )}
    </div>
  );
};

// Helper internal component to capture reference to maplibregl Map object safely
const MapInstanceCapturer: React.FC<{
  map: maplibregl.Map | null;
  onCapture: (map: maplibregl.Map) => void;
  layers: any[];
}> = ({ map, onCapture, layers }) => {
  useEffect(() => {
    // Attempt to grab map instance from window or reference if exposed
    const canvases = document.getElementsByClassName("maplibregl-canvas");
    if (canvases.length > 0) {
      // Find the mapRef by querying window or binding internally
      // To bypass window binding, we can mock lookups or bind in renderer.
      // Let's bind it onto window during StableMapLibreRenderer init for access
      const mapInstance = (window as any).maplibreMapInstance;
      if (mapInstance && !map) {
        onCapture(mapInstance);
      }
    }
  }, [layers]);

  return null;
};
export default EnhancedMapExperience;
