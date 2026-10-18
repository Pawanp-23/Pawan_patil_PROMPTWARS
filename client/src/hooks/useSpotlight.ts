import { useEffect } from 'react';

/**
 * Lets the pointer act as a flashlight: it writes the pointer position to the
 * --spot-x / --spot-y CSS variables, which the page's light layer follows.
 * Skipped on touch screens and for people who prefer reduced motion.
 */
export function useSpotlight(): void {
  useEffect(() => {
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;

    const root = document.documentElement;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      root.style.setProperty('--spot-x', `${x}px`);
      root.style.setProperty('--spot-y', `${y}px`);
    };
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      root.classList.add('has-spotlight');
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => root.classList.remove('has-spotlight');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove('has-spotlight');
    };
  }, []);
}
