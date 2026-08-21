/**
 * A single mutable number shared between the DOM tree and the WebGL tree.
 *
 * Framer Motion and react-three-fiber are separate React reconcilers, so React
 * context does not cross between them. Passing scroll progress through state
 * would also re-render the Canvas on every scroll frame, which is exactly what
 * useFrame exists to avoid. A plain object read inside useFrame costs nothing
 * and re-renders nothing.
 */
export const scrollState = { progress: 0 };

/** Smoothstep. Eases both ends so keyframes do not start and stop abruptly. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Piecewise keyframe track. `stops` are [progress, value] pairs in ascending
 * order; values are eased between neighbouring stops and clamped outside them.
 */
export function track(p: number, stops: [number, number][]): number {
  if (p <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (p >= last[0]) return last[1];

  for (let i = 0; i < stops.length - 1; i++) {
    const [pa, va] = stops[i];
    const [pb, vb] = stops[i + 1];
    if (p >= pa && p <= pb) return va + (vb - va) * smoothstep(pa, pb, p);
  }
  return last[1];
}

/** Frame-rate independent damping, so motion feels the same at 60 and 144 Hz. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
