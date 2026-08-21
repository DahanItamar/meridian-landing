/**
 * A single mutable number shared between the DOM tree and the WebGL tree.
 *
 * react-three-fiber is a separate React reconciler, so context does not cross
 * between it and the page. Passing scroll progress through state would also
 * re-render the Canvas on every scroll frame, which is exactly what useFrame
 * exists to avoid. A plain object read inside useFrame costs nothing and
 * re-renders nothing.
 *
 * `visible` is written by the pinned section's IntersectionObserver. The stage
 * reads it to skip drawing entirely once the sequence has scrolled past —
 * a WebGL loop that keeps running behind three screens of text is a laptop fan
 * for no picture.
 */
export const scrollState = { progress: 0, visible: true };
