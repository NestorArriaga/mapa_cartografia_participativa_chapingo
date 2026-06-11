// Generated automatically by scripts/build-mapvivo-academic-dataset.ts
export type MapVivoAcademicDataset = {
  generatedAt: string;
  bbox: [number, number, number, number];
  center: [number, number];
  publicLayers: {
    zones: GeoJSON.FeatureCollection;
    evidencePolygons: GeoJSON.FeatureCollection;
    documentaryNodes: GeoJSON.FeatureCollection;
    orientationNodes: GeoJSON.FeatureCollection;
    mobilityLines: GeoJSON.FeatureCollection;
    connectors: GeoJSON.FeatureCollection;
    readingRoutes: GeoJSON.FeatureCollection;
    campusRoutes: GeoJSON.FeatureCollection;
    nodeNetwork: GeoJSON.FeatureCollection;
  };
  academicSignals: {
    protectedAggregatesByZone: GeoJSON.FeatureCollection;
    qualitativeSignalsByZone: GeoJSON.FeatureCollection;
    reviewAggregatesByZone: GeoJSON.FeatureCollection;
    validationPending: any[];
    resources: any[];
    legalFramework: any[];
    contextStats: any[];
  };
  stats: {
    zones: number;
    nodes: number;
    documentaryNodes: number;
    orientationNodes: number;
    mobilitySegments: number;
    connectors: number;
    readingRoutes: number;
    campusRoutes: number;
    nodeConnections: number;
    qualitativeSignals: number;
    protectedSignals: number;
    reviewItems: number;
    evidenceItems: number;
  };
};
