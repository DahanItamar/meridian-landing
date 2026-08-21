# Handoff — Meridian Specialty landing page

> Last updated 2026-08-21 · project 01 of the portfolio · repo: `DahanItamar/meridian-landing`

## Where this stopped

**Stage 4 of the six-stage spec chain — `/spec-implement`, milestone M1, paused before T-08.**

| | |
| --- | --- |
| Done | T-01 … T-07, each verified against its cited criteria and committed separately |
| Next | **T-08** — FAQ accordion, closes AC-012 and AC-013 |
| Then | T-09 capture markup · T-10 footer · T-11 `/api/health` · T-12 Dockerfile · T-13 nginx and deploy |

`npm run verify` is green. The page builds, renders, and throws nothing.

## Read this before writing any code

**The spec no longer describes the product.** `SPEC.md` is still the hand-grinder
spec: AC-009, AC-028 and AC-029 describe a `next/image` hero with explicit
dimensions that does not exist any more, and AC-037's Lighthouse target has never
been measured against a three.js bundle. `TASKS.md` M1 has the same problem — its
remaining task titles and file lists predate the pivot.

Resuming at T-08 against those criteria means building to a page that is gone,
and `/spec-drift` will later report every one of them as a regression. The
sequence that unblocks cleanly:

```
1. /spec-architect   delta mode — change proposal for the coffee pivot and the
                     WebGL hero. Do not edit SPEC.md by hand; that is the exact
                     move drift exists to catch.
2. /spec-tasks       re-cut M1 against the amended criteria
3. /spec-implement   resume at T-08
```

## What is actually built

A scroll-driven hero over five beats, then a bento spec section and testimonials.

- `components/HeroScrolly.tsx` — 520vh container with a sticky viewport. Framer
  Motion `useScroll` writes progress into `lib/scroll-store.ts`; copy beats fade,
  lift and blur across their own slices.
- `components/three/HeroScene.tsx` — the canvas. Key, fill, two warm rims, a
  bounce, filmic tone mapping, and a local `<Environment>` built from
  `<Lightformer>`s.
- `components/three/BagModel.tsx` — keyframes as `[progress, value]` data, damped
  per frame. Also drives the camera dolly.
- `components/three/BagAsset.tsx` — loads the pack and normalises it.
- `app/globals.css` — the whole palette. Every colour pair is measured; the
  numbers are in the comment block.

**The 3D model is deliberately absent.** It is being produced in Meshy outside
this repo. `MODEL_PRESENT` in `BagModel.tsx` is `false`; flip it to `true` once a
`.glb` sits at `public/models/coffee-bag.glb`. `art/README.md` has the loader
contract and the optimisation scripts.

## Landmines — every one of these cost real time

**`sharp` and `@gltf-transform/functions` cannot share a process.** Importing the
latter (or `draco3d`) corrupts libvips' global state, and every subsequent image
encode fails with `colourspace: parameter space not set`. This is why the GLB
pipeline is two scripts and two processes. Do not merge them.

**Draco and mesh quantization both load without error and never render.** drei
suspends on `useGLTF` and the boundary never resolves — no exception, no console
message, just a scene with lights and no product. Plain glTF only.

**`drei`'s `<Environment preset>` fetches an HDRI from a third-party CDN.** It
shared a Suspense boundary with the model, so a stalled download took the product
down with it. The environment is local now, and the model has its own boundary.
Keep it that way.

**The camera dolly must live inside the model's own `useFrame`.** A sibling
component driving the camera stops the pack rendering while every other object
keeps drawing. `camera.lookAt()` does the same. Position only.

**Never damp with an infinite constant.** `-Infinity * 0` is `NaN` on the first
frame, where `delta` is `0`, and it propagates silently into every transform. The
first frame assigns; later frames damp.

**`next dev` and `next build` share `.next`.** Running a build while the dev
server is up corrupts its manifests and produces a 500 with a
`segment-explorer-node` error. Stop one before running the other.

**Headless Chrome screenshots need `--enable-unsafe-swiftshader`**, and even then
WebGL renders approximately — transmission and fine specular work cannot be
judged from them. Check on a real GPU.

## Compliance

`SPEC.md` §13 records the ACSM audit: markets Israel + EU, modules 1/3/4/6/8.
The parts that bind before any real address is collected:

- Communications Law § 30A needs an unticked separable consent box, a recorded
  consent version, and double opt-in. Statutory damages are per message.
- Resend is a US transfer; its DPA must be signed.
- nginx logs client IPs by default. That is personal data — disable it or state a
  retention period.
- Israeli Regs. 5773-2013 reg. 35 requires an accessibility statement, in Hebrew.

Three items need a human, not a spec: the Amendment 13 registration threshold
(counsel), the Resend DPA, and native-speaker review of the Hebrew legal copy.

## Assets and licensing

Every image in this repo is original work made for the project. The reference
pack supplied at the start was a real roaster's packaging and was **not** used —
`art/bag-source-for-meshy.png` was drawn from scratch in the same design
language. `CREDITS.md` covers what remains.

## Running it

```
npm install
npm run dev        # http://localhost:3000 -> /en
npm run verify     # next lint && next build — the only command spec-implement runs
npm run check:logical   # AC-007; lint cannot see Tailwind class names
```
