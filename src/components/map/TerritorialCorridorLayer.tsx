import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";


interface TerritorialCorridorLayerProps {
  map: maplibregl.Map | null;
  corridorsGeoJSON: GeoJSON.FeatureCollection;
  onCorridorClick: (feature: any) => void;
  onCorridorHover?: (feature: any | null) => void;
}

const TYPE_COLORS: Record<string, string> = {
  ruta_territorial: "#FB923C",
  ruta_campus: "#35D07F",
  corredor_cualitativo_validacion: "#FBBF24", // We'll use Amber, glow will be Coral
  ruta_local_sugerida: "#A855F7",
  ruta_calculada: "#F4F7FB"
};

const DEFAULT_COLOR = "#9AA9BA";

// Width expressions
const widthExpression = [
  "match",
  ["get", "corridorType"],
  "ruta_territorial", 5,
  "ruta_campus", 3,
  "corredor_cualitativo_validacion", 7,
  "ruta_local_sugerida", 3,
  "ruta_calculada", 4,
  3
];

// Opacity expressions
const opacityExpression = [
  "match",
  ["get", "corridorType"],
  "ruta_territorial", 0.85,
  "ruta_campus", 0.75,
  "corredor_cualitativo_validacion", 0.9,
  "ruta_local_sugerida", 0.8,
  "ruta_calculada", 0.95,
  0.7
];

// Color expressions
const colorExpression = [
  "match",
  ["get", "corridorType"],
  "ruta_territorial", TYPE_COLORS.ruta_territorial,
  "ruta_campus", TYPE_COLORS.ruta_campus,
  "corredor_cualitativo_validacion", TYPE_COLORS.corredor_cualitativo_validacion,
  "ruta_local_sugerida", TYPE_COLORS.ruta_local_sugerida,
  "ruta_calculada", TYPE_COLORS.ruta_calculada,
  DEFAULT_COLOR
];

export const TerritorialCorridorLayer: React.FC<TerritorialCorridorLayerProps> = ({
  map,
  corridorsGeoJSON,
  onCorridorClick,
  onCorridorHover
}) => {
  const [hoveredCorridor, setHoveredCorridor] = useState<{ feature: any, x: number, y: number } | null>(null);
  
  // 1. Process GeoJSON to inject Boyeros and classify routes
  const processedGeoJSON = React.useMemo(() => {
    if (!corridorsGeoJSON) return null;
    const cloned = JSON.parse(JSON.stringify(corridorsGeoJSON)) as GeoJSON.FeatureCollection;
    
    let hasBoyeros = false;

    cloned.features = cloned.features.map((f: any) => {
      // Heuristic classification if missing
      if (!f.properties.corridorType) {
        const id = String(f.properties.id || "").toLowerCase();
        const name = String(f.properties.name || f.properties.nombre || "").toLowerCase();
        if (id.includes("boyeros") || name.includes("boyeros")) {
          f.properties.corridorType = "corredor_cualitativo_validacion";
          hasBoyeros = true;
        } else if (name.includes("campus") || id.includes("interna")) {
          f.properties.corridorType = "ruta_campus";
        } else {
          f.properties.corridorType = "ruta_territorial"; // default fallback for long routes
        }
      } else {
        if (f.properties.corridorType === "corredor_cualitativo_validacion") {
          hasBoyeros = true;
        }
      }
      return f;
    });

    // Inject Boyeros synthetic route if it doesn't exist
    if (!hasBoyeros) {
      cloned.features.push({
        type: "Feature",
        properties: {
          id: "corridor_boyeros_dicifo",
          corridorType: "corredor_cualitativo_validacion",
          title: "Corredor DICIFO–Boyeros",
          ethicalNote: "Corredor cualitativo de validación. No es ruta exacta ni trayecto seguro.",
          summary: "Evidencia testimonial sobre soledad, baja iluminación y baja presencia de acompañamiento en el trayecto hacia Boyeros.",
          intensity: 3,
          confidence: "baja",
          visibility: "academic_aggregated",
          signalType: "qualitative_testimony"
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-98.8820, 19.4930], // DICIFO aprox
            [-98.8850, 19.4960], // Midpoint
            [-98.8890, 19.4990]  // Boyeros aprox
          ]
        }
      } as any);
    }
    
    return cloned;
  }, [corridorsGeoJSON]);

  // 2. MapLibre Layer Management
  useEffect(() => {
    if (!map || !processedGeoJSON) return;

    const sourceId = "territorial-corridors-source";
    
    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(processedGeoJSON);
      return;
    }

    map.addSource(sourceId, {
      type: "geojson",
      lineMetrics: true,
      data: processedGeoJSON
    });

    // Layer 1: Halo (width * 3, opacity 0.08)
    map.addLayer({
      id: "territorial-corridors-halo",
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-width": ["*", widthExpression, 3] as any,
        "line-color": colorExpression as any,
        "line-opacity": 0.08,
        "line-blur": 4
      }
    });

    // Layer 2: Base Body
    // Notice we separate dashed lines (ruta_local_sugerida)
    map.addLayer({
      id: "territorial-corridors-body",
      type: "line",
      source: sourceId,
      filter: ["!=", ["get", "corridorType"], "ruta_local_sugerida"],
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-width": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          ["+", widthExpression, 2],
          widthExpression
        ] as any,
        "line-color": colorExpression as any,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1.0,
          opacityExpression
        ] as any
      }
    });

    // Layer 2b: Dashed Body for ruta_local_sugerida
    map.addLayer({
      id: "territorial-corridors-body-dashed",
      type: "line",
      source: sourceId,
      filter: ["==", ["get", "corridorType"], "ruta_local_sugerida"],
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-width": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          ["+", widthExpression, 2],
          widthExpression
        ] as any,
        "line-color": colorExpression as any,
        "line-opacity": opacityExpression as any,
        "line-dasharray": [2, 2]
      }
    });

    // Layer 3: Brillo (Glow)
    // Only for ruta_territorial and corredor_cualitativo_validacion
    map.addLayer({
      id: "territorial-corridors-glow",
      type: "line",
      source: sourceId,
      filter: [
        "in", 
        ["get", "corridorType"], 
        ["literal", ["ruta_territorial", "corredor_cualitativo_validacion"]]
      ],
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-width": ["*", widthExpression, 0.4] as any,
        "line-color": [
          "match",
          ["get", "corridorType"],
          "corredor_cualitativo_validacion", "#FF4D5E", // Coral brilloso para Boyeros
          "#F4F7FB" // Crema/blanco para territorial
        ] as any,
        "line-opacity": 0.5,
        "line-blur": 1
      }
    });

    let hoveredId: string | null = null;

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["territorial-corridors-body", "territorial-corridors-body-dashed"]
      });
      
      if (features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        const feature = features[0];
        
        // Feature state for hover (requires feature.id)
        if (feature.id !== undefined) {
          if (hoveredId !== null && hoveredId !== feature.id) {
            map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
          }
          hoveredId = feature.id as string;
          map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: true });
        }

        setHoveredCorridor({
          feature,
          x: e.point.x,
          y: e.point.y
        });
        if (onCorridorHover) onCorridorHover(feature);
      } else {
        map.getCanvas().style.cursor = "";
        if (hoveredId !== null) {
          map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
          hoveredId = null;
        }
        setHoveredCorridor(null);
        if (onCorridorHover) onCorridorHover(null);
      }
    };

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["territorial-corridors-body", "territorial-corridors-body-dashed"]
      });

      if (features.length > 0) {
        onCorridorClick(features[0]);
      }
    };

    const handleMapMove = () => {
      setHoveredCorridor(null);
    };

    map.on("mousemove", handleMouseMove);
    map.on("click", handleClick);
    map.on("move", handleMapMove);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("click", handleClick);
      map.off("move", handleMapMove);
      
      if (!map || !map.getStyle()) return;
      try {
        if (map.getLayer("territorial-corridors-glow")) map.removeLayer("territorial-corridors-glow");
        if (map.getLayer("territorial-corridors-body-dashed")) map.removeLayer("territorial-corridors-body-dashed");
        if (map.getLayer("territorial-corridors-body")) map.removeLayer("territorial-corridors-body");
        if (map.getLayer("territorial-corridors-halo")) map.removeLayer("territorial-corridors-halo");
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (err) {
        // Ignore style destruction errors
      }
    };
  }, [map, processedGeoJSON, onCorridorHover, onCorridorClick]);

  // 3. Render HTML Overlays
  return (
    <div data-testid="territorial-corridor-layer" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 24 }}>
      
      {/* HOVER TOOLTIP */}
      {hoveredCorridor && (
        <div 
          data-testid="corridor-hover-card"
          style={{
            position: "absolute",
            left: hoveredCorridor.x,
            top: hoveredCorridor.y - 15,
            transform: "translate(-50%, -100%)",
            background: "rgba(11, 18, 32, 0.95)",
            backdropFilter: "blur(4px)",
            border: `1px solid ${TYPE_COLORS[hoveredCorridor.feature.properties.corridorType] || DEFAULT_COLOR}`,
            borderRadius: "12px",
            padding: "10px 14px",
            color: "#fff",
            minWidth: "180px",
            maxWidth: "260px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            transition: "all 0.1s ease-out",
            opacity: 1,
            animation: "fade-in-up 0.15s ease-out forwards",
            fontFamily: "system-ui, sans-serif"
          }}
        >
          <div style={{ 
            fontSize: "10px", 
            textTransform: "uppercase", 
            fontWeight: 800, 
            color: TYPE_COLORS[hoveredCorridor.feature.properties.corridorType] || DEFAULT_COLOR,
            letterSpacing: "0.05em",
            marginBottom: "4px"
          }}>
            {hoveredCorridor.feature.properties.corridorType.replace(/_/g, " ")}
          </div>
          
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px", lineHeight: 1.2 }}>
            {hoveredCorridor.feature.properties.title || hoveredCorridor.feature.properties.nombre || "Trayecto"}
          </div>

          {/* Boyeros Ethical Note Overlay */}
          {hoveredCorridor.feature.properties.corridorType === "corredor_cualitativo_validacion" && (
            <div style={{ marginTop: "6px", background: "rgba(251, 191, 36, 0.1)", padding: "6px 8px", borderRadius: "6px", borderLeft: "2px solid #FBBF24" }}>
              <p style={{ margin: 0, fontSize: "10px", color: "#FBBF24", lineHeight: 1.3, fontWeight: 500 }}>
                {hoveredCorridor.feature.properties.ethicalNote || "Corredor cualitativo de validación. No es ruta segura ni ruta exacta."}
              </p>
            </div>
          )}
          
          {hoveredCorridor.feature.properties.corridorType !== "corredor_cualitativo_validacion" && hoveredCorridor.feature.properties.summary && (
            <div style={{ fontSize: "11px", color: "#9AA9BA", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {hoveredCorridor.feature.properties.summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
