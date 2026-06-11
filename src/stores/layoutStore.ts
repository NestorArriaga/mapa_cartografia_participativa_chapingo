 
import { create } from 'zustand';

export type PanelState = 'expanded' | 'contracted' | 'hidden';

interface LayoutState {
  leftPanelState: PanelState;
  rightPanelState: PanelState;
  focusMode: boolean;
  presentationMode: boolean;
  panelsPinned: boolean;
  showDashboard: boolean;
  
  setLeftPanelState: (state: PanelState) => void;
  setRightPanelState: (state: PanelState) => void;
  setFocusMode: (focus: boolean) => void;
  setPresentationMode: (presentation: boolean) => void;
  setShowDashboard: (show: boolean) => void;
  togglePin: () => void;
  
  // Auto-contraction during map interaction
  notifyMapInteraction: (active: boolean) => void;
}

let idleTimer: any = null;

export const useLayoutStore = create<LayoutState>((set, get) => ({
  leftPanelState: 'contracted',
  rightPanelState: 'hidden',
  focusMode: false,
  presentationMode: false,
  panelsPinned: false,
  showDashboard: false,

  setLeftPanelState: (state) => set({ leftPanelState: state }),
  setRightPanelState: (state) => set({ rightPanelState: state }),
  setFocusMode: (focus) => set({ focusMode: focus }),
  setPresentationMode: (presentation) => set({ presentationMode: presentation }),
  setShowDashboard: (show) => set({ showDashboard: show }),
  togglePin: () => set((state) => ({ panelsPinned: !state.panelsPinned })),

  notifyMapInteraction: (active) => {
    const { panelsPinned, focusMode } = get();
    if (panelsPinned || focusMode) return;

    if (active) {
      if (idleTimer) clearTimeout(idleTimer);
      set({ leftPanelState: 'contracted', rightPanelState: 'contracted' });
    } else {
      // Auto-expand after 900ms idle
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        set({ leftPanelState: 'expanded', rightPanelState: 'expanded' });
      }, 900);
    }
  }
}));
