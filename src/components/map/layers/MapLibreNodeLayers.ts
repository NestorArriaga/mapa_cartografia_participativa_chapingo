import { LayerProps } from "react-map-gl/maplibre";

export const getNodeLayers = (sourceId: string): LayerProps[] => {
  return [
    // 1. nodes-ground-shadow
    {
      id: `${sourceId}-shadow`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "rgba(0,0,0,0.40)",
        "circle-blur": 0.90,
        "circle-radius": ["*", ["get", "visualHaloRadius"], 1.1]
      }
    },
    // 2. nodes-aura
    {
      id: `${sourceId}-aura`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": ["get", "visualHaloColor"],
        "circle-blur": 0.78,
        "circle-opacity": 0.30,
        "circle-radius": ["get", "visualHaloRadius"]
      }
    },
    // 3. nodes-inner-glow
    {
      id: `${sourceId}-glow`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": ["get", "visualColor"],
        "circle-blur": 0.42,
        "circle-opacity": 0.38,
        "circle-radius": ["*", ["get", "visualScale"], 2.4]
      }
    },
    // 4. nodes-core
    {
      id: `${sourceId}-core`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": ["get", "visualColor"],
        "circle-opacity": 0.98,
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, ["get", "visualScale"],
          15, ["+", ["get", "visualScale"], 3],
          17, ["+", ["get", "visualScale"], 5]
        ]
      }
    },
    // 5. nodes-ring
    {
      id: `${sourceId}-ring`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "transparent",
        "circle-stroke-color": ["get", "visualRingColor"],
        "circle-stroke-width": 2,
        "circle-stroke-opacity": 0.95,
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, ["+", ["get", "visualScale"], 3],
          15, ["+", ["get", "visualScale"], 6],
          17, ["+", ["get", "visualScale"], 8]
        ]
      }
    },
    // 6. nodes-selected-ring
    {
      id: `${sourceId}-selected-ring`,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "transparent",
        "circle-stroke-color": "#F4F7FB", // softWhite
        "circle-stroke-width": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          3,
          0
        ],
        "circle-stroke-opacity": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          0.95,
          0
        ],
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, ["+", ["get", "visualScale"], 7],
          15, ["+", ["get", "visualScale"], 10],
          17, ["+", ["get", "visualScale"], 12]
        ]
      }
    },
    // 7. nodes-label
    {
      id: `${sourceId}-label`,
      type: "symbol",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      minzoom: 14,
      layout: {
        "text-field": ["get", "visualLabel"],
        "text-font": ["JetBrains Mono Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 10,
          17, 13
        ],
        "text-offset": [0, 1.5],
        "text-anchor": "top"
      },
      paint: {
        "text-color": "#F4F7FB", // softWhite
        "text-halo-color": "#030712", // obsidian
        "text-halo-width": 2
      }
    }
  ];
};

export const getClusterLayers = (sourceId: string): LayerProps[] => {
  return [
    // cluster-shadow
    {
      id: `${sourceId}-cluster-shadow`,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "rgba(0,0,0,0.50)",
        "circle-blur": 0.8,
        "circle-radius": 30
      }
    },
    // cluster-aura
    {
      id: `${sourceId}-cluster-aura`,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#D6A83A", // dominant chapingoGold fallback
        "circle-blur": 0.6,
        "circle-opacity": 0.4,
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          10,
          30,
          30,
          40
        ]
      }
    },
    // cluster-core
    {
      id: `${sourceId}-cluster-core`,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#050805", // blackSoil
        "circle-stroke-color": "#D6A83A",
        "circle-stroke-width": 2,
        "circle-radius": [
          "step",
          ["get", "point_count"],
          16,
          10,
          20,
          30,
          24
        ]
      }
    },
    // cluster-count-label
    {
      id: `${sourceId}-cluster-count`,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["JetBrains Mono Regular"],
        "text-size": 12
      },
      paint: {
        "text-color": "#D6A83A",
        "text-halo-color": "#030712",
        "text-halo-width": 2
      }
    }
  ];
};
