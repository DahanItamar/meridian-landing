#!/usr/bin/env node
/**
 * Pass 2 of GLB optimisation, without Draco.
 *
 * Draco decoding never resolved in the browser: drei suspends on useGLTF, the
 * decoder stalls, and the model simply never appears while every light and
 * non-suspending mesh renders fine. Rather than ship a product that depends on
 * a decoder we cannot verify, geometry is reduced the boring way — simplify to
 * cut triangles, quantize to shrink each attribute from float32 to int16.
 * Both are plain glTF that three.js reads natively.
 *
 * Runs in its own process because these imports corrupt sharp — see
 * glb-textures.mjs.
 *
 *   node scripts/glb-shrink.mjs <in.glb> <out.glb>
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, simplify, quantize } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

const [, , inPath, outPath] = process.argv;

await MeshoptSimplifier.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inPath);

await doc.transform(
  dedup(),
  prune(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.55, error: 0.001 }),
  quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }),
);

await io.write(outPath, doc);
