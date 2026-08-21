# Credits

Meridian is a fictional brand. The site is a portfolio demonstration, and the
footer says so on the page itself, in Hebrew (AC-035).

## Imagery

**There are no photographs on this site.** The four Openverse-sourced grinder
photographs that earlier revisions credited here are gone along with the
hand-grinder product they illustrated; nothing in `public/` is anyone else's
work.

What remains is original, made for this project, and regenerable from source in
this repo:

| Asset | Source | Notes |
| --- | --- | --- |
| `public/art/panel-front.{png,webp}` | `art/panel-front.html` | Flat front face of the pack. Drawn in CSS and inline SVG. The WebP is what the page loads; the PNG is Chrome's screenshot, kept as the source. |
| `public/art/panel-back.{png,webp}` | `art/panel-back.html` | Flat back face. Same. |
| `public/models/meridian-pack.glb` | a Tripo image-to-3D export | Geometry only — see below. |
| the roundel in the nav and footer | `components/brand/Roundel.tsx` | Inline SVG, `currentColor`. |
| `art/bag-source-for-meshy.png` | drawn for this project | The reference the panels were laid out against. |

The reference pack supplied at the start of the project was a real roaster's
packaging. It was **not** used — the artwork was drawn from scratch in the same
design language (matte black pouch, centred cream label band, gold roundel above
it, weight below, warm foil accents) with our own marks, so there is nothing to
strip or licence.

## Animation

`components/brand/BeansLoader.tsx` — three beans hopping while the 3D pack
loads — is **original work, drawn for this project**. Three ellipses with a
crease each, animated with CSS keyframes.

It replaced a LottieFiles export that was supplied for this build and recoloured
to the project's gold ramp. That asset's licence could not be confirmed:
LottieFiles terms vary by author between the Lottie Simple Licence, CC BY with
attribution, and paid, and the source page was behind an account this build
could not read. Rather than ship an unconfirmed licence, it was replaced.
Nothing of it survives — different bean count, geometry, timing, and animation
technology.

Two further animations from the same source were requested and are **not** used:
the success mark and the consent checkbox tick are original SVG in this
repository, drawn to match the site's palette and driven by state rather than by
a timeline.

## The 3D model

`public/models/meridian-pack.glb` is derived from `bag.glb`, a Tripo AI
image-to-3D export supplied for this build (pre-decimated and Draco-compressed
before it reached us). **Only its geometry survives.** The export's own baked
texture — a 4096² basecolor carrying hallucinated label text ("MERII SPECIA",
"IDIAN IALTY", "JASNINE BLUERE", invented body copy) — is discarded by
`scripts/pack-model.mjs` and never reaches the browser. What the visitor sees
printed on the pouch is `public/art/*.png`, projected onto the mesh at load by
`lib/pack-projection.ts`.

Generated-model provenance is worth stating plainly rather than leaving implicit:
the shape is a machine's, the printing is ours.

## Fonts

- **Heebo** — [SIL Open Font License 1.1](https://openfontlicense.org). Carries
  Hebrew and Latin, which is why it serves both display and body: the copy mixes
  scripts inside single lines.
- **JetBrains Mono** — [SIL Open Font License 1.1](https://openfontlicense.org).
  Kickers, the stage label, the pack's spec rows.

Both are self-hosted at build time by `next/font` rather than requested from
Google at runtime, so the running container makes no third-party font request.

The panel sources in `art/` additionally use **Playfair Display** and **Inter**
(both OFL 1.1) at render time only — they are baked into the PNGs and are not
served to visitors.
