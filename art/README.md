# Source artwork

Everything the pack is made of. Three files produce the two textures and the one
model that `components/three/PackStage.tsx` loads, and all three are
regenerable — nothing here is a flattened export whose source has been lost.

| Source | Command | Output |
| --- | --- | --- |
| `panel-front.html` | `node scripts/panels.mjs` | `public/art/panel-front.webp` (680×1360) |
| `panel-back.html` | `node scripts/panels.mjs` | `public/art/panel-back.webp` (684×1360) |
| an image-to-3D export | `node scripts/pack-model.mjs "<raw.glb>"` | `public/models/meridian-pack.glb` (81 KB) |

`bag-source-for-meshy.png` — 1400×1800, the front-elevation render the whole
design language comes from. It is no longer loaded by anything; it is kept
because it is the reference the flat panels were drawn against.

All of it is original work. The reference pack supplied at the start of the
project was a real roaster's packaging and was **not** used.

## Why the panels are HTML

The two PNGs are flat, unshaded artwork — the printed faces of the pouch with no
lighting baked in, because three.js does the lighting. They are authored as HTML
rather than in an image editor for one reason: their layout is registered to
relief measured off the model, and a stylesheet full of measured numbers can be
re-measured and re-rendered where a flattened PNG cannot.

Both sources seed their own randomness (the beans, the barcode), so re-rendering
is idempotent — the same input gives the same bytes, and a diff means somebody
changed the artwork.

## The registration numbers

The supplied model has the packaging sculpted into it: a raised roundel, a
raised label block and a raised window, all left over from the image it was
generated from. Print that lands anywhere else shows up as a ghost ridge beside
the thing it was meant to be, so the front panel is laid out to the relief
rather than to taste. In panel pixels (680×1360):

```
crimp band      y    0 -  168
roundel emboss  cx 340, cy 472, diameter 205
label emboss    x   90 -  590, y  650 -  890
window emboss   x   90 -  590, y  995 - 1188
base fold       y 1290 - 1360
```

They were measured by rendering the mesh orthographically at exactly the flat
face's extent, under a raking light, so one pixel of that render is one pixel of
artwork. Measured on the full-resolution derivation of the same export; the
shipped 2,116-triangle mesh softens the relief but does not move it, so the
numbers hold. If you replace the model with a *different* one, re-measure before
touching the panels — set an `OrthographicCamera(x0, x1, y1, y0)` to the extents
`projectPanels` reports and screenshot at 680×1360.

The back face carries no relief worth registering to, so `panel-back.html` is
laid out for reading.

## Panel aspect is not decoration

`lib/pack-projection.ts` fits each panel **by height** and centres it by width,
dividing by the artwork's own aspect. So the PNG's pixel aspect has to match its
face's measured extent or the type stretches sideways:

```
                measured    artwork
front face      0.5038      680 × 1360  (0.5000)
back face       0.4978      684 × 1360  (0.5029)
```

Those three places — the measured extent, the pixel size in `scripts/panels.mjs`,
and `ART[].aspect` in `lib/pack-projection.ts` — must agree.

The shipped mesh is off by under 1% on each face (the panel sizes were set from
a higher-resolution derivation, whose flat extents differ by a few thousandths).
That prints the front a hair narrow and the back a hair wide, both by less than
a pixel at any size the camera reaches, so the PNGs were left alone. A larger
divergence than that is worth re-rendering for.

## Replacing the model

Drop any image-to-3D export in and run the script. Nothing in the app is bound
to the exporter, the units or the origin: `projectPanels` normalises whatever it
is given to body height 1, centred, base at y = −0.5, which is the unit the
camera distances in `lib/scrolly-config.ts` are written in.

```
node scripts/pack-model.mjs "~/Downloads/whatever.glb"
```

What the script does, and why: weld first (raw exports are de-indexed and the
simplifier cannot collapse an edge it cannot see shared), simplify to 5%, then
drop UVs, materials and textures — the export's baked label is a hallucination
and never reaches the screen, so its 7 MB of texture is dead weight. Dropping
the textures is most of the size win in both cases.

It accepts **Draco-compressed input** and never writes it: the decoder is
registered on the reader only, and the output goes through a bare `NodeIO` that
has no extension to write with. It also **skips simplification below 20k
triangles** — some exports arrive already decimated, and a 5% ratio over a
2k-triangle mesh does not make it smaller, it makes it a bag-shaped polygon.

Two constraints, both learned expensively:

- **No Draco, no mesh quantization.** Both produced files that loaded without a
  single error and then never rendered — drei suspends on `useGLTF` and the
  boundary never resolves. Plain glTF only. The script has a size budget instead
  of a compression step: if the output grows, cut the ratio, do not reach for a
  codec.
- **Keep it under 3.5 MB.** The script exits non-zero above that.

## Fonts in the panel sources

`panel-front.html` and `panel-back.html` pull Playfair Display, Inter and
JetBrains Mono from Google Fonts at render time, which is why `scripts/panels.mjs`
passes `--virtual-time-budget`. Rendering offline is not fatal but it is not
silent either: the wordmark falls back to a system serif and the panels stop
matching the page. Check the output before committing it.
