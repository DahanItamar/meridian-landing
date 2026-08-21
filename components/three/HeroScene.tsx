"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { BagModel } from "./BagModel";

/**
 * The WebGL layer. Sits behind the copy and never takes pointer events, so the
 * page scrolls and the CTA stays clickable exactly as it would without it.
 *
 * dpr is capped at 2 rather than 1.6: the sequence pushes the camera close
 * enough to read the label, and at that distance the extra pixels are the
 * difference between crisp type and mush.
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
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.15, 6.5], fov: 34 }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        // Filmic tone mapping holds the warm highlights instead of clipping them
        // to flat white, which is what made the earlier pass look washed out.
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.outputColorSpace = SRGBColorSpace;
      }}
    >


      {/*
        A matte black pack on a near-black page has no natural separation, so
        this rig is doing structural work rather than polish:

        key    — high and to one side, so the gusset reads as an edge, not a seam
        fill   — broad and cool, lifts the shadow side off the background
        rims   — two warm bronzes from behind; these are the edges you actually
                 see, and halving them makes the product disappear
        bounce — low and dim, stops the base going solid black above the shadow
      */}
      <directionalLight
        position={[3.4, 5.6, 3.8]}
        intensity={3.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        color="#fff4e6"
      />
      <directionalLight position={[-4.2, 1.8, 2.2]} intensity={1.5} color="#cddcf0" />
      <pointLight position={[-3.0, 0.8, -3.0]} intensity={95} distance={16} color="#f0a45c" />
      <pointLight position={[3.2, -0.2, -2.6]} intensity={55} distance={14} color="#d9944e" />
      <pointLight position={[0, -2.4, 1.6]} intensity={16} distance={9} color="#e3b77c" />
      <ambientLight intensity={1.15} />

      {/*
        The environment is built from Lightformers rather than drei's `preset`,
        which downloads an HDRI from a third-party CDN at runtime. That fetch
        shares a Suspense boundary with whatever sits beside it, so when it
        stalls the pack never renders at all — which is exactly what happened.
        Everything the scene needs is local.
      */}
      <Environment resolution={512} frames={1}>
        <Lightformer
          form="rect"
          intensity={4}
          position={[0, 3.4, 2.4]}
          scale={[9, 3.5, 1]}
          color="#fffaf2"
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[-4.4, 0.6, -2]}
          scale={[6, 5, 1]}
          color="#f0a45c"
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[4.4, 0.2, -2]}
          scale={[6, 5, 1]}
          color="#9fb6d4"
        />
        <Lightformer form="ring" intensity={2.4} position={[2.6, 2.6, 3.2]} scale={2.4} color="#ffffff" />
        <Lightformer form="ring" intensity={1.6} position={[-2.8, -1.6, 2.6]} scale={1.8} color="#e3b77c" />
      </Environment>

      {/* The model gets its own boundary. Anything that suspends beside it can
          stall it, and the product is the one thing that must arrive. */}
      <Suspense fallback={null}>
        <BagModel reducedMotion={reducedMotion} />
      </Suspense>

      <ContactShadows
        position={[0, -1.78, 0]}
        opacity={0.6}
        scale={10}
        blur={2.4}
        far={4.5}
        resolution={1024}
        color="#000000"
      />
    </Canvas>
  );
}
