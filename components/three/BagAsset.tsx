"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
} from "three";

const MODEL = "/models/coffee-bag.glb";

/**
 * The pack, loaded as a standard glTF asset.
 *
 * Produced by Meshy image-to-3D from original artwork drawn for this project —
 * matte black pouch, cream label band, gold roundel, bean window. Nothing in the
 * source image or the model came from anyone else's packaging.
 *
 * Pipeline that produced the file in /public/models:
 *   1. scripts/glb-textures.mjs   colour map kept at 2048 for the close-up beat,
 *                                 normal and metallic-roughness halved
 *   2. scripts/glb-simplify.mjs   triangle count reduced to 40%
 * Deliberately no Draco and no quantization: both produced files that loaded
 * without error and never rendered.
 */
export function BagAsset() {
  const { scene } = useGLTF(MODEL);
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  const model = useMemo(() => {
    const clone = scene.clone(true);

    /**
     * Meshy returns the pack at an arbitrary scale with its origin wherever the
     * mesh happened to land. Normalising here means the scroll keyframes are in
     * scene units and stay meaningful if the asset is ever regenerated.
     */
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    clone.position.set(-centre.x, -centre.y, -centre.z);
    clone.scale.setScalar(2.45 / Math.max(size.x, size.y, size.z));

    clone.traverse((child: Object3D) => {
      child.castShadow = true;
      child.receiveShadow = true;

      const mesh = child as Mesh;
      if (!mesh.isMesh) return;

      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const raw of list) {
        const material = raw as MeshStandardMaterial;

        /**
         * Matte foil. Meshy bakes a flatter, rougher surface than a specialty
         * pack has: it should scatter most of what hits it while still throwing
         * one defined highlight down the gusset, because on a near-black page
         * that highlight is the only thing separating product from background.
         */
        material.roughness = 0.44;
        material.metalness = 0.26;
        material.envMapIntensity = 1.65;

        /**
         * Anisotropy is what keeps the label readable once the pack turns away
         * from camera. Without it the mip chain blurs type into grey the moment
         * the surface goes oblique, which is most of this sequence.
         */
        if (material.map) {
          material.map.anisotropy = maxAnisotropy;
          material.map.colorSpace = SRGBColorSpace;
          material.map.needsUpdate = true;
        }
        if (material.normalMap) {
          material.normalMap.anisotropy = maxAnisotropy;
          material.normalScale.set(0.7, 0.7);
        }
        if (material.roughnessMap) material.roughnessMap.anisotropy = maxAnisotropy;

        material.needsUpdate = true;
      }
    });

    return clone;
  }, [scene, maxAnisotropy]);

  return <primitive object={model} />;
}

useGLTF.preload(MODEL);
