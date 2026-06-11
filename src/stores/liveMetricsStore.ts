 
import { create } from "zustand";
import { getRecommendationsForFeature as fetchRecommendations } from "../services/recommendationEngine";

export type LiveMetricsState = {
  zoneMetrics: Record<string, any>;
  localSubmissions: any[];
  computedRoutes: any[];
  nodeConnections: any[];
  selectedFeatureMetrics: any | null;

  refreshMetrics: () => void;
  addSubmission: (submission: any) => void;
  addComputedRoute: (route: any) => void;
  getZoneMetrics: (zoneId: string) => any;
  getRecommendationsForFeature: (feature: any) => any[];
  setSelectedFeatureMetrics: (metrics: any) => void;
};

export const useLiveMetricsStore = create<LiveMetricsState>((set, get) => ({
  zoneMetrics: {},
  localSubmissions: [],
  computedRoutes: [],
  nodeConnections: [],
  selectedFeatureMetrics: null,

  refreshMetrics: () => {
    // Triggers recalculation cascade. For now, we update a timestamp or increment a counter
    set((state) => ({
      zoneMetrics: { ...state.zoneMetrics, _lastRefreshed: Date.now() }
    }));
  },

  addSubmission: (submission) => {
    set((state) => ({
      localSubmissions: [...state.localSubmissions, submission]
    }));
    get().refreshMetrics();
  },

  addComputedRoute: (route) => {
    set((state) => ({
      computedRoutes: [...state.computedRoutes, route]
    }));
    get().refreshMetrics();
  },

  getZoneMetrics: (zoneId) => {
    const metrics = get().zoneMetrics[zoneId];
    if (metrics) return metrics;
    // Fallback default
    return {
      n_obs: 0,
      incidentes_n: 0,
      estructural_n: 0,
      recursos_n: 0,
      sensibles_n: 0,
      score_integrado: 0.1,
      prioridad: "baja"
    };
  },

  getRecommendationsForFeature: (feature) => {
    return fetchRecommendations(feature);
  },

  setSelectedFeatureMetrics: (metrics) => {
    set({ selectedFeatureMetrics: metrics });
  }
}));
