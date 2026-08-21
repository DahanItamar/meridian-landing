#!/usr/bin/env node
/**
 * Pass 2 of GLB optimisation: reduce triangle count.
 *
 * Deliberately no quantize() and no draco(): both produced models that loaded
 * without error and never rendered — drei suspends on useGLTF and the boundary
 * never resolves. Simplification alone is plain glTF that three.js reads
 * natively, so it stays verifiable.
 *
 * Runs in its own process because these imports corrupt sharp — see
 * glb-textures.mjs.
 *
 *   node scripts/glb-simplify.mjs <in.glb> <out.glb> [ratio]
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, simplify, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

const [, , inPath, outPath, ratioArg] = process.argv;
await MeshoptSimplifier.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inPath);

await doc.transform(
  dedup(),
  prune(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: Number(ratioArg ?? 0.4), error: 0.0015 }),
);

await io.write(outPath, doc);
