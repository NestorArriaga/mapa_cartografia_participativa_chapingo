// src/components/map/TerritorialNodeLayer.tsx
import { useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection, Point } from 'geojson';

// Categorías y colores
const NODE_CATEGORIES = {
  orientacion:        { color: '#D6A83A', label: 'Orientación' },
  documental:         { color: '#7EE2A8', label: 'Documental' },
  cualitativo:        { color: '#F43F9D', label: 'Cualitativo' },
  memoria:            { color: '#F2C14E', label: 'Memoria' },
  recurso:            { color: '#35D07F', label: 'Recurso' },
  infraestructura:    { color: '#FB923C', label: 'Infraestructura' },
  movilidad:          { color: '#FBBF24', label: 'Movilidad' },
  participacion:      { color: '#A855F7', label: 'Participación' },
  protegido_agregado: { color: '#64748B', label: 'Protegido' },
} as const;

type NodeCategory = keyof typeof NODE_CATEGORIES;

// Radio base por intensidad (1–4)
const BASE_RADIUS: Record<number, number> = { 1: 5, 2: 7, 3: 9, 4: 12 };

interface NodeProperties {
  id: string;
  title?: string;
  category?: NodeCategory;
  intensity?: 1 | 2 | 3 | 4;
  summary?: string;
  description?: string;
  zoneName?: string;
  ethicalNote?: string;
}

interface HoverState {
  nodeId: string;
  x: number;
  y: number;
  properties: NodeProperties;
}
type SelectedState = HoverState;

interface TerritorialNodeLayerProps {
  map: MapLibreMap;
  nodesGeoJSON: FeatureCollection<Point, NodeProperties>;
  onNodeClick?: (id: string, props: NodeProperties) => void;
}

const SOURCE_ID = 'mv-territorial-nodes';
const LAYER_HALO   = 'mv-node-halo';
const LAYER_RING   = 'mv-node-ring';
const LAYER_CORE   = 'mv-node-core';
const LAYER_PULSE  = 'mv-node-pulse';

export function TerritorialNodeLayer({
  map,
  nodesGeoJSON,
  onNodeClick,
}: TerritorialNodeLayerProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const [selected, setSelected] = useState<SelectedState | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  // Normalizar datos: asegurar category e intensity válidos
  const normalizedGeoJSON: FeatureCollection<Point, NodeProperties> = {
    ...nodesGeoJSON,
    features: nodesGeoJSON.features.map((f) => {
      const props = f.properties ?? {};
      const id = props.id ?? String(Math.random());
      let category: NodeCategory = 'orientacion';
      if (props.category && props.category in NODE_CATEGORIES) {
        category = props.category as NodeCategory;
      }
      // Regla Boyeros
      if (
        id.toLowerCase().includes('boyeros') ||
        (props.zoneName ?? '').toLowerCase().includes('boyeros')
      ) {
        category = 'cualitativo';
      }
      const intensity = (props.intensity ?? 2) as 1 | 2 | 3 | 4;
      return {
        ...f,
        properties: { ...props, id, category, intensity },
      };
    }),
  };

  useEffect(() => {
    if (!map) return;

    // Limpiar capas previas si existen
    [LAYER_PULSE, LAYER_HALO, LAYER_RING, LAYER_CORE].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

    // Agregar fuente
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: normalizedGeoJSON,
    });

    // Expresión de color por categoría
    const colorExpression: any = [
      'match',
      ['get', 'category'],
      ...Object.entries(NODE_CATEGORIES).flatMap(([k, v]) => [k, v.color]),
      '#D6A83A', // default
    ];

    // Expresión de radio por intensidad
    const radiusExpression: maplibregl.ExpressionSpecification = [
      'match',
      ['get', 'intensity'],
      1, BASE_RADIUS[1],
      2, BASE_RADIUS[2],
      3, BASE_RADIUS[3],
      4, BASE_RADIUS[4],
      BASE_RADIUS[2],
    ];

    // Expresión de opacity por intensidad
    const opacityExpression: maplibregl.ExpressionSpecification = [
      'match',
      ['get', 'intensity'],
      1, 0.50,
      2, 0.70,
      3, 0.90,
      4, 1.00,
      0.70,
    ];

    // Capa 1: Halo
    map.addLayer({
      id: LAYER_HALO,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': ['*', radiusExpression, 2.4],
        'circle-color': colorExpression,
        'circle-opacity': 0.10,
        'circle-pitch-alignment': 'map',
      },
    });

    // Capa 2: Anillo
    map.addLayer({
      id: LAYER_RING,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': ['*', radiusExpression, 1.5],
        'circle-color': 'rgba(0,0,0,0)',
        'circle-stroke-width': 1.5,
        'circle-stroke-color': colorExpression,
        'circle-stroke-opacity': ['*', opacityExpression, 0.75],
        'circle-pitch-alignment': 'map',
      },
    });

    // Capa 3: Core
    map.addLayer({
      id: LAYER_CORE,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': radiusExpression,
        'circle-color': colorExpression,
        'circle-opacity': opacityExpression,
        'circle-pitch-alignment': 'map',
      },
    });

    // Capa 4: Symbol (Permanent Floating Text)
    const LAYER_SYMBOL = 'mv-node-layer-symbol';
    map.addLayer({
      id: LAYER_SYMBOL,
      type: 'symbol',
      source: SOURCE_ID,
      layout: {
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 10,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-max-width': 12,
        // Only show label if it's high intensity or priority
        'text-allow-overlap': false
      },
      paint: {
        'text-color': '#F4F7FB',
        'text-halo-color': 'rgba(3,7,18, 0.95)',
        'text-halo-width': 2,
        'text-opacity': [
          'case',
          ['>', ['get', 'intensity'], 1], 1,
          0 // hide low intensity nodes to prevent clutter
        ]
      }
    });

    // Eventos de hover
    map.on('mouseenter', LAYER_CORE, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      if (!e.features?.[0]) return;
      const feature = e.features[0];
      const props = feature.properties as NodeProperties;
      const point = map.project(
        (feature.geometry as Point).coordinates as [number, number]
      );
      clearTimeout(hoverTimer.current);
      setHover({ nodeId: props.id ?? '', x: point.x, y: point.y, properties: props });
    });

    map.on('mouseleave', LAYER_CORE, () => {
      map.getCanvas().style.cursor = '';
      hoverTimer.current = setTimeout(() => setHover(null), 250);
    });

    // Eventos de click
    map.on('click', LAYER_CORE, (e) => {
      if (!e.features?.[0]) return;
      const feature = e.features[0];
      const props = feature.properties as NodeProperties;
      const point = map.project(
        (feature.geometry as Point).coordinates as [number, number]
      );
      setSelected({ nodeId: props.id ?? '', x: point.x, y: point.y, properties: props });
      onNodeClick?.(props.id ?? '', props);
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_CORE] });
      if (features.length === 0) setSelected(null);
    });

    return () => {
      clearTimeout(hoverTimer.current);
      if (!map || !map.getStyle()) return;
      try {
        [LAYER_PULSE, LAYER_HALO, LAYER_RING, LAYER_CORE, 'mv-node-layer-symbol'].forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch (err) {
        // Ignore unmount errors if style is destroyed
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Actualizar datos sin recrear capas
  useEffect(() => {
    const source = map.getSource(SOURCE_ID);
    if (source && 'setData' in source) {
      (source as maplibregl.GeoJSONSource).setData(normalizedGeoJSON);
    }
  }, [nodesGeoJSON]);

  const getNodeColor = (category?: NodeCategory) =>
    NODE_CATEGORIES[category ?? 'orientacion']?.color ?? '#D6A83A';

  const getNodeLabel = (category?: NodeCategory) =>
    NODE_CATEGORIES[category ?? 'orientacion']?.label ?? 'Nodo';

  const isBoyerosNode = (props: NodeProperties) =>
    props.id?.toLowerCase().includes('boyeros') ||
    (props.zoneName ?? '').toLowerCase().includes('boyeros');

  return (
    <>
      {/* Hover Card */}
      {hover && (
        <div
          className="mv-node-callout visible"
          style={{ left: hover.x, top: hover.y }}
          data-testid="node-hover-card"
          onMouseEnter={() => clearTimeout(hoverTimer.current)}
          onMouseLeave={() => { hoverTimer.current = setTimeout(() => setHover(null), 200); }}
        >
          <div
            className="mv-callout-category"
            style={{ color: getNodeColor(hover.properties.category) }}
          >
            {getNodeLabel(hover.properties.category)}
          </div>
          <div className="mv-callout-title">
            {hover.properties.title ?? 'Sin título'}
          </div>
          {hover.properties.summary && (
            <div className="mv-callout-desc">
              {hover.properties.summary.slice(0, 80)}
              {(hover.properties.summary.length ?? 0) > 80 ? '…' : ''}
            </div>
          )}
          <div className="mv-callout-line" />
        </div>
      )}

      {/* Selected Callout */}
      {selected && (
        <div
          className="mv-node-callout"
          style={{
            left: selected.x,
            top: selected.y,
            transform: 'translate(-50%, calc(-100% - 16px))',
            minWidth: 220,
            pointerEvents: 'auto',
          }}
          data-testid="node-callout"
        >
          <div
            className="mv-callout-category"
            style={{ color: getNodeColor(selected.properties.category) }}
          >
            ◆ {getNodeLabel(selected.properties.category)}
            {selected.properties.zoneName && ` · ${selected.properties.zoneName}`}
          </div>
          <div className="mv-callout-title">
            {selected.properties.title ?? 'Sin título'}
          </div>
          {selected.properties.description && (
            <div className="mv-callout-desc">{selected.properties.description}</div>
          )}
          {(selected.properties.ethicalNote || isBoyerosNode(selected.properties)) && (
            <div className="mv-ethical-box" style={{ marginTop: 8 }}>
              <div className="mv-ethical-label">Nota de Campo</div>
              <div className="mv-ethical-text">
                {selected.properties.ethicalNote ??
                  'Señal cualitativa agregada. No representa punto exacto ni condición absoluta.'}
              </div>
            </div>
          )}
          <div className="mv-callout-line" />
        </div>
      )}
    </>
  );
}
