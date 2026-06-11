// Base map styles to ensure the map ALWAYS renders
// No private tokens required

export const PRIMARY_DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export const FALLBACK_DARK_RASTER_STYLE = {
  version: 8,
  sources: {
    "carto-dark-raster": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "(c) OpenStreetMap contributors (c) CARTO"
    }
  },
  layers: [
    {
      id: "carto-dark-raster",
      type: "raster",
      source: "carto-dark-raster",
      paint: {
        "raster-opacity": 0.92,
        "raster-saturation": -0.15,
        "raster-contrast": 0.05
      }
    }
  ]
};

// Extremely basic offline fallback if no network
export const OFFLINE_FALLBACK_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#0B1220"
      }
    }
  ]
};
