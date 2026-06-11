export function getPerformanceMode(): 'high' | 'reduced' {
  // Check if user prefers reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduced';
  }
  
  // Check hardware concurrency/memory if available
  const nav = navigator as any;
  if (nav.deviceMemory && nav.deviceMemory < 4) {
    return 'reduced';
  }
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) {
    return 'reduced';
  }

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    return 'reduced';
  }

  return 'high';
}

export const performanceConfig = {
  get showHalos() {
    return getPerformanceMode() === 'high';
  },
  get showParticles() {
    return false; // Disabled completely for data maps to avoid visual clutter
  },
  get enableSmoothTransitions() {
    return getPerformanceMode() === 'high';
  }
};
