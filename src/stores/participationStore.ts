 
import { create } from 'zustand';

interface ParticipationState {
  activeHaloZone: string | null;
  setActiveHaloZone: (zoneId: string | null) => void;
  triggerHalo: (zoneId: string) => void;
}

export const useParticipationStore = create<ParticipationState>((set) => ({
  activeHaloZone: null,
  setActiveHaloZone: (zoneId) => set({ activeHaloZone: zoneId }),
  triggerHalo: (zoneId) => {
    set({ activeHaloZone: zoneId });
    setTimeout(() => {
      set((state) => state.activeHaloZone === zoneId ? { activeHaloZone: null } : state);
    }, 4000); // 4 seconds halo effect
  }
}));
