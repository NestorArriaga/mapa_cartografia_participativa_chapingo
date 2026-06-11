 
import { create } from 'zustand';

export interface SelectionState {
  selectedFeature: any | null;
  selectedLayerId: string | null;
  selectedKind: "zone" | "node" | "route" | "connector" | null;
  
  hoveredFeature: any | null;
  hoveredLayerId: string | null;

  setSelection: (feature: any, layerId: string, kind: "zone" | "node" | "route" | "connector") => void;
  clearSelection: () => void;
  
  setHovered: (feature: any | null, layerId: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedFeature: null,
  selectedLayerId: null,
  selectedKind: null,
  hoveredFeature: null,
  hoveredLayerId: null,

  setSelection: (feature, layerId, kind) => set({
    selectedFeature: feature,
    selectedLayerId: layerId,
    selectedKind: kind
  }),

  clearSelection: () => set({
    selectedFeature: null,
    selectedLayerId: null,
    selectedKind: null
  }),

  setHovered: (feature, layerId) => set({
    hoveredFeature: feature,
    hoveredLayerId: layerId
  })
}));
