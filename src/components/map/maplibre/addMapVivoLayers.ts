import maplibregl from 'maplibre-gl';
import { MAPVIVO } from '../../../lib/colorScales';

export function addMapVivoLayers(map: maplibregl.Map) {
  
  // 1. Vías y Movilidad Base
  if (!map.getLayer('mobility-lines')) {
    map.addLayer({
      id: 'mobility-lines',
      type: 'line',
      source: 'mapvivo-mobility',
      paint: {
        'line-color': MAPVIVO.obsidian,
        'line-width': 1.5,
        'line-opacity': 0.8
      }
    });
  }

  // 2. Trayectos de Lectura
  if (!map.getLayer('reading-routes-glow')) {
    map.addLayer({
      id: 'reading-routes-glow',
      type: 'line',
      source: 'mapvivo-reading-routes',
      paint: {
        'line-color': MAPVIVO.chapingoGold,
        'line-width': 12,
        'line-opacity': 0.15,
        'line-blur': 4
      }
    });
    map.addLayer({
      id: 'reading-routes-line',
      type: 'line',
      source: 'mapvivo-reading-routes',
      paint: {
        'line-color': MAPVIVO.chapingoGold,
        'line-width': 3,
        'line-opacity': 0.8
      }
    });
  }

  // 3. Zonas (Polígonos base y bordes)
  if (!map.getLayer('zones-fill')) {
    map.addLayer({
      id: 'zones-fill',
      type: 'fill',
      source: 'mapvivo-zones',
      paint: {
        'fill-color': [
          'match',
          ['get', 'score_riesgo_percibido'],
          1, MAPVIVO.agriGreen,
          2, MAPVIVO.amberAttention,
          3, MAPVIVO.magentaCare,
          4, MAPVIVO.coralAlert,
          MAPVIVO.protectedGray // default
        ],
        'fill-opacity': 0.15
      }
    });
    map.addLayer({
      id: 'zones-outline',
      type: 'line',
      source: 'mapvivo-zones',
      paint: {
        'line-color': MAPVIVO.chapingoGold,
        'line-width': 1.5,
        'line-opacity': 0.6
      }
    });
  }

  // 4. Agregados Académicos (SÓLO PARA MODO INVESTIGACIÓN)
  if (!map.getLayer('review-aggregate-halo')) {
    map.addLayer({
      id: 'review-aggregate-halo',
      type: 'circle',
      source: 'mapvivo-review-aggregates',
      paint: {
        'circle-radius': 45,
        'circle-color': MAPVIVO.violetReview,
        'circle-opacity': 0.2,
        'circle-blur': 1
      }
    });
  }

  // 5. Nodos Documentales
  if (!map.getLayer('nodes-documentary-core')) {
    map.addLayer({
      id: 'nodes-documentary-core',
      type: 'circle',
      source: 'mapvivo-documentary-nodes',
      paint: {
        'circle-radius': 6,
        'circle-color': MAPVIVO.magentaCare,
        'circle-stroke-color': MAPVIVO.obsidian,
        'circle-stroke-width': 2
      }
    });
  }

  // 6. Nodos de Orientación
  if (!map.getLayer('nodes-orientation-core')) {
    map.addLayer({
      id: 'nodes-orientation-core',
      type: 'circle',
      source: 'mapvivo-orientation-nodes',
      paint: {
        'circle-radius': 5,
        'circle-color': MAPVIVO.softWhite,
        'circle-stroke-color': MAPVIVO.obsidian,
        'circle-stroke-width': 1.5
      }
    });
  }

  // 7. Aportaciones Locales y Computadas
  if (!map.getLayer('computed-routes-line')) {
    map.addLayer({
      id: 'computed-routes-line',
      type: 'line',
      source: 'mapvivo-computed-routes',
      paint: {
        'line-color': MAPVIVO.cyanData, // Temporary/Calculated color
        'line-width': 4,
        'line-dasharray': [2, 2]
      }
    });
  }
}

export function updateLayerVisibility(map: maplibregl.Map, isXRay: boolean, isAcademic: boolean) {
  if (!map.getStyle()) return;

  // Toggle Academic Layers
  const academicDisplay = isAcademic ? 'visible' : 'none';
  if (map.getLayer('review-aggregate-halo')) {
    map.setLayoutProperty('review-aggregate-halo', 'visibility', academicDisplay);
  }

  // X-Ray Mode: Force massive outlines and opacities
  if (isXRay) {
    if (map.getLayer('zones-outline')) map.setPaintProperty('zones-outline', 'line-width', 6);
    if (map.getLayer('zones-outline')) map.setPaintProperty('zones-outline', 'line-color', MAPVIVO.coralAlert);
    if (map.getLayer('nodes-documentary-core')) map.setPaintProperty('nodes-documentary-core', 'circle-radius', 24);
  } else {
    // Reset to normal
    if (map.getLayer('zones-outline')) map.setPaintProperty('zones-outline', 'line-width', 1.5);
    if (map.getLayer('zones-outline')) map.setPaintProperty('zones-outline', 'line-color', MAPVIVO.chapingoGold);
    if (map.getLayer('nodes-documentary-core')) map.setPaintProperty('nodes-documentary-core', 'circle-radius', 6);
  }
}
