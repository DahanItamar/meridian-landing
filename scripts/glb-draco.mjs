#!/usr/bin/env node
/**
 * Pass 2 of GLB optimisation: dedup, prune and Draco-compress the geometry.
 * Runs in its own process because these imports break sharp — see
 * glb-textures.mjs.
 *
 *   node scripts/glb-draco.mjs <in.glb> <out.glb>
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, draco } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";

const [, , inPath, outPath] = process.argv;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.encoder": await draco3d.createEncoderModule(),
  "draco3d.decoder": await draco3d.createDecoderModule(),
});

const doc = await io.read(inPath);
await doc.transform(dedup(), prune(), draco({ method: "edgebreaker" }));
await io.write(outPath, doc);
