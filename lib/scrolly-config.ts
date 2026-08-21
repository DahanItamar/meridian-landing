/**
 * The scroll script for the pack. This file IS the choreography — every camera
 * move, zoom and rotation on the page is one row in the table below, and every
 * timing number the pinned section uses is in this file rather than in a
 * component.
 *
 * FRAMING BY CAMERA, NOT BY SLIDING THE MODEL. `target` is the point the camera
 * looks at; aiming it to the pack's right (target.x > 0) puts the pack on the
 * LEFT of frame and gives the move real perspective, the way a dolly does.
 * The page is RTL, so beats 1 and 3 (copy on the right) want the pack left, and
 * beats 2 and 4 (copy on the left) want it right. Nothing overlaps by
 * construction: the camera vacates the half the type occupies.
 *
 * THE PACK'S ANATOMY, which is what the rotations are aiming at:
 *   rotY 0      front face — gold roundel, MERIDIAN SPECIALTY label band, 1 KG,
 *               and the window of roasted beans at the bottom
 *   rotY ±0.6   three-quarter — front plus the gusset, the label band catching
 *               the key light
 *   rotY π      back face — the brand copy, "Origin: Colombia & Ethiopia",
 *               and the barcode below it. THE TURN ENDS HERE and the last beat
 *               holds this pose; see the note on beat 4 below
 *
 * `rotY` never decreases: the pack turns one way through the page and then
 * stops, so no beat reverses direction or takes the long way round.
 *
 * `at` is scroll progress over the sticky container. The rows sit at each
 * beat's HOLD (the middle of its quarter), so every move happens across a
 * boundary while the copy is fading — never under settled text.
 *
 * `light` is the key light's x. It travels with the move so the highlight stays
 * on whichever panel is facing the camera; it is scripted, not oscillating.
 */

/** How tall the pinned section is. Three beats need room to hold and to move. */
export const SCROLLY_HEIGHT_VH = 350;

/**
 * The three scroll segments. Each owns a third of the sticky section's scroll
 * and a third of the pack's rotation, so copy and geometry cannot desync.
 *
 * `align: "end"` puts the copy at the inline end — which in RTL is the left —
 * so the beats alternate sides as the pack crosses the frame.
 *
 * There used to be a fourth, "settle", carrying the launch copy and a buy
 * button. It was cut: the waitlist section below says the same thing with a
 * real form under it, and the beat only existed to give the pack somewhere to
 * finish turning — which it no longer does.
 */
export const SCROLLY_STEPS = [
  { id: "front", at: [0, 0.34], align: "start" },
  { id: "side", at: [0.34, 0.67], align: "end" },
  { id: "back", at: [0.67, 1], align: "start" },
] as const satisfies readonly {
  id: string;
  at: readonly [number, number];
  align: "start" | "end";
}[];

export interface Keyframe {
  at: number;
  cam: [number, number, number];
  target: [number, number, number];
  fov: number;
  rotY: number;
  rotX: number;
  light: number;
}

export const KEYFRAMES: Keyframe[] = [
  // ── Beat 1 · Hero ─────────────────────────────────────────────────────────
  // Front face, slightly off-centre and large: the pack owns the opening, but
  // leaves the inline-start half clear so the headline is readable from the
  // very first frame rather than arriving after a scroll.
  { at: 0.0, cam: [0.1, 0.02, 3.34], target: [0.26, 0.0, 0], fov: 31, rotY: 0.0, rotX: 0.015, light: -1.9 },
  // Then it pans and scales down to frame-left as the headline enters right.
  { at: 0.18, cam: [0.1, 0.04, 3.95], target: [0.62, 0.02, 0], fov: 29, rotY: 0.12, rotX: 0.015, light: -1.7 },

  // ── Beat 2 · Flavour profile ──────────────────────────────────────────────
  // Turns to three-quarter and pushes in on the label band and the bean
  // window; pack crosses to frame-right, copy takes the left.
  { at: 0.5, cam: [-0.34, 0.09, 3.16], target: [-0.42, 0.02, 0], fov: 22, rotY: 0.62, rotX: -0.03, light: -0.7 },

  // ── Beat 3 · Origin & transparency ────────────────────────────────────────
  // Continues round to the BACK face, flat on, tight on the origin line and
  // the brand copy — the panel the beat is talking about.
  { at: 0.83, cam: [0.22, -0.02, 3.62], target: [0.31, -0.05, 0], fov: 23, rotY: 3.14, rotX: 0.01, light: 1.6 },

  // ── Close ─────────────────────────────────────────────────────────────────
  // The pack STOPS TURNING at the back panel. Continuing round to the front
  // meant passing through the gusset at rotY 3π/2, where a flat-bottom pouch is
  // a dark sliver with almost no print on it.
  //
  // So the last stretch is all dolly and no spin: the camera eases back and
  // widens a little while the pack holds its pose and its side of the frame.
  { at: 1.0, cam: [0.3, -0.02, 3.95], target: [0.42, -0.04, 0], fov: 25, rotY: 3.14, rotX: 0.01, light: 1.6 },
];

/** Smoothstep: zero velocity at both ends, so no keyframe ever snaps. */
function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

function mix(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

export interface Frame {
  cam: [number, number, number];
  target: [number, number, number];
  fov: number;
  rotY: number;
  rotX: number;
  light: number;
}

/**
 * Samples the script at progress t. Pure: the same t always gives the same
 * frame, which is what keeps the motion locked to the scrollbar rather than to
 * a clock.
 *
 * `narrow` means below the 64rem breakpoint, where `.beat` in globals.css
 * stacks the copy over the pack instead of beside it: there is no empty half to
 * move into, so the sideways framing flattens and the camera backs off to keep
 * the pack in frame.
 *
 * The caller decides it from `matchMedia("(min-width: 64rem)")` — the same
 * signal the CSS uses, deliberately. It was the camera's aspect ratio once, and
 * a 1024x900 window then got the wide copy layout with the narrow framing,
 * which put the headline on top of the pack.
 */
export function sample(t: number, narrow = false): Frame {
  const k = Math.max(0, Math.min(1, t));
  let i = 0;
  while (i < KEYFRAMES.length - 2 && k > KEYFRAMES[i + 1].at) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const span = b.at - a.at;
  const f = ease(span <= 0 ? 0 : Math.max(0, Math.min(1, (k - a.at) / span)));

  const lateral = narrow ? 0.1 : 1;
  const pull = narrow ? 1.36 : 1;
  // Portrait has no vacated half to put copy in, so the split is vertical
  // instead: aiming the camera above the pack drops the pack into the lower
  // frame and leaves the top third to the words. Paired with the `.beat` scrim
  // in globals.css, which anchors the copy up there below lg.
  const lift = narrow ? 0.19 : 0;

  return {
    cam: [
      mix(a.cam[0], b.cam[0], f) * lateral,
      mix(a.cam[1], b.cam[1], f),
      mix(a.cam[2], b.cam[2], f) * pull,
    ],
    target: [
      mix(a.target[0], b.target[0], f) * lateral,
      mix(a.target[1], b.target[1], f) + lift,
      0,
    ],
    fov: mix(a.fov, b.fov, f),
    rotY: mix(a.rotY, b.rotY, f),
    rotX: mix(a.rotX, b.rotX, f),
    light: mix(a.light, b.light, f),
  };
}

/**
 * Trapezoid: 0 at the slice edges, 1 across the middle.
 *
 * The hero beat is visible from the first frame — a landing page whose headline
 * only appears after you scroll has no headline. The last beat holds to the end
 * rather than fading to an empty frame.
 */
export function fadeWindow(index: number, p: number): number {
  const [a, b] = SCROLLY_STEPS[index].at;
  const span = b - a;
  const inn = a + span * 0.22;
  const out = b - span * 0.22;
  const last = SCROLLY_STEPS.length - 1;

  if (p >= b) return index === last ? 1 : 0;
  if (p <= a) return index === 0 ? 1 : 0;
  if (p < inn) return index === 0 ? 1 : (p - a) / (inn - a);
  if (p > out) return index === last ? 1 : (b - p) / (b - out);
  return 1;
}

/** Which beat is holding at progress p. Drives the dots and the stage label. */
export function activeStep(p: number): number {
  const found = SCROLLY_STEPS.findIndex(({ at }) => p >= at[0] && p < at[1]);
  return found === -1 ? SCROLLY_STEPS.length - 1 : found;
}

/**
 * Where the pack sits across the frame, as a percentage — the DOM mirror of the
 * keyframe table above. Same times, same smoothstep, so the warm wash behind the
 * glass and the geometry move together instead of sliding apart.
 */
export function washX(p: number): number {
  const stops: [number, number][] = [
    [0, 50],
    [0.18, 36],
    [0.5, 64],
    [0.83, 36],
    [1, 36],
  ];
  let i = 0;
  while (i < stops.length - 2 && p > stops[i + 1][0]) i++;
  const [a, av] = stops[i];
  const [b, bv] = stops[i + 1];
  const raw = b === a ? 0 : Math.max(0, Math.min(1, (p - a) / (b - a)));
  return av + (bv - av) * ease(raw);
}
