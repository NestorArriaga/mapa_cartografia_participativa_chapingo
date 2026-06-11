import maplibregl from "maplibre-gl";

/**
 * Rebuilds and adds all zone and polygon layers to the MapLibre instance.
 */
export function addMapLibreZoneLayers(
  map: maplibregl.Map,
  sourceId: string,
  selectedZoneName: string | null
): void {
  const selectedName = selectedZoneName || "";

  const forceAddLayer = (layer: maplibregl.LayerSpecification) => {
    if (map.getLayer(layer.id)) {
      map.removeLayer(layer.id);
    }
    map.addLayer(layer);
  };

  // 1. Fill Layer
  forceAddLayer({
    id: "zones-fill",
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": ["coalesce", ["get", "visualColor"], "#64748B"],
      "fill-opacity": 0.16
    }
  });

  // 2. Stroke Layer
  forceAddLayer({
    id: "zones-stroke",
    type: "line",
    source: sourceId,
    paint: {
      "line-color": ["coalesce", ["get", "visualColor"], "#64748B"],
      "line-width": 2,
      "line-opacity": 0.65
    }
  });

  // 3. Highlight/Accent Border for Selected Zone
  forceAddLayer({
    id: "zones-selected-outline",
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "#D6A83A", // Chapingo Gold
      "line-width": 3.5,
      "line-opacity": [
        "case",
        [
          "or",
          ["==", ["coalesce", ["get", "zona"], ""], selectedName],
          ["==", ["coalesce", ["get", "displayName"], ""], selectedName]
        ],
        0.9,
        0
      ],
      "line-blur": 1.0
    }
  });

  // 4. Centered Zone Name Label (using symbol layer with placement point)
  // Note: For polygons, MapLibre will place symbols at the centroid if layout is set accordingly.
  forceAddLayer({
    id: "zones-label",
    type: "symbol",
    source: sourceId,
    layout: {
      "text-field": ["coalesce", ["get", "visualLabel"], ""],
      "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
      "text-size": 11,
      "text-anchor": "center",
      "text-allow-overlap": false
    },
    paint: {
      "text-color": "#D6A83A", // Chapingo Gold
      "text-halo-color": "#030712",
      "text-halo-width": 2.0,
      "text-opacity": 0.85
    }
  });
}
