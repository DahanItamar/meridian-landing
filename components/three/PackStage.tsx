"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type DirectionalLight,
  type Group,
  type PerspectiveCamera,
  type Texture,
} from "three";
import { ART, BACK, FOIL, FRONT, collectTriangles, projectPanels } from "@/lib/pack-projection";
import { sample } from "@/lib/scrolly-config";
import { scrollState } from "@/lib/scroll-store";

const MODEL_URL = "/models/meridian-pack.glb";

/**
 * The pack, printed with the approved artwork.
 *
 * Suspends on both the model and the two panel textures, which is why it sits
 * behind its own boundary — the studio around it renders regardless, so a slow
 * asset shows an empty lit stage rather than an empty page.
 */
function Pack({ onReady }: { onReady?: () => void }) {
  const gltf = useGLTF(MODEL_URL);
  const maps = useLoader(TextureLoader, [ART[0].src, ART[1].src]);

  /**
   * The model's own materials never reach the screen: `projectPanels` rebuilds
   * the geometry with its own UVs and three material groups. Running once per
   * load and memoised — it walks every triangle twice, which is milliseconds at
   * this mesh size but not something to redo on a re-render.
   */
  const geometry = useMemo(() => {
    const { pos, nrm } = collectTriangles(gltf.scene);
    return projectPanels(pos, nrm);
  }, [gltf]);

  const materials = useMemo(() => {
    const print = (name: string, map: Texture) => {
      // flipY false, not the default true: the V axis in projectPanels runs
      // top-down (v = 0 at the top of the panel), so a flipped upload prints
      // the label upside down on the pack.
      map.flipY = false;
      map.colorSpace = SRGBColorSpace;
      map.anisotropy = 8;
      map.wrapS = ClampToEdgeWrapping;
      map.wrapT = ClampToEdgeWrapping;
      map.needsUpdate = true;
      // Double-sided: the pouch is an open shell at the crimp, and a
      // single-sided material shows straight through it when the camera
      // passes the seam.
      return new MeshStandardMaterial({
        name,
        map,
        roughness: 0.58,
        metalness: 0.05,
        side: DoubleSide,
      });
    };

    // Indexed by the group constants, not by position. `projectPanels` emits
    // its three groups in this order and the array has to match; writing 0, 1,
    // 2 here means the two files agree by coincidence rather than by name.
    const list = [];
    list[FRONT] = print("print-front", maps[FRONT]);
    list[BACK] = print("print-back", maps[BACK]);
    list[FOIL] =
      // Gussets, crimp and base. Matte black foil: barely metallic, because a
      // metalness that reads as "foil" in a mirror-ball environment reads as
      // wet plastic under five discrete lights.
      new MeshStandardMaterial({
        name: "foil",
        color: 0x0d0c0b,
        roughness: 0.62,
        metalness: 0.14,
        side: DoubleSide,
      });
    return list;
  }, [maps]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [geometry, materials]);

  // Fires once the model and both textures have resolved, which is the moment
  // the poster underneath can be faded out. Anything earlier crossfades to an
  // empty stage.
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return <mesh geometry={geometry} material={materials} name="meridian-pack" />;
}

/** Contact shadow: a soft radial blob, so there is no plane edge to see. */
function ContactBlob() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(0,0,0,0.85)");
      grad.addColorStop(0.45, "rgba(0,0,0,0.38)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);

  const material = useMemo(
    () =>
      new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0.9 }),
    [texture],
  );

  useEffect(() => {
    return () => {
      texture.dispose();
      material.dispose();
    };
  }, [texture, material]);

  return (
    <mesh
      name="contact-shadow"
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.503, 0]}
    >
      <planeGeometry args={[1.5, 0.75]} />
    </mesh>
  );
}

/**
 * The studio: lights, shadow catcher, and the one loop that drives every
 * scripted value on the stage.
 *
 * Key, fill, two warm rims, bounce — the rig the artwork was lit for. There is
 * no shadow map: a ShadowMaterial plane shows its own edge as a hard band
 * across the frame the moment the camera tilts, and the blob below has no edges
 * at all.
 *
 * There is also no drei `<Environment preset>`. That downloads an HDRI from a
 * third-party CDN at runtime and shares a Suspense boundary with whatever sits
 * beside it, so a stalled fetch takes the product down with it. Everything the
 * scene needs is local.
 */
function Studio({ reducedMotion, onReady }: { reducedMotion: boolean; onReady?: () => void }) {
  const pack = useRef<Group>(null);
  const key = useRef<DirectionalLight>(null);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const look = useMemo(() => new Vector3(), []);
  const shown = useRef<number | null>(null);

  /**
   * True below Tailwind's `lg`, which is where `.beat` in globals.css stops
   * putting the copy beside the pack and starts stacking it above with a scrim.
   * 64rem is written once in each place and means the same thing in both.
   *
   * A ref rather than state: it is read inside useFrame, and a re-render per
   * resize would rebuild the canvas subtree for a value the loop can just look
   * at.
   */
  const narrow = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const sync = () => (narrow.current = !query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /**
   * Camera, rotation and key light are driven from one useFrame, deliberately.
   * A second hook moving the camera beside this one stopped the pack rendering
   * altogether while every other object kept drawing — one owner per frame.
   */
  useFrame((_, delta) => {
    if (!scrollState.visible) return;

    const target = scrollState.progress;

    // The first frame assigns rather than damps. Easing from 0 would play the
    // whole sequence back at anyone who lands mid-page on a reload. It is also
    // where an infinite damping constant would bite: delta is 0 on that frame,
    // and -Infinity * 0 is NaN, which propagates silently into every transform.
    if (shown.current === null || reducedMotion) {
      shown.current = target;
    } else {
      const dt = Math.min(0.05, Math.max(0, delta));
      // Critically damped follow: scroll arrives in jumps, the camera never does.
      shown.current += (target - shown.current) * Math.min(1, dt * 5.5);
    }

    // r3f types the default camera as the union of both projections, and the
    // scene is built around a perspective one — the dolly in beats 2 and 3 is
    // the whole point, and an orthographic camera has no dolly to do.
    const cam = camera as PerspectiveCamera;

    // The SAME breakpoint the copy layout uses, not the camera's aspect ratio.
    //
    // This was `cam.aspect < 1.15`, and the two disagreed in a band: any
    // viewport at least 64rem wide but squarer than 1.15 — a 1024x900 window, a
    // 1280x1200 display — got the wide two-column copy with the narrow centred
    // camera, which put the headline directly on top of the pack. Driving both
    // from one signal makes that class of bug unreachable rather than fixed.
    const s = sample(shown.current, narrow.current);

    cam.position.set(s.cam[0], s.cam[1], s.cam[2]);
    look.set(s.target[0], s.target[1], s.target[2]);
    cam.lookAt(look);
    if (cam.isPerspectiveCamera && Math.abs(cam.fov - s.fov) > 0.01) {
      cam.fov = s.fov;
      cam.updateProjectionMatrix();
    }

    if (pack.current) {
      pack.current.rotation.y = s.rotY;
      pack.current.rotation.x = s.rotX;
    }
    // The key travels with the move so the highlight stays on whichever panel
    // is facing the camera. Scripted, not oscillating: nothing on this stage
    // moves when the scrollbar does not.
    if (key.current) key.current.position.x = s.light;
  });

  useEffect(() => {
    // Matte black foil eats light. This is a product shot, not a night scene:
    // the pack has to read as a real object on a dark stage, not a silhouette.
    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.42;
    gl.outputColorSpace = SRGBColorSpace;
    invalidate();
  }, [gl, invalidate]);

  return (
    <>
      <directionalLight ref={key} position={[-1.9, 3.0, 3.0]} intensity={2.6} color="#fff4e6" />

      {/* Cooler than the key and much weaker: enough to separate the gusset
          from the background, not enough to tint the crimp blue-grey. Matte
          black foil shows a colour cast far more readily than it shows form. */}
      <directionalLight position={[2.6, 0.9, 2.2]} intensity={0.4} color="#e8ecf7" />

      {/* The gold rims are what make matte black foil read as a surface rather
          than a silhouette. Kept behind the pack so they graze its edges. */}
      <pointLight
        position={[2.0, 1.1, -1.6]}
        intensity={9.5}
        distance={9}
        decay={2}
        color="#e3b77c"
      />
      <pointLight
        position={[-2.2, 0.5, -1.8]}
        intensity={6.8}
        distance={9}
        decay={2}
        color="#c9a25f"
      />

      <hemisphereLight args={["#bfc6d8", "#0a0807", 0.55]} />
      <ambientLight intensity={0.6} />

      <ContactBlob />

      {/* The pack gets its own boundary. Anything that suspends beside it can
          stall it, and the product is the one thing that must arrive. */}
      <group ref={pack} name="meridian-pack-root">
        <Suspense fallback={null}>
          <Pack onReady={onReady} />
        </Suspense>
      </group>
    </>
  );
}

/**
 * The WebGL layer of the pinned section. Sits behind the copy, never takes
 * pointer events, and is aria-hidden — every word it shows is also in the DOM
 * beside it, so a screen reader that announced the canvas would read the page
 * twice.
 */
export function PackStage({ onReady }: { onReady?: () => void }) {
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
      // Capped at 2 rather than 1.5: beats 2 and 3 push the camera close enough
      // to read the label, and at that distance the extra pixels are the
      // difference between crisp type and mush.
      dpr={[1, 2]}
      // preserveDrawingBuffer keeps the last frame readable after compositing.
      // Without it `canvas.toDataURL()` returns a blank image, which is how
      // scripts/poster.mjs captures the poster from the real scene rather than
      // from a second copy of it that would drift.
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      }}
      camera={{ position: [0.1, 0.02, 3.34], fov: 31, near: 0.1, far: 100 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Studio reducedMotion={reducedMotion} onReady={onReady} />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
