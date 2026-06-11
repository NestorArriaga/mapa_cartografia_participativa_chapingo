 
import { create } from "zustand";

export type DataMode = "public_safe" | "academic_internal";

export type DataModeState = {
  mode: DataMode;
  showProtectedAggregates: boolean;
  showReviewAggregates: boolean;
  showAcademicTables: boolean;
  setMode: (mode: DataMode) => void;
  toggleProtectedAggregates: () => void;
  toggleReviewAggregates: () => void;
  toggleAcademicTables: () => void;
};

export const useDataModeStore = create<DataModeState>((set) => ({
  mode: "public_safe",
  showProtectedAggregates: false,
  showReviewAggregates: false,
  showAcademicTables: false,

  setMode: (mode) => set({
    mode,
    showProtectedAggregates: mode === "academic_internal",
    showReviewAggregates: mode === "academic_internal",
    showAcademicTables: mode === "academic_internal",
  }),

  toggleProtectedAggregates: () => set((state) => ({ showProtectedAggregates: !state.showProtectedAggregates })),
  toggleReviewAggregates: () => set((state) => ({ showReviewAggregates: !state.showReviewAggregates })),
  toggleAcademicTables: () => set((state) => ({ showAcademicTables: !state.showAcademicTables })),
}));
