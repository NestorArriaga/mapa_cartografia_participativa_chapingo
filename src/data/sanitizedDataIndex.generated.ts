// GENERADO AUTOMATICAMENTE
export type SanitizedLayerIndexItem = {
  id: string;
  displayName: string;
  fileName: string;
  publicPath: string;
  group: "territorial_reading" | "living_nodes" | "mobility" | "participation" | "documentation";
  geometryType: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "Unknown";
  featureCount: number;
  bbox: [number, number, number, number] | null;
  sizeMB: number;
  visibleDefault: boolean;
  renderPriority: number;
  stylePreset: "zone_priority" | "documentary_nodes" | "orientation_nodes" | "mobility_lines" | "visual_connectors" | "evidence_polygons";
  ethicalVisibility: "public" | "public_aggregated";
  loadable: boolean;
  reasonIfNotLoadable?: string;
};

export const SANITIZED_DATA_INDEX: SanitizedLayerIndexItem[] = [
  {
    "id": "conectores_visualizacion.public",
    "fileName": "conectores_visualizacion.public.geojson",
    "displayName": "Conectores visuales",
    "publicPath": "/data/sanitized/conectores_visualizacion.public.geojson",
    "group": "mobility",
    "geometryType": "LineString",
    "featureCount": 5,
    "bbox": [
      -98.89283437207115,
      19.490583058746367,
      -98.88300015429346,
      19.496304051408757
    ],
    "sizeMB": 0,
    "visibleDefault": true,
    "renderPriority": 6,
    "stylePreset": "visual_connectors",
    "ethicalVisibility": "public",
    "loadable": true
  },
  {
    "id": "evidencia_documental_agregada_por_zona.public",
    "fileName": "evidencia_documental_agregada_por_zona.public.geojson",
    "displayName": "Evidencia agregada",
    "publicPath": "/data/sanitized/evidencia_documental_agregada_por_zona.public.geojson",
    "group": "documentation",
    "geometryType": "MultiPolygon",
    "featureCount": 18,
    "bbox": [
      -98.93109111098386,
      19.48360196092422,
      -98.87423175715932,
      19.50551611973924
    ],
    "sizeMB": 0.03,
    "visibleDefault": false,
    "renderPriority": 2,
    "stylePreset": "evidence_polygons",
    "ethicalVisibility": "public",
    "loadable": true
  },
  {
    "id": "nodos_documentales_publicos_agregados.public",
    "fileName": "nodos_documentales_publicos_agregados.public.geojson",
    "displayName": "Nodos documentales",
    "publicPath": "/data/sanitized/nodos_documentales_publicos_agregados.public.geojson",
    "group": "documentation",
    "geometryType": "Point",
    "featureCount": 20,
    "bbox": [
      -98.9106280898513,
      19.487188729788194,
      -98.88227626819058,
      19.50021316314282
    ],
    "sizeMB": 0.02,
    "visibleDefault": false,
    "renderPriority": 4,
    "stylePreset": "documentary_nodes",
    "ethicalVisibility": "public",
    "loadable": true
  },
  {
    "id": "nodos_orientacion_base.public",
    "fileName": "nodos_orientacion_base.public.geojson",
    "displayName": "Nodos de orientación",
    "publicPath": "/data/sanitized/nodos_orientacion_base.public.geojson",
    "group": "living_nodes",
    "geometryType": "Point",
    "featureCount": 60,
    "bbox": [
      -98.89401756564911,
      19.487924821324032,
      -98.87412325456951,
      19.496277974420053
    ],
    "sizeMB": 0.04,
    "visibleDefault": true,
    "renderPriority": 5,
    "stylePreset": "orientation_nodes",
    "ethicalVisibility": "public",
    "loadable": true
  },
  {
    "id": "trayectos_lectura.public",
    "fileName": "trayectos_lectura.public.geojson",
    "displayName": "Trayectos de lectura",
    "publicPath": "/data/sanitized/trayectos_lectura.public.geojson",
    "group": "mobility",
    "geometryType": "LineString",
    "featureCount": 4,
    "bbox": [
      -98.886,
      19.488,
      -98.875,
      19.502
    ],
    "sizeMB": 0,
    "visibleDefault": true,
    "renderPriority": 7,
    "stylePreset": "mobility_lines",
    "ethicalVisibility": "public",
    "loadable": true
  },
  {
    "id": "vias_contexto_movilidad.light",
    "fileName": "vias_contexto_movilidad.light.geojson",
    "displayName": "Movilidad ligera",
    "publicPath": "/data/sanitized/vias_contexto_movilidad.light.geojson",
    "group": "territorial_reading",
    "geometryType": "LineString",
    "featureCount": 1049,
    "bbox": [
      -98.97054314399998,
      19.459646855000074,
      -98.83498932299995,
      19.584680879000075
    ],
    "sizeMB": 0.72,
    "visibleDefault": true,
    "renderPriority": 0,
    "stylePreset": "mobility_lines",
    "ethicalVisibility": "public",
    "loadable": true
  },
  {
    "id": "zonas_prioridad_integrada_o_indicadores.public",
    "fileName": "zonas_prioridad_integrada_o_indicadores.public.geojson",
    "displayName": "Zonas de prioridad",
    "publicPath": "/data/sanitized/zonas_prioridad_integrada_o_indicadores.public.geojson",
    "group": "territorial_reading",
    "geometryType": "MultiPolygon",
    "featureCount": 5,
    "bbox": [
      -98.93109111098386,
      19.48360196092422,
      -98.87423175715932,
      19.50551611973924
    ],
    "sizeMB": 0.01,
    "visibleDefault": true,
    "renderPriority": 1,
    "stylePreset": "zone_priority",
    "ethicalVisibility": "public",
    "loadable": true
  }
];
