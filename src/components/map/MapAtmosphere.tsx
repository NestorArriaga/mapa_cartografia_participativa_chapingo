import React from 'react';

export const MapAtmosphere: React.FC = () => {
  return (
    <>
      <div className="map-atmosphere z-0" />
      <div className="noise-overlay z-[1]" />
      <div className="absolute inset-0 pointer-events-none soft-grid z-[2]" />
    </>
  );
};
