#!/usr/bin/env node
/**
 * Turns a raw image-to-3D export into public/models/meridian-pack.glb.
 *
 *   node scripts/pack-model.mjs "<raw.glb>" [ratio]
 *
 * The supplied Tripo export is 61 MB: one mesh, 979k vertices, 1.9M triangles,
 * a 4096² baseColor JPEG and a 4096² normal map. Three things happen to it.
 *
 * WELD, then SIMPLIFY. The export is de-indexed, and meshoptimizer cannot
 * collapse an edge it cannot see two triangles sharing. Welding first is the
 * difference between a 5% ratio and no reduction at all.
 *
 * STRIP EVERYTHING BUT POSITION AND NORMAL. The label on that baseColor map is
 * hallucinated — "MERII SPECIA", "JASNINE BLUERE", invented body copy across a
 * fragmented atlas — so it never reaches the screen. lib/pack-projection.ts
 * rebuilds the UVs from scratch at load and prints the panels in public/art
 * onto the result, which means the export's own UVs, materials and 7 MB of
 * texture are all dead weight. Dropping them is most of the size win.
 *
 * NO DRACO AND NO QUANTIZATION, both learned expensively: each produced a file
 * that loaded without a single error and then never rendered. drei suspends on
 * useGLTF and the boundary never resolves — no exception, no console message,
 * just a lit scene with no product in it. Plain glTF only. That is also why
 * this script has a size budget rather than a compression step: if the output
 * grows past a few megabytes, cut the ratio, do not reach for a codec.
 *
 * The old two-process split is gone with the textures. `sharp` and
 * `@gltf-transform/functions` still cannot share a process on this platform —
 * importing the latter corrupts libvips' global state and every subsequent
 * image encode fails with "colourspace: parameter space not set" — but nothing
 * in this pipeline encodes an image any more, so there is only one process.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, simplify, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import draco3d from "draco3dgltf";
import { mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [input, ratioArg] = process.argv.slice(2);
const OUT = "public/models/meridian-pack.glb";
const RATIO = Number(ratioArg ?? 0.05);

/** Past this the page is paying for detail nobody can see at 3.3 units out. */
const BUDGET_MB = 3.5;

/**
 * Below this, simplification is skipped entirely. Some exports arrive already
 * decimated, and running a 5% ratio over a 2k-triangle mesh does not make it
 * smaller, it makes it a bag-shaped polygon.
 */
const SIMPLIFY_ABOVE = 20_000;

if (!input) {
  console.error('usage: node scripts/pack-model.mjs "<raw.glb>" [ratio]');
  process.exit(1);
}

/**
 * The decoder is registered for READING only. Some exports arrive
 * Draco-compressed, and without it `io.read` throws on the first primitive.
 * The output is written with a bare NodeIO further down, so the extension can
 * never survive into the file the browser loads — drei suspends forever on a
 * Draco payload and the boundary never resolves.
 */
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "draco3d.decoder": await draco3d.createDecoderModule() });

const doc = await io.read(resolve(input));
const root = doc.getRoot();

const before = root
  .listMeshes()
  .flatMap((m) => m.listPrimitives())
  .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3, 0);

if (before > SIMPLIFY_ABOVE) {
  await MeshoptSimplifier.ready;
  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: 0.002 })
  );
} else {
  console.log(`${before.toLocaleString()} tris is already under ${SIMPLIFY_ABOVE.toLocaleString()} — not simplifying.`);
}

// After simplify, not before: the simplifier reads TEXCOORD_0 as a seam hint,
// and dropping it first makes it collapse across UV islands it should respect.
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    prim.setMaterial(null);
    for (const semantic of prim.listSemantics()) {
      if (semantic !== "POSITION" && semantic !== "NORMAL") prim.setAttribute(semantic, null);
    }
  }
}

await doc.transform(dedup(), prune());

const target = resolve(OUT);
mkdirSync(dirname(target), { recursive: true });
// A bare NodeIO, not the one above: it has no extension registered, so a Draco
// input is written back out as plain glTF rather than re-compressed.
await new NodeIO().write(target, doc);

const after = root
  .listMeshes()
  .flatMap((m) => m.listPrimitives())
  .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3, 0);

const mb = statSync(target).size / 1e6;
console.log(
  `${input}\n  -> ${OUT}\n  ${before.toLocaleString()} tris -> ${after.toLocaleString()} tris` +
    `  ·  ${mb.toFixed(2)} MB  ·  ratio ${RATIO}`
);

if (mb > BUDGET_MB) {
  console.error(`\n${mb.toFixed(2)} MB is over the ${BUDGET_MB} MB budget — lower the ratio.`);
  process.exit(1);
}
