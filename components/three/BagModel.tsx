"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import { Box3, Vector3 } from "three";
import { damp, scrollState, track } from "@/lib/scroll-store";

const MODEL = "/models/coffee-bag.glb";

/**
 * Scroll keyframes, as [progress, value] pairs across the scrollytelling
 * section. Kept as data rather than a chain of conditionals so the sequence can
 * be read and retimed in one place.
 */
const KEYS = {
  /**
   * Beat 1 sits three-quarters on. Beat 2 completes a full turn back to the same
   * face. Beat 3 adds a half turn so the reverse of the pack faces the viewer —
   * that is the "reveal", and it is why the value is an odd multiple of PI.
   */
  rotationY: [
    [0.0, -0.45],
    [0.28, -0.45],
    [0.5, Math.PI * 2 - 0.45],
    [0.62, Math.PI * 2 - 0.45],
    [0.8, Math.PI * 3 - 0.45],
    [1.0, Math.PI * 3 - 0.1],
  ],
  positionX: [
    [0.0, -1.55],
    [0.28, -1.55],
    [0.46, 0],
    [0.62, 0],
    [0.8, 1.95],
    [1.0, 1.8],
  ],
  positionY: [
    [0.0, 0.05],
    [0.8, 0],
    [1.0, -0.55],
  ],
  positionZ: [
    [0.0, 0],
    [0.46, 0.5],
    [0.8, 0],
    [1.0, -0.5],
  ],
  tiltX: [
    [0.0, 0.3],
    [0.46, 0.08],
    [1.0, 0.14],
  ],
  tiltZ: [
    [0.0, -0.2],
    [0.46, -0.04],
    [1.0, -0.1],
  ],
  scale: [
    [0.0, 1],
    [0.8, 0.92],
    [1.0, 0.78],
  ],
} satisfies Record<string, [number, number][]>;

export function BagModel({ reducedMotion }: { reducedMotion: boolean }) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const settled = useRef(false);
  const { scene } = useGLTF(MODEL);

  /**
   * Meshy returns the bag at an arbitrary scale, sitting wherever its origin
   * happened to land. Normalising once here means the keyframes above are in
   * scene units and stay meaningful if the model is ever re-generated.
   */
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const normalise = 2.6 / Math.max(size.x, size.y, size.z);
    clone.position.set(-centre.x, -centre.y, -centre.z);
    clone.scale.setScalar(normalise);
    clone.traverse((child) => {
      child.castShadow = true;
      child.receiveShadow = true;
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    model.scale.setScalar(model.scale.x);
  }, [model]);

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
      return;
    }

    const lambda = reducedMotion ? 24 : 6;
    o.position.x = damp(o.position.x, track(p, KEYS.positionX), lambda, dt);
    o.position.y = damp(o.position.y, track(p, KEYS.positionY), lambda, dt);
    o.position.z = damp(o.position.z, track(p, KEYS.positionZ), lambda, dt);

    o.scale.setScalar(damp(o.scale.x, track(p, KEYS.scale), lambda, dt));

    i.rotation.y = damp(i.rotation.y, track(p, KEYS.rotationY), lambda, dt);
    i.rotation.x = damp(i.rotation.x, track(p, KEYS.tiltX), lambda, dt);
    i.rotation.z = damp(i.rotation.z, track(p, KEYS.tiltZ), lambda, dt);
  });

  const body = (
    <group ref={inner}>
      <primitive object={model} />
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
        <Float speed={1.1} rotationIntensity={0.16} floatIntensity={0.55} floatingRange={[-0.07, 0.07]}>
          {body}
        </Float>
      )}
    </group>
  );
}

useGLTF.preload(MODEL);
