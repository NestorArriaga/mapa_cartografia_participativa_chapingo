import { useState, useEffect, useMemo } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { SANITIZED_DATA_INDEX } from '../../data/sanitizedDataIndex.generated';
import { buildLiveZoneMetrics } from '../../services/liveDataEngine';
import { buildNodeNetwork } from '../../services/nodeNetworkEngine';
import { useMapAnimation } from '../../lib/animationSystem';

import { createZonePriorityLayer } from './layers/ZonePriorityLayer';
import { createNodeConstellationLayer } from './layers/NodeConstellationLayer';
import { createNodeNetworkLayer } from './layers/NodeNetworkLayer';
import { createComputedRoutesLayer } from './layers/ComputedRoutesLayer';
import { createMobilityFlowLayer } from './layers/MobilityFlowLayer';

export function useLayerOrchestrator() {
  const { 
    activeLayers, 
    debugMode,
    selectedFeatureId, 
    hoveredFeatureId, 
    setHoveredFeature,
    markLayerLoaded,
    markLayerFailed,
    setLoadState,
    localSubmissions,
    computedRoutes,
    setLiveMetrics,
    setNodeNetwork,
    updateDataStats
  } = useMapStore();

  const [loadedData, setLoadedData] = useState<Record<string, any>>({});
  const { time } = useMapAnimation(true);

  // 1. Fetch GeoJSON
  useEffect(() => {
    if (activeLayers.length === 0) {
      setLoadState('loaded');
      return;
    }
    activeLayers.forEach(async (layerId) => {
      if (!loadedData[layerId]) {
        const item = SANITIZED_DATA_INDEX.find(l => l.id === layerId);
        if (item && item.publicPath) {
          try {
            const res = await fetch(item.publicPath);
            const data = await res.json();
            setLoadedData(prev => ({ ...prev, [layerId]: data.features }));
            markLayerLoaded(layerId);
          } catch (e) {
            console.error('Error loading layer data', e);
            markLayerFailed(layerId);
          }
        } else {
          markLayerLoaded(layerId);
        }
      } else {
        markLayerLoaded(layerId);
      }
    });
  }, [activeLayers, loadedData, markLayerLoaded, markLayerFailed, setLoadState]);

  // 2. Compute Live Engines
  const { zones, nodes, routes } = useMemo(() => {
    const z: any[] = [];
    const n: any[] = [];
    const r: any[] = [];

    Object.entries(loadedData).forEach(([id, features]) => {
      if (id.includes('zonas')) z.push(...features);
      else if (id.includes('nodo') || id.includes('evidencia')) n.push(...features);
      else if (id.includes('trayecto')) r.push(...features);
    });

    return { zones: z, nodes: n, routes: r };
  }, [loadedData]);

  useEffect(() => {
    if (zones.length > 0) {
      const metrics = buildLiveZoneMetrics(zones, localSubmissions, nodes, routes);
      setLiveMetrics(metrics);
    }
    if (nodes.length > 0) {
      const network = buildNodeNetwork(nodes, zones, routes);
      setNodeNetwork(network);
    }
    
    // Update diagnostic stats
    updateDataStats({
      zones: zones.length,
      nodes: nodes.length,
      routes: routes.length + computedRoutes.length,
      mobility: routes.length * 10 // rough estimate of particles
    });
  }, [zones, nodes, routes, localSubmissions, computedRoutes, setLiveMetrics, setNodeNetwork, updateDataStats]);

  // 3. Render DeckGL Layers
  const isSelected = (id: string) => id === selectedFeatureId;
  const isHovered = (id: string) => id === hoveredFeatureId;

  const deckLayers = useMemo(() => {
    const layers: any[] = [];
    const { liveMetrics, nodeNetwork } = useMapStore.getState();

    // Zonas
    activeLayers.filter(id => id.includes('zonas')).forEach(id => {
      if (loadedData[id]) {
        layers.push(...createZonePriorityLayer({
          id,
          data: loadedData[id],
          visible: true,
          liveMetrics,
          debugMode,
          isSelected,
          isHovered,
          setHoveredFeature
        }));
      }
    });

    // Rutas dinámicas
    if (computedRoutes.length > 0) {
      layers.push(...createComputedRoutesLayer({
        id: 'computed-routes-layer',
        routes: computedRoutes,
        visible: true,
        debugMode
      }));
    }

    // Nodos
    activeLayers.filter(id => id.includes('nodo') || id.includes('evidencia')).forEach(id => {
      if (loadedData[id]) {
        layers.push(...createNodeConstellationLayer({
          id,
          data: loadedData[id],
          visible: true,
          time,
          debugMode,
          isSelected,
          isHovered,
          setHoveredFeature
        }));
      }
    });

    // Conexiones de Nodos (solo si hay nodos renderizados)
    if (nodeNetwork.length > 0) {
      layers.push(...createNodeNetworkLayer({
        id: 'node-network-layer',
        connections: nodeNetwork,
        nodes,
        visible: true,
        isSelected
      }));
    }

    // Flujos de movilidad
    activeLayers.filter(id => id.includes('trayecto')).forEach(id => {
      if (loadedData[id]) {
        layers.push(...createMobilityFlowLayer({
          id: `${id}-flow`,
          data: loadedData[id],
          visible: true,
          time
        }));
      }
    });

    return layers;
  }, [activeLayers, loadedData, time, debugMode, selectedFeatureId, hoveredFeatureId, computedRoutes, nodes]);

  return deckLayers;
}
