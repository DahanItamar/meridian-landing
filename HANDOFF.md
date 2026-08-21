# Handoff — Meridian Specialty landing page

> Last updated 2026-08-21 · project 01 of the portfolio · repo: `DahanItamar/meridian-landing`
>
> **The page was rebuilt again, from `Meridian Landing.dc.html`** (design project
> `cfb5f708`), against a supplied Tripo 3D model. The WebGL hero is back and is
> now the page's whole first act. Read "What is actually built" before anything
> else — the ten-section video design that was here yesterday is gone.

## Where this stopped

**M2 is 7 of 12. Ten of its sixteen criteria are closed.** The remaining five
tasks are blocked on things only you can supply, not on work.

| | |
| --- | --- |
| Done | M1 complete · spec v2.0 · refactor run 0001 · M2 T-01…T-05, T-09, T-10 |
| Next | T-06 the moment a Resend key exists |
| Blocked | T-06/07/08 on the key · T-11/12 on three of the five blank values |

`npm run verify` green, `npm run check:logical` green.

**The form posts for real.** With no Resend key configured the route answers
`502 upstream_failed` and the visitor gets the retry path with their input
intact — which is AC-041's specified behaviour, not a placeholder. Nothing is
sent anywhere, so the § 30A obligations still do not bind.

**Verify against the standalone server, not `next start`.** Since `output:
standalone` landed, `next start` prints a warning and is unsupported. The
container runs `node .next/standalone/server.js`, and that path needs
`.next/static` and `public` copied beside it — the Dockerfile does this, a local
run does not:

```
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
cd .next/standalone && PORT=3000 node server.js
```

Everything in M2 was verified that way after the discovery. It is also how the
Dockerfile's two extra COPY lines were confirmed — that path had never been run
until this session.

**`NEXT_PUBLIC_UMAMI_*` are inlined at build time.** Building with them set
bakes the URL into the client bundle, so a test value has to be rebuilt out
again. It was.

## AC-037 — measured, and why the number cannot be trusted yet

Lighthouse 12.8.2, mobile emulation, against the standalone build:

| Route | Performance | TBT | main-thread "Other" |
| --- | ---: | ---: | ---: |
| `/privacy` — same chunks, no canvas | **98** | 20 ms | 55 ms |
| `/` — with the canvas | **63** | 3,360 ms | 7,677 ms |

Accessibility, Best Practices and SEO all scored **100** on `/`. AC-037's
accessibility half is therefore settled; its performance half is not.

**The 63 is an artefact of the harness, not a finding about the site.** Headless
Chrome has no GPU, so SwiftShader rasterises WebGL on the CPU — the same CPU
Lighthouse is throttling 4× — and it lands in "Other", which is 140× larger on
the page with a canvas than on the page without one. The JS itself is cheap:
`page.js` reports 7,455 ms total against **32 ms of parsing**, and total parse
across every chunk is around 700 ms.

**To settle it:** run Lighthouse in Chrome DevTools on a real machine with a GPU,
which is what constitution standing decision 5 already requires before deploy.
Do not re-run it headless and record the result — that number will always fail
and it will always be wrong.

One genuine opportunity did surface, unrelated to the GPU: **"serve images in
next-gen formats", 540 ms.** That is the two poster PNGs in `public/art/`.
Converting them to WebP or AVIF is real and cheap, and it is a change rather than
a fix — nothing in the spec requires a format.

## The 0001 merge was done by hand, and it had one defect

`/spec-drift` is not installed, so proposal 0001 was merged into `SPEC.md` by hand
this session. One reference was missed: §5's `SubscribeRequest.locale` still named
the `Locale` type after 0001 deleted it. Found while decomposing M2, corrected to
the literal `"he"` — the field itself stays because AC-045 requires the locale on
the Resend contact.

Worth knowing because it is the shape of the next error too: a hand merge catches
the sections it edits and misses the ones that merely *reference* them. If drift
is ever installed, run it once against v2.0 before trusting the spec.

## The legal pages, and what is still blank in them

`/privacy` and `/accessibility` are live, in Hebrew, and their notice states the
truth: fictional brand, portfolio demonstration, nothing collected, form
transmits nothing. That is the accurate posture rather than a hedge, which is
why neither page is marked as an unfinished draft.

**Five values are still unfilled**, and they are recorded here rather than on the
pages because they bind only once real addresses are collected:

| Value | Needed for |
| --- | --- |
| Contact email | both pages — Cloudflare email routing, not yet set up |
| Phone number | accessibility statement; reg. 35 expects a phone route, not only email |
| Registered address | privacy policy, controller identity |
| Retention period | privacy policy §3 |
| Author + licence of `BeansLoader.tsx` | CREDITS.md — LottieFiles asset, terms unconfirmed |

Filled already: Itamar Dahan (controller and accessibility coordinator),
Meridian (service name), 21 August 2026 (effective date).

**The Hebrew in those two documents has not been read by a native speaker**, and
it is the place where that matters most — a badly worded legal sentence is
exposure rather than a typo.

## Landmines — every one of these cost real time

**Draco and mesh quantization both load without error and never render.** drei
suspends on `useGLTF` and the boundary never resolves — no exception, no console
message, just a scene with lights and no product. Plain glTF only. This is why
`scripts/pack-model.mjs` has a size budget instead of a compression step.

**`drei`'s `<Environment preset>` fetches an HDRI from a third-party CDN.** It
shared a Suspense boundary with the model, so a stalled download took the product
down with it. There is no `<Environment>` on this stage at all now — five
discrete lights, all local. Keep it that way.

**One `useFrame` owns the frame.** A second hook driving the camera beside the
one moving the pack stopped the pack rendering while every other object kept
drawing. Camera, rotation and key light are set together in `Studio`.

**Never damp with an infinite constant.** `-Infinity * 0` is `NaN` on the first
frame, where `delta` is `0`, and it propagates silently into every transform.
The first frame assigns; later frames damp.

**`position.push(...bigArray)` throws RangeError.** The projection emits hundreds
of thousands of floats per group and spread passes every element as an argument.
`projectPanels` concatenates into a preallocated `Float32Array`; the design's
original JS did not, which is why it never survived a full-resolution mesh.

**Custom properties cannot be defined in terms of themselves.**
`--font-body: var(--font-body), sans-serif` computes to invalid and the family
drops silently — the page renders in the UA serif and nothing in the build says
why. The `next/font` variables are named for the face (`--font-heebo`), the
theme tokens for the role.

**`next dev` and `next build` share `.next`.** Running a build while the dev
server is up corrupts its manifests and produces a 500 with a
`segment-explorer-node` error. Stop one before running the other. A backgrounded
dev server survives the shell that started it — check for strays on port 3000
before blaming the code. `rm -rf .next` clears it.

**Headless Chrome screenshots need `--enable-unsafe-swiftshader`**, and the page
must be served over HTTP — `file://` blocks the loader's `fetch` of the GLB, and
you get a blank canvas with no error. Even then WebGL renders approximately;
check transmission and fine specular on a real GPU.

**The sharp/`@gltf-transform` conflict no longer applies here.** Importing
`@gltf-transform/functions` still corrupts libvips' global state on this
platform, but nothing in this repo encodes an image any more, so the model
pipeline is one process. Do not reintroduce sharp into it.

## Compliance

`SPEC.md` §13 records the ACSM audit: markets Israel + EU, modules 1/3/4/6/8.

**The waitlist form collects nothing.** `WaitlistSection.tsx` validates and shows
the success state locally; there is no endpoint, no storage and no network
request, which is what keeps the items below from binding today. They bind the
moment anyone wires it up:

- Communications Law § 30A needs an **unticked, separable consent box**, a
  recorded consent version, and double opt-in. The design has none of the three
  and no slot for them — the form as drawn is not compliant, it is merely inert.
  Statutory damages are per message.
- Resend is a US transfer; its DPA must be signed.
- nginx logs client IPs by default. That is personal data — disable it or state
  a retention period.
- Israeli Regs. 5773-2013 reg. 35 requires an accessibility statement, in Hebrew.
  The footer links to one that does not exist yet.

Three items need a human, not a spec: the Amendment 13 registration threshold
(counsel), the Resend DPA, and native-speaker review of the Hebrew — both the
legal copy and the page copy, which is the design's own and has not been read by
a native speaker.

## Known follow-ups

- **The FAQ has no Hebrew copy** (see above).
- **Beat 4's two-line CTA on a phone** sits over the pack's roundel. Legible —
  the buttons are opaque — but the composition is tighter than it should be.
- **The scrolly is 440vh with no reduced-motion shortening.** Reduced motion
  removes the damping (`PackStage` snaps instead of gliding) and CSS kills the
  transitions, but someone who wants less motion still has four screens to
  scroll. Shortening the slices under the query is the obvious next move.

## Running it

```
npm install
npm run dev            # http://localhost:3000 -> /he
npm run verify         # next lint && next build — the only command spec-implement runs
npm run check:logical  # AC-007; lint cannot see Tailwind class names

node scripts/panels.mjs                    # re-render the pack artwork
node scripts/pack-model.mjs "<raw.glb>"    # re-derive the model
```
