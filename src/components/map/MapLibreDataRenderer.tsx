import React, { useEffect, useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { useDataModeStore } from '../../stores/dataModeStore';
import { useMapStore } from '../../stores/mapStore';
import { addMapVivoSources } from './maplibre/addMapVivoSources';
import { addMapVivoLayers, updateLayerVisibility } from './maplibre/addMapVivoLayers';
import { MapVivoAcademicDataset } from '../../data/mapVivoAcademicDataset.generated';

export const MapLibreDataRenderer: React.FC = () => {
  const { current: map } = useMap();
  const { mode } = useDataModeStore();
  const { debugMode, selectFeature } = useMapStore();
  const [dataset, setDataset] = useState<MapVivoAcademicDataset | null>(null);

  useEffect(() => {
    // Fetch master dataset
    fetch('/data/mapvivo.academic.dataset.json')
      .then(res => res.json())
      .then(data => setDataset(data))
      .catch(err => console.error("Error loading master academic dataset:", err));
  }, []);

  useEffect(() => {
    if (!map || !dataset) return;

    // Await map style loaded
    const injectMapLibreData = () => {
      addMapVivoSources(map.getMap(), dataset);
      addMapVivoLayers(map.getMap());
      updateLayerVisibility(map.getMap(), debugMode, mode === 'academic_research');
    };

    if (map.getMap().isStyleLoaded()) {
      injectMapLibreData();
    } else {
      map.getMap().once('styledata', injectMapLibreData);
    }
  }, [map, dataset]);

  useEffect(() => {
    if (!map || !map.getMap().isStyleLoaded()) return;
    updateLayerVisibility(map.getMap(), debugMode, mode === 'academic_research');
  }, [map, debugMode, mode]);

  useEffect(() => {
    if (!map) return;
    const m = map.getMap();
    
    const clickHandler = (e: any) => {
      const features = m.queryRenderedFeatures(e.point, {
        layers: ['zones-fill', 'nodes-documentary-core', 'nodes-orientation-core']
      });
      if (features.length > 0) {
        selectFeature(features[0].properties.id || features[0].properties.id_zona || features[0].id?.toString());
      } else {
        selectFeature(null);
      }
    };

    m.on('click', clickHandler);
    
    // Pointer cursors
    const enterHandler = () => m.getCanvas().style.cursor = 'pointer';
    const leaveHandler = () => m.getCanvas().style.cursor = '';
    
    m.on('mouseenter', 'zones-fill', enterHandler);
    m.on('mouseleave', 'zones-fill', leaveHandler);
    m.on('mouseenter', 'nodes-documentary-core', enterHandler);
    m.on('mouseleave', 'nodes-documentary-core', leaveHandler);

    return () => {
      m.off('click', clickHandler);
      m.off('mouseenter', 'zones-fill', enterHandler);
      m.off('mouseleave', 'zones-fill', leaveHandler);
      m.off('mouseenter', 'nodes-documentary-core', enterHandler);
      m.off('mouseleave', 'nodes-documentary-core', leaveHandler);
    };
  }, [map, selectFeature]);

  return null; // Purely logical rendering component
};
