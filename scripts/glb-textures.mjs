#!/usr/bin/env node
/**
 * Pass 1 of GLB optimisation: shrink the textures. Nothing else may be imported
 * here.
 *
 * On this platform, importing `@gltf-transform/functions` (or draco3d) into a
 * process corrupts libvips' global state: every subsequent sharp encode fails
 * with "colourspace: parameter space not set", while the identical pipeline
 * succeeds in a process that has not imported them. Splitting the two passes
 * across two processes is the fix — see glb-draco.mjs for pass 2.
 *
 *   node scripts/glb-textures.mjs <in.glb> <out.glb>
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import sharp from "sharp";

const [, , inPath, outPath] = process.argv;
const MAX = 1024;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inPath);

for (const texture of doc.getRoot().listTextures()) {
  const image = texture.getImage();
  if (!image) continue;

  const source = Buffer.from(image);
  const out = await sharp(source).resize(MAX).jpeg({ quality: 82 }).toBuffer();

  texture.setImage(new Uint8Array(out));
  texture.setMimeType("image/jpeg");

  console.log(
    `  texture ${(source.length / 1e6).toFixed(2)} MB -> ${MAX}px ` +
      `${(out.length / 1024).toFixed(0)} kB`,
  );
}

await io.write(outPath, doc);
