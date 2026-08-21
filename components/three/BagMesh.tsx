"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  BoxGeometry,
  DoubleSide,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

/**
 * The pack, built as real geometry with real UVs.
 *
 * This replaces the Meshy GLB. That model gave a convincing silhouette but its
 * UVs are auto-generated and its texture is a single projected bake of one flat
 * front image — so the label was soft, and the back and gussets were smeared
 * with whatever the projection happened to reach. There was no rear panel in
 * that UV space to draw a barcode into.
 *
 * A box has six faces and six material slots, one per face, each with a clean
 * 0..1 UV square. Every panel is therefore a flat image at whatever resolution
 * we choose, and stays sharp at any zoom the scroll sequence reaches.
 */

// Roughly a real 1 kg pack: 20 x 33 x 9 cm, scaled so the front face matches the
// 3:4 aspect of its texture rather than stretching the artwork to fit.
const W = 1.5;
const H = 2.0;
const D = 0.62;

/** How much narrower the pack is at the top than at the base. */
const TAPER = 0.86;

/**
 * Where the window sits, and how far out the front face actually is at that
 * height. Computed from the same taper and pillow the geometry uses — hardcoding
 * a depth put the pane inside the bag, where nothing could see it.
 */
const WINDOW_Y = -0.50;
const WINDOW_T = (WINDOW_Y + H / 2) / H;
const WINDOW_Z =
  (D / 2) * (1 - 0.24 * WINDOW_T * WINDOW_T) +
  0.11 * Math.sin(WINDOW_T * Math.PI) * (1 - 0.45 * WINDOW_T);

const PANELS = ["/textures/bag-front.jpg", "/textures/bag-back.jpg", "/textures/bag-gusset.jpg", "/textures/beans.jpg"];

export function BagMesh() {
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const [front, back, gusset, beans] = useTexture(PANELS);

  const prepared = useMemo(() => {
    const setup = (t: Texture, colour = true) => {
      if (colour) t.colorSpace = SRGBColorSpace;
      t.anisotropy = maxAnisotropy;
      t.minFilter = LinearMipmapLinearFilter;
      t.wrapS = t.wrapT = RepeatWrapping;
      t.needsUpdate = true;
      return t;
    };
    return {
      front: setup(front),
      back: setup(back),
      gusset: setup(gusset),
      beans: setup(beans),
    };
  }, [front, back, gusset, beans, maxAnisotropy]);

  /**
   * A plain BoxGeometry, tapered by hand. Every vertex above the midline is
   * pulled inward proportionally to its height, which gives the pack the shape a
   * filled bag actually has — wide at the base, pinched toward the seal.
   */
  const geometry = useMemo(() => {
    // Enough segments to pillow smoothly. A 1x1 face can only taper, not bulge,
    // and a pack that does not bulge reads as a printed box.
    const geo = new BoxGeometry(W, H, D, 14, 26, 8);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const t = (y + H / 2) / H; // 0 at base, 1 at seal

      // Taper toward the seal, and pull the gussets in with it.
      const squeeze = 1 - (1 - TAPER) * t * t;
      const depth = 1 - 0.24 * t * t;

      // Pillow: a filled bag is fullest at its centre and flat at every seam,
      // so the bulge falls to zero at the panel edges in both axes.
      const acrossX = Math.cos((x / (W / 2)) * Math.PI * 0.5);
      const acrossY = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
      const bulge = 0.11 * Math.max(0, acrossX) * acrossY * (1 - 0.45 * t);

      pos.setX(i, x * squeeze);
      pos.setZ(i, z * depth + Math.sign(z) * bulge);
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  /**
   * Matte foil: scatters most of what hits it, but still throws a defined
   * highlight along the gusset. That highlight is the only thing separating a
   * black pack from a black page.
   */
  const materials = useMemo(() => {
    const foil = (map: Texture) =>
      new MeshStandardMaterial({
        map,
        roughness: 0.46,
        metalness: 0.24,
        envMapIntensity: 1.6,
      });

    // BoxGeometry material order: +X, -X, +Y, -Y, +Z, -Z
    const gussetMat = foil(prepared.gusset);
    const sealMat = new MeshStandardMaterial({
      color: "#1a1512",
      roughness: 0.34,
      metalness: 0.5,
      envMapIntensity: 1.4,
    });

    return [
      gussetMat,
      gussetMat.clone(),
      sealMat,
      sealMat.clone(),
      foil(prepared.front),
      foil(prepared.back),
    ];
  }, [prepared]);

  return (
    <group>
      <mesh geometry={geometry} material={materials} castShadow receiveShadow />

      {/* Heat-seal crimp along the top edge. */}
      <mesh position={[0, H / 2 + 0.045, 0]} castShadow>
        <boxGeometry args={[W * TAPER * 1.02, 0.09, D * 0.8 * 0.5]} />
        <meshStandardMaterial color="#241d18" roughness={0.3} metalness={0.55} />
      </mesh>

      {/*
        The window. Beans sit recessed behind a thin glossy pane, so the coffee
        parallaxes as the pack turns rather than being painted flat onto the
        front panel.

        The pane is a clearcoated surface, not a transmissive one. `transmission`
        needs a render target that software WebGL cannot provide and that weak
        GPUs pay real frame time for, and the pane reads the same either way at
        this size — the beans behind it are already visible.
      */}
      <mesh position={[0, WINDOW_Y, WINDOW_Z - 0.055]}>
        <planeGeometry args={[0.5, 0.5]} />
        {/* Self-lit a little: the window is a recess on a matte black pack, so
            almost no scene light reaches the beans and they read as a black
            hole without this. */}
        <meshStandardMaterial
          map={prepared.beans}
          emissiveMap={prepared.beans}
          emissive="#ffffff"
          emissiveIntensity={0.55}
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, WINDOW_Y, WINDOW_Z + 0.004]}>
        <planeGeometry args={[0.52, 0.52]} />
        <primitive
          object={
            new MeshPhysicalMaterial({
              color: "#ffffff",
              roughness: 0.08,
              metalness: 0,
              clearcoat: 1,
              clearcoatRoughness: 0.05,
              transparent: true,
              opacity: 0.14,
              side: DoubleSide,
            })
          }
          attach="material"
        />
      </mesh>
    </group>
  );
}

useTexture.preload(PANELS);
