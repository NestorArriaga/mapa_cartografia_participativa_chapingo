export type BaseMapMode = "satellite" | "night" | "contrast";

export const ESRI_SATELLITE_STYLE = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Tiles (c) Esri — Source: Esri, Earthstar Geographics"
    }
  },
  layers: [
    {
      id: "satellite",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "raster-opacity": 1
      }
    }
  ]
};

export const CARTO_DARK_STYLE = {
  version: 8,
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "(c) OpenStreetMap contributors, (c) CARTO"
    }
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export const CARTO_LIGHT_STYLE = {
  version: 8,
  sources: {
    "carto-light": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "(c) OpenStreetMap contributors, (c) CARTO"
    }
  },
  layers: [
    {
      id: "carto-light-layer",
      type: "raster",
      source: "carto-light",
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

export const BASEMAP_MODES: Record<BaseMapMode, { label: string; description: string; default: boolean; styleUrl?: any }> = {
  satellite: {
    label: "Satélite Vivo",
    description: "Imagen territorial con atmósfera nocturna y capas luminosas.",
    default: true,
    styleUrl: ESRI_SATELLITE_STYLE
  },
  night: {
    label: "Nocturno Analítico",
    description: "Mapa oscuro para leer datos, nodos y flujos.",
    default: false,
    styleUrl: CARTO_DARK_STYLE
  },
  contrast: {
    label: "Contraste Cartográfico",
    description: "Vista clara para revisión y accesibilidad.",
    default: false,
    styleUrl: CARTO_LIGHT_STYLE
  }
};
