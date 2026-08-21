#!/usr/bin/env node
/**
 * Pass 1 of GLB optimisation: shrink the textures. Nothing else may be imported
 * here.
 *
 * On this platform, importing `@gltf-transform/functions` (or draco3d) into a
 * process corrupts libvips' global state: every subsequent sharp encode fails
 * with "colourspace: parameter space not set", while the identical pipeline
 * succeeds in a process that has not imported them. Splitting the passes across
 * two processes is the fix.
 *
 * The base-colour map is treated differently from the rest and that is the whole
 * point of this script. The scroll sequence pushes the camera in until the label
 * fills the frame, so that one texture carries readable typography and stays at
 * full resolution. Normal and metallic-roughness maps describe surface response,
 * never text, and halve with no visible cost.
 *
 *   node scripts/glb-textures.mjs <in.glb> <out.glb>
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import sharp from "sharp";

const [, , inPath, outPath] = process.argv;

const COLOR_MAX = 2048; // readable label type
const DATA_MAX = 1024; // surface response only

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(inPath);

// Which texture is the albedo? Ask the materials rather than guessing by index.
const colorTextures = new Set(
  doc
    .getRoot()
    .listMaterials()
    .map((m) => m.getBaseColorTexture())
    .filter(Boolean),
);

for (const texture of doc.getRoot().listTextures()) {
  const image = texture.getImage();
  if (!image) continue;

  const isColor = colorTextures.has(texture);
  const source = Buffer.from(image);

  const out = await sharp(source)
    .resize(isColor ? COLOR_MAX : DATA_MAX)
    .jpeg({ quality: isColor ? 94 : 80, chromaSubsampling: isColor ? "4:4:4" : "4:2:0" })
    .toBuffer();

  texture.setImage(new Uint8Array(out));
  texture.setMimeType("image/jpeg");

  console.log(
    `  ${isColor ? "baseColor " : "data      "} ${(source.length / 1e6).toFixed(2)} MB -> ` +
      `${isColor ? COLOR_MAX : DATA_MAX}px ${(out.length / 1024).toFixed(0)} kB`,
  );
}

await io.write(outPath, doc);
