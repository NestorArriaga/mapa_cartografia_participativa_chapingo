import React from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../../stores/mapStore';
import { MapLibreDataRenderer } from './MapLibreDataRenderer';

export const MapView: React.FC = () => {
  const { loadState } = useMapStore();

  return (
    <div className="absolute inset-0 z-0 bg-[#030712]" data-testid="map-root">
      <Map
        initialViewState={{
          longitude: -98.8816,
          latitude: 19.4950,
          zoom: 14.5,
          pitch: 45,
          bearing: -17.6
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactive={loadState !== 'loading'}
      >
        <MapLibreDataRenderer />
      </Map>
    </div>
  );
};
