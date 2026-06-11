import { useState, useEffect } from 'react';

export function useMapAnimation(enabled: boolean = true) {
  const [time, setTime] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion) {
      // Provide a static non-zero time to avoid rendering issues with 0
      setTime(100);
      return;
    }

    let animationFrame: number;
    const start = performance.now();

    const animate = (t: number) => {
      // Loop time between 0 and 10000ms
      setTime((t - start) % 10000);
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [enabled, reducedMotion]);

  return { time, reducedMotion };
}
