# 0001 — Coffee pivot, WebGL hero, Hebrew-only

> Status: proposed · 2026-08-21 (amended same day, see Amendment) · Against spec version 1.2

## Motivation

The spec describes a bilingual landing page for the Meridian M1, a $285 hand grinder, built
around a `next/image` hero and eight stacked sections. None of that is the product any more.
The brand pivoted to specialty coffee, the page was rebuilt twice from Claude Design templates,
and the second rebuild — `Meridian Landing.dc.html`, against a supplied 3D model of the pack —
replaced the hero image with a 440vh pinned WebGL sequence and cut the section count from eight
to four. The page also ships in Hebrew only; the English locale was dropped rather than deferred.

The gap has been widening for four sessions and the chain has been paused at T-08 the whole
time, because resuming would mean building to criteria that describe a page that no longer
exists. This proposal closes it in one pass so `/spec-tasks` can re-cut M1 against something
true.

Two things this deliberately does **not** change: the compliance basis in §13, which survives the
pivot untouched because it was always about collecting an address rather than about what is being
sold; and the subscribe API in §6, which is still unbuilt and still correct.

## Criteria added

| ID | Criterion |
| --- | --- |
| AC-061 | The pinned section shall render a static poster of the pack in its server-rendered markup, and shall mount the WebGL canvas only after first paint. |
| AC-062 | The pinned section shall reserve its full height before the canvas mounts, and mounting the canvas shall cause no layout shift. |
| AC-063 | While the user agent reports `prefers-reduced-motion: reduce`, the pinned sequence shall follow scroll position without damping, and shall come to rest in the same frame the scroll stops. |
| AC-064 | The pinned section shall expose exactly one beat to the accessibility tree and the tab order at a time; a faded beat shall be reachable by neither. |
| AC-065 | The shipped model shall declare no `KHR_draco_mesh_compression` and no mesh-quantization extension. |
| AC-066 | The pack's printed artwork and its model shall each be reproducible from checked-in sources by a single documented command. |
| AC-067 | Every navigation and footer link shall resolve to a section or route that exists. |
| AC-068 | The launch countdown shall compute its target at render time and shall never display a zero or negative interval. |
| AC-069 | The launch countdown shall not announce its per-second changes to assistive technology, and shall expose the remaining time as text that does not update every second. |

AC-061 exists because the pinned section is the first viewport, so its ~227 kB gzip of WebGL and
265 kB of assets land above the fold, where they threaten the total blocking time AC-037 depends
on. AC-065 exists because Draco and quantization each produced a model that loaded without a
single error and then never rendered — an untyped, unlogged failure that cost two sessions, and
a one-line check prevents it recurring.

## Criteria retired

| ID | Reason |
| --- | --- |
| AC-005 | No `en` locale exists. The site serves Hebrew only; `Locale` is a single-member union. |
| AC-006 | A language toggle needs two languages. Nothing to toggle between. |
| AC-012 | No FAQ. The questions it answered are answered by the beans cards and the pinned beats, in the sections the design does have. |
| AC-013 | Keyboard operability of a component that no longer exists. |
| AC-002 | Nothing to redirect. The landing page is served at `/` itself, so a redirect from `/` would be a redirect to itself. |
| AC-029 | No hero image, and no raster image anywhere in the DOM — the pack is WebGL and the roundel is inline SVG. `priority` and lazy-loading have no referent. Replaced by AC-061, which does the same job for the asset that actually blocks. |

Retiring AC-012 and AC-013 removes T-08 from the task list. The chain resumes at what was T-09.

## Section edits

### §2.1 Acceptance Criteria — replace


| ID | Before | After |
| --- | --- | --- |
| AC-001 | …single scrolling route per locale, at `/en` and `/he`. | The site shall render the landing page as a single scrolling route at `/`. |
| AC-008 | …prerender `/en`, `/he`, `/en/privacy` and `/he/privacy`… | The site shall prerender `/`, `/privacy` and `/accessibility` as static HTML at build time. |
| AC-009 | The hero shall present the product name, headline, subheadline, one primary CTA, and the product image within the first viewport at 1280×720 and above. | The pinned section's first beat shall present the product name, a headline, a subheadline and one primary call to action within the first viewport at 1280×720 and above, without requiring a scroll. |
| AC-011 | …hero, social proof, three feature blocks, specification grid, testimonials, FAQ, email capture, footer. | The page shall present its sections in this order: fixed navigation, pinned pack sequence, launch countdown, waitlist capture, footer. |
| AC-014 | When a section first enters the viewport, the site shall play a one-time entrance transition on that section. | When a section below the pinned sequence first enters the viewport, the site shall play a one-time entrance transition on that section. |
| AC-028 | The site shall render every image through `next/image` with explicit `width` and `height`. | The site shall render every raster image in the DOM through `next/image` with explicit `width` and `height`, and shall draw vector marks as inline SVG. |
| AC-037 | …at least 90 for Performance and at least 90 for Accessibility in Lighthouse mobile emulation, for both locales. | The site shall score at least 90 for Performance and at least 90 for Accessibility in Lighthouse mobile emulation. |
| AC-043 | …desktop and mobile captures of both locales under `shots/`. | The repository shall contain desktop and mobile captures under `shots/`. |
| AC-054 | The site shall give every informative image descriptive alternative text and every decorative image an empty `alt` attribute. | The site shall give every informative image descriptive alternative text and every decorative image an empty `alt` attribute, and shall present no information in the WebGL canvas that is not also present as DOM text. |

AC-014's narrowing is the substantive one. The pinned sequence is scroll-locked rather than
entering — it has no "first enters the viewport" moment and no final state to settle into, so the
original wording was unsatisfiable there. AC-063 covers what reduced motion means for it instead.

### §3 Architecture — Components — replace


**Before:**

| Component | Responsibility | Technology |
| --- | --- | --- |
| Motion primitives | A reveal wrapper and a stagger container, both reduced-motion aware. | `motion` (formerly `framer-motion`) |

**After:**

| Component | Responsibility | Technology |
| --- | --- | --- |
| Motion primitives | A reveal wrapper and a stagger container, both reduced-motion aware. Used by the sections below the pinned sequence only. | `motion` (formerly `framer-motion`) |
| Pinned sequence | Measures scroll over its own container and publishes progress. Owns no geometry and no copy. | Client component, `getBoundingClientRect` in rAF |
| Pack stage | The studio: five local lights, a contact blob, and one `useFrame` owning camera, rotation and key light together. | `@react-three/fiber`, code-split, client-only |
| Panel projection | Splits the mesh into front / back / foil groups and fits the flat artwork onto the printed faces. | Pure TypeScript over `three` buffer geometry |
| Choreography | The keyframe table. Every camera move, zoom, rotation and light position on the page is one row in it. | Pure TypeScript, no React |

**Reason:** the hero is no longer an image with a reveal on it; it is a scene, and the four rows
added are the seams that were load-bearing enough to cost a session each when they were implicit.
Splitting choreography from stage is what lets the sequence be re-timed without touching WebGL.

### §3 Architecture — Decisions — add


```
Hand-rolled scroll measurement, not a scroll library
Because: progress is measured from getBoundingClientRect every frame, never accumulated — an
  accumulated delta drifts the moment anything else on the page changes height, and this
  sequence is four screens long
Instead of: a scroll-linked animation library — correct when there are many independent
  scroll effects; there is exactly one here, and it needs to drive WebGL rather than CSS
Revisit if: a second scroll-driven surface appears on the page

Plain glTF only — no Draco, no mesh quantization
Because: both produced a model that loaded without a single error and then never rendered.
  drei suspends on useGLTF and the boundary never resolves — no exception, no console message,
  just a lit scene with no product in it. The failure is invisible in CI and obvious only to a
  human looking at the page
Instead of: Draco, which would take the shipped model from 81 KB to roughly 40 KB — a saving
  worth less than a class of bug that cannot be caught by the verify command
Revisit if: the loader stack changes and the boundary behaviour can be demonstrated to resolve

The model's own texture is discarded, and the artwork is projected on
Because: the supplied image-to-3D exports carry hallucinated label text — "MERII SPECIA",
  "JASNINE BLUERE", invented body copy across a fragmented atlas. Beats 2 and 3 push the
  camera close enough to read it. Geometry from the generator, printing from us
Instead of: regenerating the model until the label is right — image-to-3D does not produce
  legible type at any seed, and the panels have to be editable as copy in any case
Revisit if: a generator ships that can hold a typeface
```

**No decision is reversed by this proposal.** The Framer Motion decision narrows in scope but
survives: constitution standing decision 3 still holds, and the reveal primitives it describes are
what AC-014 now attaches to.

### §5 Data Models — replace


**Before:** `Locale = 'en' | 'he'`, and a `Content` interface carrying `hero`, `proof`,
`features`, `specs`, `testimonials`, `faq`.

**After:**

```ts
// content/types.ts

export type Locale = "he";

export interface Row { label: string; value: string }

/** One per entry in SCROLLY_STEPS. A beat carries at most one of rows / ctas / buy. */
export interface Beat {
  kicker: string;
  title: string;
  body?: string;
  rows?: Row[];
  ctas?: { primary: string; secondary: string };
  buy?: { label: string; note: string };
}

export interface Content {
  meta:     { title: string; description: string };
  brand:    { name: string; tagline: string };
  nav:      { beans: string; waitlist: string };
  scrolly:  { beats: Beat[]; stageLabel: string; hint: string };   // exactly 4 beats
  beans:    { kicker: string; heading: string; cards: BeansCard[] };   // exactly 3 cards
  waitlist: Waitlist;
  footer:   Footer;
}

export interface BeansCard { kicker: string; title: string; rows: Row[] }

export interface Waitlist {
  kicker: string;
  heading: string;
  sub: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  submit: string;
  /** Consent wording. Its version is recorded on the contact — AC-045. */
  consent: string;
  errors: { name: string; email: string };
  success: { heading: string; body: string };
  footnote: string;
}

export interface Footer {
  blurb: string;
  columns: { heading: string; links: string[] }[];
  copyright: string;
  legal: string[];
  /** AC-035. The brand, the lot and the figures are invented. */
  disclosure: string;
}
```

**Reason:** every field in the old contract described a section that no longer exists. `Locale`
stays a union rather than becoming a bare string so that adding a second locale remains a content
file plus one entry in `lib/locale.ts` — the machinery is the part worth keeping, and rebuilding
the routing to restore English later would cost far more than the single-member union costs now.

The choreography adds a second contract that is not data but is load-bearing in the same way:
`SCROLLY_STEPS`, the `KEYFRAMES` table and `content.scrolly.beats` are zipped by index, so all
three have the same length or the sequence desynchronises silently.

### §6 Interfaces — Routes — replace


**Before:**

| Route | Renders | Generation |
| --- | --- | --- |
| `/` | redirect → `/en` | static redirect (AC-002) |
| `/[locale]` | the landing page | `generateStaticParams` → `en`, `he` (AC-008) |
| `/[locale]/privacy` | the privacy page | static (AC-027) |

**After:**

| Route | Renders | Generation |
| --- | --- | --- |
| `/` | the landing page | static (AC-001, AC-008) |
| `/privacy` | the privacy page | static (AC-027) |
| `/accessibility` | the accessibility statement | static (AC-049) |
| `/api/health` | `{ ok: true }` | dynamic, no upstream (AC-040) |

The accessibility route was always required by AC-049 and was never in this table. Adding it here
is a correction, not a new commitment.

### §6 Interfaces — add


The one boundary this change introduces is not an HTTP one. `@react-three/fiber` is a separate
React reconciler, so context does not cross between the page and the scene, and passing scroll
progress through state would re-render the canvas on every scroll frame — which is the exact cost
`useFrame` exists to avoid.

```ts
// lib/scroll-store.ts — written by the pinned section, read by the stage each frame

export const scrollState: {
  /** 0…1 over the pinned container. Measured, never accumulated. */
  progress: number;
  /** False once the section leaves the viewport; the stage stops drawing. */
  visible: boolean;
};
```

```ts
// lib/scrolly-config.ts — the choreography, consumed by both trees

export function sample(t: number, narrow?: boolean): Frame;   // camera, target, fov, rotY, rotX, light
export function fadeWindow(index: number, p: number): number; // 0…1 opacity for beat `index`
export function activeStep(p: number): number;                // which beat is holding
export function washX(p: number): number;                     // the DOM wash, mirroring the same times
```

A single mutable module-scoped object is a deliberate choice and not an oversight: it is read
inside an animation loop that must not allocate, and it is written by exactly one component.

### §7 Core Flows — Flow A — replace


**Before:** redirect to `/en`; the LCP element is the hero image marked `priority`; each section's
`Reveal` observes its own intersection.

**After:**

1. Visitor opens `https://meridian.<domain>` on a phone → nginx terminates TLS, proxies to the
   container → redirect to `/he`.
2. Container returns prerendered HTML. The LCP element is the first beat's headline, which is
   server-rendered text; the pinned section shows its poster frame at its reserved height
   (AC-061, AC-062).
3. After first paint the WebGL chunk loads and the canvas mounts over the poster. Nothing moves.
4. Visitor scrolls → the pinned section measures its own `getBoundingClientRect` each frame and
   publishes progress; the stage samples the keyframe table at that progress; beats cross-fade,
   and only the held beat is in the accessibility tree (AC-064).
5. Past the sequence, the sections below play their one-time entrance transitions (AC-014).
6. If the OS reports reduced motion, the sections below are already in their final state and the
   stage follows scroll without damping (AC-015, AC-063).

**Satisfies:** AC-001, AC-002, AC-008, AC-009, AC-011, AC-014, AC-015, AC-061, AC-062, AC-063, AC-064
**Failure branches:** no WebGL, or a lost context → the poster frame stays and every word is still
DOM text (AC-054). A slow chunk delays the pack, never the headline.

### §7 Core Flows — Flow C — remove


**Removed:** Flow C — Language switch.

**Reason:** the flow's first step is "visitor on `/en` activates the toggle", and neither `/en` nor
the toggle exists. AC-004 and AC-007, which this flow also satisfied, are satisfied by Flow A
instead — the document is `rtl`/`he` from the first byte rather than after a navigation, which is
strictly the safer of the two, because no component ever observes a direction change at runtime.

### §8 Edge Cases & Failure Modes — replace


**Before:** | Hero image slow on 3G | Layout shift, poor LCP | Explicit dimensions, `priority`, modern format | AC-028, AC-029 |

**After:** | WebGL bundle and model slow on 3G | Blank first viewport where the headline should be | Poster frame in server-rendered markup; canvas mounts after first paint; section reserves its height | AC-061, AC-062 |

**Reason:** the row described an asset that no longer exists. The same failure — a slow asset in
the first viewport — now arrives through the WebGL stage, where it is worse, because an
unpainted canvas is blank rather than merely unstyled.

### §8 Edge Cases & Failure Modes — add


| Case | Consequence if unhandled | Handling | AC |
| --- | --- | --- | --- |
| Four beats stacked in one sticky container | A screen reader announces four headlines at once; a keyboard user tabs into invisible CTAs | Faded beats carry `aria-hidden` and `inert` | AC-064 |
| WebGL unavailable or context lost | Blank first viewport, no headline, no CTA | Poster frame stays; the copy is DOM and never depended on the canvas | AC-061, AC-054 |
| Model shipped with a compression extension | Loads without error and never renders; nothing in `verify` catches it | Build step writes plain glTF and the extension list is asserted | AC-065 |
| Footer links to pages not yet built | Visitor clicks נגישות and stays where they are | Links resolve to an existing route, or the entry is not rendered | AC-067 |
| Sequence left running off-screen | A WebGL loop and a rAF loop burn battery behind three screens of text | `IntersectionObserver` gates both | — |

### §10 Build Order — replace


**Before:** M3 — Hebrew and RTL, four tasks: `content/he.ts`, `generateStaticParams`, language
toggle, RTL sweep.

**After:** **M3 is dissolved.** Hebrew is the only locale and is already built; the toggle is
retired with AC-006; the RTL sweep folds into M1, where every section is written in Hebrew from
the first line rather than translated into it afterwards.

**Reason:** M3 existed to add a second language to an English page. There is no English page.

### §10 Build Order — M1 — replace


**Before:** thirteen tasks ending at deploy, including the FAQ accordion, the `next/image` pass
and the hero image.

**After:** M1 keeps its shape — a real URL someone can be sent — with these differences:

- **removed:** FAQ accordion (AC-012, AC-013 retired); hero and imagery tasks (AC-029 retired,
  AC-028 narrowed to a rule with nothing currently to apply it to)
- **added:** pinned sequence and pack stage; poster frame and deferred mount (AC-061, AC-062);
  beat accessibility (AC-064); model and artwork pipeline (AC-065, AC-066); heading-level fix
  (AC-032, see Impact); footer link resolution (AC-067)
- **unchanged:** scaffold, content module, locale shell, redirect, health route, Dockerfile,
  nginx, deploy

### §11 Assumptions — replace


| # | Before | After |
| --- | --- | --- |
| 1 | The brand is "Meridian" and the product is the Meridian M1, a hand grinder at $285 USD. | The brand is "Meridian" and the product is a 1 kg bag of whole-bean specialty coffee, unpriced and pre-launch. Nothing on the page is for sale; the only conversion is the launch list. |
| 2 | Product and lifestyle photography comes from Unsplash under its license, credited in `CREDITS.md`. | There is no photography. Every asset is original: the pack artwork is rendered from HTML sources in `art/`, the roundel is inline SVG, and the model's geometry comes from a supplied image-to-3D export whose own texture is discarded. `CREDITS.md` records the generated-model provenance. |
| 4 | Hebrew copy is machine-drafted and needs your review before **M3** ships. | Hebrew copy is machine-drafted and needs your review before **M1** ships. It is now the only copy on the site, so this moved from a late gate to a launch gate. |
| 6 | Prices display in USD only, in both locales. | No price is displayed. Currency handling is out of scope until something is sold. |

**Reason for 1 and 2:** both describe the hand-grinder product and its stock imagery, and a reader
taking either at face value would build the wrong page. Assumption 4's milestone reference is a
consequence of dissolving M3, not a change of position — the review was always owed.

### §12 Open Questions — replace


**Before:** *Hebrew copy review — blocks: M3 deploy · needed by: end of M3. Drafting proceeds
without it; only the deploy waits.* … *None of these block M1.*

**After:** *Hebrew copy review — **blocks: M1 deploy** · needed by: end of M1. Every string on the
site is Hebrew and none has been read by a native speaker. Building proceeds; only the deploy
waits.*

*The Resend and Umami questions still block M2 only. **The Hebrew review now blocks M1.***

**Reason:** dissolving M3 moved the only Hebrew gate onto the first milestone. Leaving the old
line in place would have told the next session that nothing blocks M1, which is no longer true.

### Amendment — the sections moved again

Written hours after the rest of this proposal, during a copy and layout pass, and
folded in here rather than raised as 0002 because nothing above has shipped yet.
A second ordinal against an unmerged proposal would make `spec-drift` reconcile
two documents that were never separately true.

**The beans cards are gone.** The three-card section that repeated the sequence's
own rows was removed, and a launch countdown took its place. AC-011's replacement
above is written for the page as it now stands.

That costs something worth stating: the tasting notes and the origin now exist
only inside the pinned sequence. A visitor who arrives from search and does not
scroll through three beats never sees them. It was the cards' job to catch that
visitor, and no criterion requires it any more — if that turns out to matter, it
comes back as a new proposal rather than quietly.

**The sequence is three beats, not four.** The launch beat and its buy button
were cut; the waitlist section below says the same thing with a real form under
it. `SCROLLY_STEPS` and the keyframe table were re-cut to thirds and the pinned
section shortened from 440vh to 350vh. The pack also stops turning at the back
panel rather than completing the rotation, because completing it passed through
the gusset — a dark sliver with almost no print on it — under settled copy.

**The navigation is one link, and the hero is one button.** The launch section
and the form read as one destination, so every second entry pointed at the same
place in different words — in the nav and again in the first beat. AC-009 above
is written for one primary call to action rather than two.

**The `[locale]` segment is gone and the site is served at `/`.** It existed so
`lang` and `dir` could be per-locale, and with one locale it bought a `/he`
prefix on every URL, a redirect from `/`, a `params` promise threaded through
two files, and a lookup that could only ever return one answer. AC-001 and
AC-008 above are written for the root path, and AC-002 is retired with the
redirect it described.

Restoring a second language means restoring the segment, and that cost was
weighed rather than overlooked. The alternative was carrying the machinery
indefinitely for a language nobody has asked for — and unused generality
survives precisely because removing it feels like losing something.

AC-068 and AC-069 exist because the countdown is a demo-page fixture that has to
survive unattended: a launch page whose counter has run out is worse than one
with no counter, and a per-second live region makes a page unusable with a screen
reader. Both are cheap to state and impossible to notice once broken.

## Impact

- **Milestones affected:** M1 (re-cut, and now gated on the Hebrew review), M3 (dissolved), M4 (AC-014 narrowed, AC-037 single locale)
- **Criteria added:** 9 · **retired:** 6 · **amended:** 10 · net 60 → 63 active
- **No change to §9 Security** — no new data is collected, stored or transmitted. The stage is
  static assets and client-side arithmetic.
- **No change to §13 Compliance Basis.** AC-044, AC-045 and AC-046 remain active and remain
  unbuilt: the design has no consent checkbox and no slot for one, so the form as it stands is
  not compliant — it is merely inert, because it has no endpoint. This is the single most
  expensive thing in the repo to get wrong (statutory damages under Communications Law § 30A are
  per message) and it must land before the form is wired to anything.
- **Sections edited:** §2.1, §3 Components, §3 Decisions, §5, §6 Routes and Interfaces, §7 Flows A and C, §8, §10, §11, §12
- **No other open proposals.** `docs/changes/` contains only this one.

### Three criteria the current implementation violates

Found while writing this, all pre-existing rather than introduced by it. They are tasks for
`/spec-tasks`, not further spec changes:

| AC | Current state |
| --- | --- |
| AC-032 | The built page contains **four `<h1>` elements**, one per beat. Beats 2–4 should be `<h2>`. |
| AC-067 | **Ten footer and column links point at `#top`.** Some name pages that do not exist yet. |
| AC-052 | Footer and column links are 13.5px text with no padding, so their hit target is under 24×24. |

### One dependency to reconcile

`motion` is in `package.json` and imported nowhere. Under AC-014 as amended it earns its place
again once the reveals below the sequence are built — but until that task lands it is weight in a
bundle that AC-037 is measured against, which constitution principle 6 is written against.
