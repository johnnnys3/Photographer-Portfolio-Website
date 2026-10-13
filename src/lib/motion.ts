/**
 * Shared motion engine: ONE requestAnimationFrame loop for everything custom
 * (kinetic letters, cursor, marquee, counters), plus one pointer store.
 * Callbacks get seconds, so 60Hz and 120Hz displays move at the same speed.
 */
export type Frame = (time: number, dt: number) => void;

const subs = new Set<Frame>();
let raf = 0;
let last = 0;

export const pointer = { x: -9999, y: -9999, active: false };
// The (PAUSE MOTION) toggle flips this; it is remembered across pages and visits.
const storedPause = () => {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('motion-paused') === '1';
  } catch {
    return false;
  }
};
export const motion = { paused: storedPause() };

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canHover = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const smoothstep = (t: number) => t * t * (3 - 2 * t);
/** Frame-rate independent ease toward a target. `lambda` ~ speed (higher = snappier). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.active = false;
  });
}

function tick(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  subs.forEach((f) => f(now / 1000, dt));
  raf = subs.size ? requestAnimationFrame(tick) : 0;
}

/** Subscribe to the shared loop. Returns an unsubscribe function. */
export function subscribe(f: Frame) {
  listen();
  subs.add(f);
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
  return () => {
    subs.delete(f);
  };
}
