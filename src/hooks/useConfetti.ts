import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * Champion celebration. Fires a layered confetti burst + a couple of side
 * cannons, then a gentle continuous drizzle for a moment. Respects
 * `prefers-reduced-motion` and cleans up its own canvas/timers.
 */
export function useConfetti() {
  const timers = useRef<number[]>([]);

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const celebrate = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const gold = ['#f5c542', '#ffe9a8', '#d4a017', '#ffffff'];

    // Center burst.
    confetti({ particleCount: 140, spread: 80, startVelocity: 55, origin: { y: 0.6 }, colors: gold, zIndex: 100 });

    // Side cannons, slightly delayed.
    timers.current.push(
      window.setTimeout(() => {
        confetti({ particleCount: 70, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: gold, zIndex: 100 });
        confetti({ particleCount: 70, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: gold, zIndex: 100 });
      }, 180),
    );

    // Short golden drizzle.
    const end = Date.now() + 1400;
    const drizzle = () => {
      confetti({ particleCount: 4, angle: 90, spread: 120, startVelocity: 28, origin: { x: Math.random(), y: -0.1 }, colors: gold, gravity: 0.9, zIndex: 100 });
      if (Date.now() < end) timers.current.push(window.setTimeout(drizzle, 120));
    };
    timers.current.push(window.setTimeout(drizzle, 350));
  }, []);

  useEffect(() => clear, [clear]);

  return celebrate;
}
