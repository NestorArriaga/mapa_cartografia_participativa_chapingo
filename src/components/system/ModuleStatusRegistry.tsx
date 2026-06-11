import { create } from "zustand";

export interface ModuleStatus {
  moduleName: string;
  status: "ok" | "degraded" | "failed";
  lastError?: string;
}

interface ModuleRegistryState {
  modules: Record<string, ModuleStatus>;
  registerError: (moduleName: string, error: string) => void;
  clearError: (moduleName: string) => void;
}

export const useModuleRegistry = create<ModuleRegistryState>((set) => ({
  modules: {},
  registerError: (moduleName, error) => set((state) => ({
    modules: {
      ...state.modules,
      [moduleName]: {
        moduleName,
        status: "failed",
        lastError: error
      }
    }
  })),
  clearError: (moduleName) => set((state) => {
    const next = { ...state.modules };
    delete next[moduleName];
    return { modules: next };
  })
}));
