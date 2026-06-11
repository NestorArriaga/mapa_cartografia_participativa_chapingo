// GENERATED FILE - DO NOT EDIT MANUALLY
// Created by scripts/sanitize-v06-public-data.ts

import { WebLayerRegistryItem } from '../types/layers';

export const layerRegistry: WebLayerRegistryItem[] = [
  {
    "id": "evidencia_documental_agregada_por_zona_v06",
    "name": "evidencia documental agregada por zona",
    "group": "01_web_publico_core",
    "publicPath": "/data/sanitized/evidencia_documental_agregada_por_zona.public.geojson",
    "visibleDefault": true,
    "canShowOnPublicMap": true,
    "loadStrategy": "immediate",
    "geometryType": "MultiPolygon",
    "description": "Sanitized public layer"
  },
  {
    "id": "zonas_prioridad_integrada_o_indicadores_v06",
    "name": "zonas prioridad integrada o indicadores",
    "group": "01_web_publico_core",
    "publicPath": "/data/sanitized/zonas_prioridad_integrada_o_indicadores.public.geojson",
    "visibleDefault": true,
    "canShowOnPublicMap": true,
    "loadStrategy": "immediate",
    "geometryType": "MultiPolygon",
    "description": "Sanitized public layer"
  },
  {
    "id": "nodos_documentales_publicos_agregados_v06",
    "name": "nodos documentales publicos agregados",
    "group": "02_web_publico_nodos",
    "publicPath": "/data/sanitized/nodos_documentales_publicos_agregados.public.geojson",
    "visibleDefault": true,
    "canShowOnPublicMap": true,
    "loadStrategy": "immediate",
    "geometryType": "Point",
    "description": "Sanitized public layer"
  },
  {
    "id": "nodos_orientacion_base_v06",
    "name": "nodos orientacion base",
    "group": "02_web_publico_nodos",
    "publicPath": "/data/sanitized/nodos_orientacion_base.public.geojson",
    "visibleDefault": true,
    "canShowOnPublicMap": true,
    "loadStrategy": "immediate",
    "geometryType": "Point",
    "description": "Sanitized public layer"
  },
  {
    "id": "conectores_visualizacion_v06",
    "name": "conectores visualizacion",
    "group": "03_web_contexto_movilidad",
    "publicPath": "/data/sanitized/conectores_visualizacion.public.geojson",
    "visibleDefault": false,
    "canShowOnPublicMap": true,
    "loadStrategy": "immediate",
    "geometryType": "LineString",
    "description": "Sanitized public layer"
  },
  {
    "id": "vias_contexto_movilidad_v06",
    "name": "Vías de contexto movilidad",
    "group": "03_web_contexto_movilidad",
    "publicPath": "/data/sanitized/vias_contexto_movilidad.light.geojson",
    "visibleDefault": false,
    "canShowOnPublicMap": false,
    "loadStrategy": "disabled_too_large",
    "geometryType": "LineString",
    "description": "Capa original es de 4.3GB. Se usa versión ligera recortada por bounding box."
  }
];
