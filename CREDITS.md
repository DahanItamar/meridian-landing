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
| `public/art/panel-front.png` | `art/panel-front.html` | Flat front face of the pack. Drawn in CSS and inline SVG. |
| `public/art/panel-back.png` | `art/panel-back.html` | Flat back face. Same. |
| `public/models/meridian-pack.glb` | a Tripo image-to-3D export | Geometry only — see below. |
| the roundel in the nav and footer | `components/brand/Roundel.tsx` | Inline SVG, `currentColor`. |
| `art/bag-source-for-meshy.png` | drawn for this project | The reference the panels were laid out against. |

The reference pack supplied at the start of the project was a real roaster's
packaging. It was **not** used — the artwork was drawn from scratch in the same
design language (matte black pouch, centred cream label band, gold roundel above
it, weight below, warm foil accents) with our own marks, so there is nothing to
strip or licence.

## Third-party animation

`components/brand/BeansLoader.tsx` is **not original work.** It was exported from
LottieFiles as an animated SVG and supplied for this build, then recoloured from
its original browns (`#503932`, `#603813`, `#7f4d35`, `#d4c186`) to this
project's gold ramp. Nothing else about it was changed — the geometry and the
`animateTransform` timings are the author's.

> **The licence is unconfirmed and must be settled before this ships.**
> LottieFiles assets carry different terms depending on the author: some are the
> Lottie Simple Licence, some are CC BY and require attribution by name, and some
> are paid. The source page is
> `app.lottiefiles.com/share/e4c70b4a-7c47-4f77-9ce4-3d0d62c567b9`, which is
> behind an account this build could not read — so neither the author nor the
> licence could be recorded here automatically. Fill both in, or replace the
> asset.

Two other animations from the same source were requested and are **not** used:
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
