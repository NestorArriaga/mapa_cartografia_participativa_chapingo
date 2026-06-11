 
import { create } from 'zustand';
import { MapViewState } from '@deck.gl/core';
export type LiveZoneMetrics = any;
export type NodeConnection = any;
export type ComputedRoute = any;


export type ToolMode = 'none' | 'add_point' | 'draw_route' | 'draw_zone' | 'measure_distance' | 'calculate_route' | 'radial_menu';

export interface MapDataStats {
  zones: number;
  nodes: number;
  routes: number;
  mobility: number;
}

interface MapState {
  viewState: MapViewState;
  activeLayers: string[];
  
  // UX / Visual Flags
  showHalos: boolean;
  showConnectors: boolean;
  showLabels: boolean;
  debugMode: boolean; // Rayos X
  
  // Tool Modes
  activeTool: ToolMode;
  tempGeometry: any; // Used during drawing
  
  // Selections
  selectedFeatureId: string | null;
  hoveredFeatureId: string | null;
  
  // Computational Live Results
  liveMetrics: Record<string, LiveZoneMetrics>;
  nodeNetwork: NodeConnection[];
  computedRoutes: ComputedRoute[];
  localSubmissions: any[];

  // Diagnostic Stats
  mapDataStats: MapDataStats;
  
  // System State
  mode: 'academic_internal' | 'public_safe';
  loadState: 'idle' | 'loading' | 'loaded';
  loadedLayerIds: string[];

  routeProfile: "directa" | "balanceada" | "menor_exposicion" | null;
  
  // Actions
  setMode: (mode: 'academic_internal' | 'public_safe') => void;
  setViewState: (viewState: MapViewState) => void;
  setLayers: (layers: string[]) => void;
  toggleLayer: (layerId: string) => void;
  toggleHalos: () => void;
  toggleConnectors: () => void;
  toggleLabels: () => void;
  toggleDebugMode: () => void;
  
  setActiveTool: (tool: ToolMode) => void;
  setTempGeometry: (geom: any) => void;
  
  selectFeature: (id: string | null) => void;
  setHoveredFeature: (id: string | null) => void;
  
  setLiveMetrics: (metrics: Record<string, LiveZoneMetrics>) => void;
  setNodeNetwork: (network: NodeConnection[]) => void;
  addComputedRoute: (route: ComputedRoute) => void;
  addLocalSubmission: (sub: any) => void;
  
  updateDataStats: (stats: Partial<MapDataStats>) => void;

  setLoadState: (state: 'idle' | 'loading' | 'loaded') => void;
  markLayerLoaded: (id: string) => void;
  markLayerFailed: (id: string) => void;

  // Legacy fields to prevent TS errors in old components
  baseMapMode?: any;
  contributionMode?: any;
  presentationMode?: any;
  failedLayerIds?: string[];
  setBaseMapMode?: (m: any) => void;
  setContributionMode?: (m: any) => void;
  clearSelection?: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  viewState: {
    longitude: -98.8816,
    latitude: 19.4950,
    zoom: 14.5,
    pitch: 45,
    bearing: 0,
    transitionDuration: 0
  },
  activeLayers: [
    'zonas_prioridad_integrada_o_indicadores',
    'nodos_orientacion_base'
  ],
  
  showHalos: true,
  showConnectors: true,
  showLabels: true,
  debugMode: false,
  
  activeTool: 'none',
  tempGeometry: null,
  
  selectedFeatureId: null,
  hoveredFeatureId: null,

  liveMetrics: {},
  nodeNetwork: [],
  computedRoutes: [],
  localSubmissions: [],

  mapDataStats: { zones: 0, nodes: 0, routes: 0, mobility: 0 },

  mode: 'public_safe',
  loadState: 'idle',
  loadedLayerIds: [],
  routeProfile: "balanceada",

  setMode: (mode) => set({ mode }),
  setViewState: (viewState) => set({ viewState }),
  setLayers: (layers) => set({ activeLayers: layers }),
  toggleLayer: (layerId) => 
    set((state) => ({
      activeLayers: state.activeLayers.includes(layerId)
        ? state.activeLayers.filter((id) => id !== layerId)
        : [...state.activeLayers, layerId],
    })),
  toggleHalos: () => set(state => ({ showHalos: !state.showHalos })),
  toggleConnectors: () => set(state => ({ showConnectors: !state.showConnectors })),
  toggleLabels: () => set(state => ({ showLabels: !state.showLabels })),
  toggleDebugMode: () => set(state => ({ debugMode: !state.debugMode })),
  
  setActiveTool: (activeTool) => set({ activeTool, tempGeometry: null }),
  setTempGeometry: (tempGeometry) => set({ tempGeometry }),

  selectFeature: (id) => set({ selectedFeatureId: id }),
  setHoveredFeature: (id) => set({ hoveredFeatureId: id }),
  
  setLiveMetrics: (metrics) => set({ liveMetrics: metrics }),
  setNodeNetwork: (network) => set({ nodeNetwork: network }),
  addComputedRoute: (route) => set(state => ({ computedRoutes: [...state.computedRoutes, route] })),
  addLocalSubmission: (sub) => set(state => ({ localSubmissions: [...state.localSubmissions, sub] })),

  updateDataStats: (stats) => set(state => ({ mapDataStats: { ...state.mapDataStats, ...stats } })),

  setLoadState: (state) => set({ loadState: state }),
  markLayerLoaded: (id) => {
    const { activeLayers, loadedLayerIds, loadState } = get();
    if (!loadedLayerIds.includes(id)) {
      const newLoaded = [...loadedLayerIds, id];
      set({ loadedLayerIds: newLoaded });
      
      const allLoaded = activeLayers.every(lId => newLoaded.includes(lId));
      if (allLoaded && loadState !== 'loaded') {
        set({ loadState: 'loaded' });
      }
    }
  },
  markLayerFailed: (id) => {
    const { activeLayers, loadedLayerIds, loadState } = get();
    if (!loadedLayerIds.includes(id)) {
      const newLoaded = [...loadedLayerIds, id];
      set({ loadedLayerIds: newLoaded });
      
      const allLoaded = activeLayers.every(lId => newLoaded.includes(lId));
      if (allLoaded && loadState !== 'loaded') {
        set({ loadState: 'loaded' });
      }
    }
  },
  
  // Legacy
  baseMapMode: 'satellite',
  contributionMode: 'none',
  presentationMode: 'explore',
  failedLayerIds: [],
  setBaseMapMode: () => {},
  setContributionMode: () => {},
  clearSelection: () => set({ selectedFeatureId: null, hoveredFeatureId: null })
}));
