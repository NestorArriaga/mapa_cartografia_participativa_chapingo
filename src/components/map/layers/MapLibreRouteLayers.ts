import { LayerProps } from "react-map-gl/maplibre";

export const getRouteLayers = (sourceId: string, styleClass: string): LayerProps[] => {
  // Define styles based on class
  let ribbonColor = "#D6A83A"; // chapingoGold
  let coreColor = "#FB923C";   // orangeRoute
  let shadowWidth = 16;
  let glowWidth = 13;
  let ribbonWidth = 7;
  let coreWidth = 2.5;
  let isDashed = false;
  let isQualitative = false;

  if (styleClass === "ruta_boyeros_cualitativa") {
    ribbonColor = "#FBBF24"; // amberAttention
    coreColor = "#FF4D5E";   // coralAlert
    shadowWidth = 20;
    glowWidth = 16;
    ribbonWidth = 9;
    coreWidth = 3;
    isDashed = true;
    isQualitative = true;
  } else if (styleClass === "ruta_campus") {
    ribbonColor = "#35D07F"; // agriGreen
    coreColor = "#D6A83A";   // chapingoGold
    shadowWidth = 11;
    glowWidth = 9;
    ribbonWidth = 4.5;
    coreWidth = 2;
    isDashed = true;
  } else if (styleClass === "conector_visual") {
    ribbonColor = "rgba(244,247,251,0.55)";
    coreColor = "transparent";
    shadowWidth = 0;
    glowWidth = 0;
    ribbonWidth = 2;
    coreWidth = 0;
    isDashed = true;
  }

  const layers: LayerProps[] = [];

  if (shadowWidth > 0) {
    layers.push({
      id: `${sourceId}-${styleClass}-shadow`,
      type: "line",
      source: sourceId,
      filter: ["==", ["get", "visualClass"], styleClass],
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "rgba(0,0,0,0.5)",
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, shadowWidth * 0.5, 16, shadowWidth],
        "line-blur": 6
      }
    });
  }

  if (glowWidth > 0) {
    layers.push({
      id: `${sourceId}-${styleClass}-glow`,
      type: "line",
      source: sourceId,
      filter: ["==", ["get", "visualClass"], styleClass],
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": ribbonColor,
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, glowWidth * 0.5, 16, glowWidth],
        "line-blur": 4,
        "line-opacity": isQualitative ? 0.4 : 0.25
      }
    });
  }

  layers.push({
    id: `${sourceId}-${styleClass}-ribbon`,
    type: "line",
    source: sourceId,
    filter: ["==", ["get", "visualClass"], styleClass],
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": ribbonColor,
      "line-width": ["interpolate", ["linear"], ["zoom"], 12, ribbonWidth * 0.5, 16, ribbonWidth],
      "line-opacity": isQualitative ? 0.88 : 0.8,
      "line-dasharray": isDashed && styleClass === "conector_visual" ? [2, 2] : [1]
    }
  });

  if (coreWidth > 0) {
    layers.push({
      id: `${sourceId}-${styleClass}-core`,
      type: "line",
      source: sourceId,
      filter: ["==", ["get", "visualClass"], styleClass],
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": coreColor,
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, coreWidth * 0.5, 16, coreWidth],
        "line-dasharray": isDashed && styleClass !== "conector_visual" ? [1.5, 2] : [1]
        // Note: MapLibre doesn't support easy dynamic offset of dasharray without a custom style update loop
        // We will target this layer in the animation controller
      }
    });
  }

  // Label layer
  if (styleClass !== "conector_visual") {
    layers.push({
      id: `${sourceId}-${styleClass}-label`,
      type: "symbol",
      source: sourceId,
      filter: ["==", ["get", "visualClass"], styleClass],
      minzoom: 12.5,
      layout: {
        "text-field": ["get", "visualLabel"],
        "text-font": ["Inter Regular"],
        "symbol-placement": "line",
        "text-size": 11,
        "text-offset": [0, -1],
        "text-anchor": "bottom",
        "text-allow-overlap": isQualitative ? true : false,
        "text-ignore-placement": isQualitative ? true : false
      },
      paint: {
        "text-color": "#F4F7FB", // softWhite
        "text-halo-color": "#030712", // obsidian
        "text-halo-width": 2
      }
    });
  }

  return layers;
};
