export type LayerPublicStatus =
  | "PUBLIC_CORE"
  | "PUBLIC_NODES"
  | "PUBLIC_MOBILITY_CONTEXT"
  | "REVISION_CONTROLLED"
  | "SENSITIVE_NO_PUBLIC"
  | "DOCUMENTATION"
  | "STYLE_ONLY";

export type WebLayerRegistryItem = {
  id: string;
  name: string;
  fileName?: string;
  sourcePath?: string;
  publicPath?: string;
  sourceFolder?: string;
  group: string;
  geometryType: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon" | "Table" | "Unknown";
  publicStatus?: LayerPublicStatus;
  canShowOnPublicMap: boolean;
  canUseInAdminPanel?: boolean;
  canUseForPopup?: boolean;
  canUseForMetrics?: boolean;
  visibleDefault: boolean;
  loadStrategy?: 'immediate' | 'disabled_too_large' | 'lazy';
  ethicalRule?: string;
  description: string;
};
