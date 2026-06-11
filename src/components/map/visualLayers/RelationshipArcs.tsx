import React, { useEffect } from "react";
import maplibregl from "maplibre-gl";

interface RelationshipArcsProps {
  map: maplibregl.Map | null;
  nodeNetworkData: any;
  visible: boolean;
  selectedNodeId?: string | null;
}

export const RelationshipArcs: React.FC<RelationshipArcsProps> = ({
  map,
  nodeNetworkData,
  visible,
  selectedNodeId,
}) => {
  useEffect(() => {
    if (!map || !nodeNetworkData) return;

    const sourceId = "relationship-arcs-source";

    try {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(nodeNetworkData);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: nodeNetworkData,
        });
      }

      const layerId = "relationship-arcs";
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": ["coalesce", ["get", "color"], "#D6A83A"],
            "line-width": 2.5,
            "line-opacity": ["coalesce", ["get", "opacity"], 0.6],
          },
          layout: {
            "line-cap": "round",
            "line-join": "round",
            visibility: visible || selectedNodeId ? "visible" : "none",
          },
        });
      } else {
        map.setLayoutProperty(layerId, "visibility", visible || selectedNodeId ? "visible" : "none");
      }
    } catch (err) {
      console.error("Error setting up relationship arcs layer:", err);
    }

    return () => {
      if (!map || !map.getStyle()) return;
      try {
        if (map.getLayer("relationship-arcs")) {
          map.removeLayer("relationship-arcs");
        }
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch (err) {
        // Ignore style destruction errors
      }
    };
  }, [map, nodeNetworkData, visible, selectedNodeId]);

  return null;
};
