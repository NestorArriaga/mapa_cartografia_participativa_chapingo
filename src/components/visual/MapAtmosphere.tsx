import React from 'react';
import { useMapStore } from '../../stores/mapStore';

export const MapAtmosphere: React.FC = () => {
  const baseMapMode = useMapStore(s => s.baseMapMode);

  return (
    <>
      {baseMapMode === 'satellite' && (
        <>
          <div className="satellite-cinema-overlay pointer-events-none" />
          <div className="satellite-data-glow pointer-events-none" />
          <div className="map-vignette pointer-events-none" />
          <div className="noise-overlay pointer-events-none opacity-20 mix-blend-overlay" />
        </>
      )}

      {baseMapMode === 'night' && (
        <>
          <div className="map-vignette pointer-events-none opacity-60" />
          <div className="noise-overlay pointer-events-none opacity-10 mix-blend-overlay" />
        </>
      )}

      {/* Grid Overlay can go here if needed, but keeping it minimal for now to not clash with Light mode */}
    </>
  );
};
