"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { BagModel } from "./BagModel";

/**
 * The WebGL layer. Sits behind the copy and never takes pointer events, so the
 * page scrolls and the CTA stays clickable exactly as it would without it.
 *
 * dpr is capped at 1.6: a 3x phone rendering a full-viewport canvas at native
 * density is the difference between a smooth scene and a hot battery, and the
 * pack is matte — there is nothing here that rewards the extra pixels.
 */
export function HeroScene() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.6]}
      shadows
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.15, 6.4], fov: 34 }}
      style={{ pointerEvents: "none" }}
    >
      {/* Key light high and slightly to one side, so the gusset reads as an edge
          rather than a seam. */}
      <directionalLight
        position={[3.2, 5.4, 3.6]}
        intensity={3.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      {/* A matte black pack on a near-black page has almost no natural
          separation, so the fill and the two warm rims are doing real work here
          rather than being polish. Halve them and the product disappears. */}
      <directionalLight position={[-4, 1.6, -2.4]} intensity={1.3} />
      <pointLight position={[-2.8, 0.6, -3.0]} intensity={70} distance={14} color="#e08a4e" />
      <pointLight position={[3.0, -0.4, -2.4]} intensity={34} distance={12} color="#c2703f" />
      <ambientLight intensity={0.9} />

      {/*
        The environment is built from Lightformers rather than drei's `preset`,
        which downloads an HDRI from a third-party CDN at runtime. That fetch
        shares this Suspense boundary with the model, so when it stalls the pack
        never renders at all — which is exactly what happened. Everything the
        scene needs is now local, same as the Draco decoder in /public.
      */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 3, 2]} scale={[8, 3, 1]} color="#fff6ec" />
        <Lightformer form="rect" intensity={1.4} position={[-4, 0.5, -2]} scale={[5, 4, 1]} color="#e08a4e" />
        <Lightformer form="rect" intensity={0.9} position={[4, 0, -2]} scale={[5, 4, 1]} color="#8fa6c4" />
        <Lightformer form="ring" intensity={1.6} position={[2.4, 2.4, 3]} scale={2.2} color="#ffffff" />
      </Environment>

      {/* The model gets its own boundary. Anything that suspends beside it can
          stall it, and the product is the one thing that must arrive. */}
      <Suspense fallback={null}>
        <BagModel reducedMotion={reducedMotion} />
      </Suspense>

      <ContactShadows
        position={[0, -1.72, 0]}
        opacity={0.55}
        scale={9}
        blur={2.6}
        far={4}
        resolution={512}
        color="#000000"
      />
    </Canvas>
  );
}
