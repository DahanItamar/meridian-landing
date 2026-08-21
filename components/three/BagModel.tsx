"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";
import { BagMesh } from "./BagMesh";
import { damp, scrollState, track } from "@/lib/scroll-store";

/**
 * The sequence, as [scrollProgress, value] pairs.
 *
 * Five beats. Each holds its pose for a stretch so the eye can rest on it, then
 * moves — a pack that drifts continuously reads as decoration, whereas one that
 * arrives, settles, and is inspected reads as a product.
 *
 *   0.00 – 0.14  intro      pack to the inline start, steeply tilted
 *   0.16 – 0.34  survey     centres, completes one full turn
 *   0.36 – 0.54  inspect    pushes toward camera, label filling the frame
 *   0.56 – 0.76  reverse    crosses to the inline end, half turn to the back
 *   0.78 – 1.00  settle     drops back and small, alongside the specs
 */
const KEYS = {
  rotationY: [
    [0.0, -0.5],
    [0.14, -0.5],
    [0.34, Math.PI * 2 - 0.5],
    [0.36, Math.PI * 2 - 0.5],
    // Squares up to the camera so the label is read flat, not at an angle.
    [0.46, Math.PI * 2],
    [0.56, Math.PI * 2],
    [0.76, Math.PI * 3],
    [1.0, Math.PI * 3 + 0.4],
  ],
  positionX: [
    [0.0, -1.62],
    [0.14, -1.62],
    [0.3, 0],
    [0.46, 0.12],
    [0.56, 0],
    [0.76, 1.9],
    [0.88, 1.9],
    [1.0, 1.5],
  ],
  positionY: [
    [0.0, 0.06],
    [0.36, 0],
    [0.46, -0.18],
    [0.56, 0],
    [0.86, 0],
    [1.0, -0.7],
  ],
  positionZ: [
    [0.0, 0],
    [0.3, 0.4],
    [0.56, 0],
    [0.76, 0],
    [1.0, -0.8],
  ],
  tiltX: [
    [0.0, 0.32],
    [0.3, 0.09],
    [0.46, 0.02],
    [0.76, 0.1],
    [1.0, 0.16],
  ],
  tiltZ: [
    [0.0, -0.24],
    [0.3, -0.05],
    [0.46, 0],
    [1.0, -0.12],
  ],
  scale: [
    [0.0, 1],
    [0.3, 1.02],
    [0.46, 1.42],
    [0.56, 1.02],
    [0.86, 0.94],
    [1.0, 0.7],
  ],
} satisfies Record<string, [number, number][]>;

/**
 * Dollying the camera rather than only scaling the pack: pushing in shortens the
 * apparent depth of the gusset the way a real lens does, which is what makes the
 * inspect beat feel like moving closer instead of like a zoom.
 */
const CAMERA = {
  z: [
    [0.0, 6.5],
    [0.3, 6.0],
    [0.46, 4.5],
    [0.56, 6.0],
    [0.86, 6.4],
    [1.0, 7.1],
  ],
  y: [
    [0.0, 0.15],
    [0.46, 0.05],
    [1.0, 0.3],
  ],
} satisfies Record<string, [number, number][]>;

export function BagModel({ reducedMotion }: { reducedMotion: boolean }) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const settled = useRef(false);
  const camera = useThree((s) => s.camera);

  useFrame((_, delta) => {
    if (!outer.current || !inner.current) return;
    const p = scrollState.progress;
    const dt = Math.min(delta, 0.05); // a backgrounded tab must not lurch on return

    const o = outer.current;
    const i = inner.current;

    // The first frame is assigned, not damped. Easing from the origin would show
    // the pack flying in from the centre of the scene every time the model
    // finishes loading, which reads as a bug rather than an entrance.
    //
    // Assigned directly rather than by passing an infinite damping constant:
    // delta is 0 on that first frame, and -Infinity * 0 is NaN, which silently
    // propagates into every transform and makes the model disappear entirely.
    if (!settled.current) {
      settled.current = true;
      o.position.set(track(p, KEYS.positionX), track(p, KEYS.positionY), track(p, KEYS.positionZ));
      o.scale.setScalar(track(p, KEYS.scale));
      i.rotation.set(track(p, KEYS.tiltX), track(p, KEYS.rotationY), track(p, KEYS.tiltZ));
      camera.position.set(0, track(p, CAMERA.y), track(p, CAMERA.z));
      return;
    }

    const lambda = reducedMotion ? 24 : 7;

    o.position.x = damp(o.position.x, track(p, KEYS.positionX), lambda, dt);
    o.position.y = damp(o.position.y, track(p, KEYS.positionY), lambda, dt);
    o.position.z = damp(o.position.z, track(p, KEYS.positionZ), lambda, dt);
    o.scale.setScalar(damp(o.scale.x, track(p, KEYS.scale), lambda, dt));

    i.rotation.y = damp(i.rotation.y, track(p, KEYS.rotationY), lambda, dt);
    i.rotation.x = damp(i.rotation.x, track(p, KEYS.tiltX), lambda, dt);
    i.rotation.z = damp(i.rotation.z, track(p, KEYS.tiltZ), lambda, dt);

    /**
     * The dolly lives in this loop rather than a sibling component. A second
     * useFrame driving the camera stopped the pack rendering altogether while
     * every other object kept drawing — and position only, never lookAt: a
     * camera on the +Z axis already faces the origin, and calling lookAt each
     * frame fights whatever r3f does to the camera matrix.
     */
    camera.position.z = damp(camera.position.z, track(p, CAMERA.z), 5, dt);
    camera.position.y = damp(camera.position.y, track(p, CAMERA.y), 5, dt);
  });

  const body = (
    <group ref={inner}>
      <BagMesh />
    </group>
  );

  return (
    <group ref={outer}>
      {/* AC-015: the idle breathing is decorative, so it does not run for
          someone who has asked the OS for less motion. Scroll-linked movement
          stays, because that one is the user driving it. */}
      {reducedMotion ? (
        body
      ) : (
        <Float
          speed={1.05}
          rotationIntensity={0.14}
          floatIntensity={0.5}
          floatingRange={[-0.06, 0.06]}
        >
          {body}
        </Float>
      )}
    </group>
  );
}
