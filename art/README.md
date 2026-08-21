# Source artwork

`bag-source-for-meshy.png` — 1400x1800, the front-elevation pack render that was
fed to Meshy image-to-3D to produce `public/models/coffee-bag.glb`.

Original work. Drawn in the design language of the reference pack (matte black
pouch, centred cream label band, gold roundel above it, weight below, warm foil
accents) with our own marks. Nothing from any third party's packaging appears in
it, so there is nothing to strip or licence.

Regenerate it from `scratchpad/bag2.html` if the layout needs to change, or feed
this PNG straight back into Meshy.

## Replacing the model

Drop a `.glb` at `public/models/coffee-bag.glb` and the scene picks it up. No
code change is needed — `components/three/BagAsset.tsx` normalises whatever it
is given:

- **Scale and origin** are recomputed from the mesh bounds, so the scroll
  keyframes stay valid no matter what units the exporter used.
- **Materials** are re-tuned on load — matte foil, and anisotropic filtering on
  every map, which is what keeps label type legible once the pack turns oblique.
- **Shadows** are enabled on every mesh.

Two constraints, both learned the hard way:

- **No Draco, no mesh quantization.** Both produced files that loaded without a
  single error and then never rendered — drei suspends on `useGLTF` and the
  boundary never resolves. Plain glTF only.
- **Keep it near 2.5 MB.** `scripts/glb-textures.mjs` holds the colour map at
  2048 and halves the data maps; `scripts/glb-simplify.mjs` cuts triangles.
  Run textures first, in its own process — see the note at the top of that file.

```
node scripts/glb-textures.mjs raw.glb tex.glb
node scripts/glb-simplify.mjs tex.glb public/models/coffee-bag.glb 0.4
```
