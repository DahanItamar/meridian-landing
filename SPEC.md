# 01 — Meridian Landing Page — Technical Spec

> Status: Draft · 2026-08-22 · Spec version 3.2
> Merged: 0001 — coffee pivot, WebGL hero, Hebrew-only · 0003 — drop the email pipeline ·
> 0004 — retire the marketing-message criterion · 0005 — accessibility menu ·
> 0006 — Cloudflare in front of the origin
> Compliance basis: ACSM modules 1, 3, 4, 6, 8 · markets Israel + EU · see §13
> Governed by `docs/CONSTITUTION.md` v1.3

## 1. Problem & Users

Someone who has moved past supermarket coffee finds that the bag on the shelf says almost
nothing — no roast date, no farm, no process — and that the roasters who do say those things are
hard to find and harder to trust. They arrive from an Instagram post or a friend's link, on a
phone, curious rather than convinced, and they need to understand within one scroll what is in
this bag and why it is different from the one they already have. Today they hit a shop page with
a product grid and no story, and they close it.

**Primary user:** a home coffee drinker, 25–45, brewing espresso or filter daily, arriving on
mobile from a social link, willing to pay more for something they can trace.
**Success looks like:** the visitor reaches the launch list with the lot understood, and joins it
without having to go elsewhere to find out what anaerobic processing means.

**Secondary purpose:** this is portfolio project 01. It must also demonstrate — visibly, to a
prospective client — bilingual RTL layout, a form that genuinely works, motion that respects
reduced-motion, and a ≥90 Lighthouse score, running on infrastructure you own.

## 2. Scope

### In scope

- A single scrolling landing page for one fictional product, in English and Hebrew
- Language toggle with full RTL layout inversion
- Eight sections: hero, social proof, three feature blocks, specification grid, testimonials, FAQ,
  email capture, footer
- A working capture form — validated, rate-limited, honeypot-screened — that stores and transmits nothing
- A privacy page, required because real addresses are collected
- Scroll-triggered entrance motion, disabled under `prefers-reduced-motion`
- Self-hosted cookieless analytics
- A Dockerfile and the nginx server block needed to run it on a subdomain
- Responsive from 320px to 2560px
- Desktop and mobile captures in `shots/` for the portfolio shell

### Explicitly out of scope

- **Checkout, cart, payment** — that is projects 02 and 05. The CTA ends at the launch list.
- **A CMS** — content is typed modules in the repo. A client-editable site is a different product.
- **Multiple products or a catalog** — one product, one page.
- **User accounts, login, order history** — no authenticated surface exists.
- **Dark mode** — reserved for project 03, where a corporate palette makes it a real design decision
  rather than a demo feature.
- **A/B hero variants** — deferred; revisit once 01 is live.
- **Any locale but Hebrew** — English was dropped by 0001 along with the `[locale]` segment.
  Restoring a second language means restoring that segment; the content contract itself is
  already the shape a second module would satisfy.
- **Deploying or operating Umami itself** — it is shared infrastructure across all five projects and
  is set up once, outside this repo. This spec only consumes it.
- **CI/CD** — deployment is a documented manual `docker build` and `docker run` for now. An action
  that builds on push is a good idea and belongs in a later change proposal.
- **A blog, press page, or About page** — a landing page has one job.
- **Israeli database registration** — Amendment 13, in force 14 August 2025, narrowed registration
  to data-trading databases, public bodies, and sensitive data at very large scale. A launch list is
  none of these. See §13; confirm with counsel rather than relying on this line.
- **Cancellation and continuing-transaction obligations** (Consumer Protection Law §§ 13C–13G) —
  no subscription, no payment and no continuing transaction exists here.

### 2.1 Acceptance Criteria

| ID | Criterion |
| --- | --- |
| AC-001 | The site shall render the landing page as a single scrolling route at `/`. |
| ~~AC-002~~ | **Retired** by 0001 — the landing page is served at `/` itself, so a redirect from `/` would be a redirect to itself. |
| AC-003 | The site shall render every user-facing string from a locale content module, and no component shall contain a hard-coded user-facing string. |
| AC-004 | While the active locale is `he`, the site shall set `dir="rtl"` and `lang="he"` on the `html` element. |
| ~~AC-005~~ | **Retired** by 0001 — no `en` locale exists. The site serves Hebrew only. |
| ~~AC-006~~ | **Retired** by 0001 — a language toggle needs two languages. |
| AC-007 | The site shall express all directional spacing, alignment and positioning with CSS logical properties. |
| AC-008 | The site shall prerender `/`, `/privacy` and `/accessibility` as static HTML at build time. |
| AC-009 | The pinned section's first beat shall present the product name, a headline, a subheadline and one primary call to action within the first viewport at 1280×720 and above, without requiring a scroll. |
| AC-010 | When the primary CTA is activated, the site shall scroll to the email capture section and move keyboard focus to its email input. |
| AC-011 | The page shall present its sections in this order: fixed navigation, pinned pack sequence, launch countdown, waitlist capture, footer. |
| ~~AC-012~~ | **Retired** by 0001 — no FAQ. The questions it answered are answered by the pinned beats and the sections below them. |
| ~~AC-013~~ | **Retired** by 0001 — keyboard operability of a component that no longer exists. |
| AC-014 | When a section below the pinned sequence first enters the viewport, the site shall play a one-time entrance transition on that section. |
| AC-015 | While the user agent reports `prefers-reduced-motion: reduce`, the site shall render all sections in their final state and play no entrance transition. |
| AC-016 | When the user submits the email form with a syntactically valid address, the client shall disable the submit control and render a pending state until the request settles. |
| AC-017 | When the subscribe request succeeds, the site shall replace the form with a confirmation message in the active locale. |
| AC-018 | If the submitted address is syntactically invalid, then the client shall render an inline validation message and shall issue no network request. |
| AC-019 | If the subscribe request fails or times out, then the site shall render an error message, retain the entered address, and permit a retry. |
| ~~AC-020~~ | **Retired** by 0003 — no Resend call to time out. |
| AC-021 | `POST /api/subscribe` shall respond `200` with `{ ok: true }` on success, and a 4xx or 5xx status with `{ ok: false, error: <code> }` otherwise. |
| AC-022 | If the honeypot field is non-empty, then the subscribe route shall respond `200` and shall take no further action. |
| AC-023 | If more than 5 requests carry the same client IP within 60 seconds, then the subscribe route shall respond `429`. |
| ~~AC-024~~ | **Retired** by 0003 — no list to be already on. Membership cannot be disclosed by a route that holds none. |
| ~~AC-025~~ | **Retired** by 0003 — there is no Resend key, so this is vacuously true forever. A future secret needs its own criterion, not this one revived. |
| AC-026 | The email capture section shall display a consent notice naming the purpose of collection and linking to the privacy page, in the active locale. |
| AC-027 | The site shall serve a privacy page stating what the form collects, that the address is neither stored nor transmitted, and that the brand and the product are a portfolio demonstration. |
| AC-028 | The site shall render every raster image in the DOM through `next/image` with explicit `width` and `height`, and shall draw vector marks as inline SVG. |
| ~~AC-029~~ | **Retired** by 0001 — no raster image in the DOM at all. Replaced by AC-061, which does the same job for the asset that actually blocks. |
| AC-030 | Every interactive element shall present a visible focus indicator with at least 3:1 contrast against its adjacent background. |
| AC-031 | All body text shall meet a contrast ratio of at least 4.5:1 against its background. |
| AC-032 | Each page shall contain exactly one `h1` and a heading hierarchy with no skipped levels. |
| AC-033 | The site shall load the Umami tracking script and shall set no cookies. |
| AC-034 | When a subscribe request succeeds, the client shall record a Umami event named `subscribe`. |
| AC-035 | The footer shall state that the site is a fictional portfolio demonstration and that the brand, testimonials and statistics are invented. |
| AC-036 | `npm run verify` shall run `next lint && next build` and shall exit non-zero on any lint error or type error. |
| AC-037 | The site shall score at least 90 for Performance and at least 90 for Accessibility in Lighthouse mobile emulation. |
| AC-038 | The Docker image shall build from the repository root with no arguments beyond build-time public env vars, and shall run as a non-root user. |
| AC-039 | The container shall listen on the port given by `PORT`, defaulting to 3000. |
| AC-040 | `GET /api/health` shall respond `200` with `{ ok: true }` whenever the process is serving, and shall contact no upstream service. |
| ~~AC-041~~ | **Retired** by 0003 — both variables cease to exist, so behaviour on their absence is not a requirement. |
| AC-042 | The deployment shall serve the site over HTTPS at its subdomain, with nginx forwarding the originating client IP in `CF-Connecting-IP`, and shall resolve `$remote_addr` from that header via the real_ip module. *(Amended by 0006.)* |
| AC-043 | The repository shall contain desktop and mobile captures under `shots/`. |
| AC-044 | The email capture form shall present an unticked consent checkbox, separate from every other control, and shall refuse submission until it is ticked. |
| ~~AC-045~~ | **Retired** by 0003 — no contact to record anything on. The consent version stays in the content module; it identifies the wording, which is not the same as a field on a vendor's record. |
| ~~AC-046~~ | **Retired** by 0003 — double opt-in confirms an address for a sender that no longer exists. **The first thing to rebuild if the brand stops being fictional.** |
| ~~AC-047~~ | **Retired** by 0004 — the obligation attaches to sending an advertisement, and nothing is sent. Communications Law 5742-1982 § 30A binds a sender; with the pipeline gone there is no message to name a sender on, mark, or offer an opt-out from. **Revives in full the moment anything is sent**, with AC-045 and AC-046. |
| ~~AC-048~~ | **Retired** by 0003 — Art. 13 disclosure describes processing. There is none: no recipient, no transfer, no retention, because nothing is kept. |
| AC-049 | The site shall serve an accessibility statement at `/accessibility`, linked from the footer, naming WCAG 2.2 Level AA, known limitations, and a named contact for accessibility problems. |
| AC-050 | Every form input shall have a visible, programmatically associated label. A placeholder shall not serve as a label. |
| AC-051 | When a form error or a submission result is rendered, the site shall associate it with its input and announce it through a live region. |
| AC-052 | Every interactive target shall measure at least 24×24 CSS pixels, except a target inline within a sentence, which WCAG 2.2 SC 2.5.8 exempts. *(Exception added by 0005.)* |
| AC-053 | While any sticky or overlaying element is displayed, the site shall keep the focused element visible. |
| AC-054 | The site shall give every informative image descriptive alternative text and every decorative image an empty `alt` attribute, and shall present no information in the WebGL canvas that is not also present as DOM text. |
| AC-055 | The reverse proxy shall serve over TLS 1.3, send HSTS, and set `X-Content-Type-Options`, `Referrer-Policy` and a `Content-Security-Policy`. |
| AC-056 | The reverse proxy shall omit the client IP address from its access log, or rotate that log on a stated retention period not exceeding 30 days. |
| AC-057 | The subscribe route shall write no email address, no API key and no request body to any log. |
| AC-058 | The repository shall contain a record of processing activities and a breach-notification runbook naming the GDPR 72-hour clock and the Israeli Privacy Protection Authority route. |
| AC-059 | The site shall set no cookie, and shall write nothing to `localStorage`, `sessionStorage` or IndexedDB other than the accessibility preferences the visitor sets from the accessibility menu, under a single key containing no identifier. *(Exception added by 0005; ePrivacy Art. 5(3) strictly-necessary.)* |
| ~~AC-060~~ | **Retired** by 0003 — a response commitment for erasure of data that is never stored. |
| AC-061 | The pinned section shall render a static poster of the pack in its server-rendered markup, and shall mount the WebGL canvas only after first paint. |
| AC-062 | The pinned section shall reserve its full height before the canvas mounts, and mounting the canvas shall cause no layout shift. |
| AC-063 | While the user agent reports `prefers-reduced-motion: reduce`, the pinned sequence shall follow scroll position without damping, and shall come to rest in the same frame the scroll stops. |
| AC-064 | The pinned section shall expose exactly one beat to the accessibility tree and the tab order at a time; a faded beat shall be reachable by neither. |
| AC-065 | The shipped model shall declare no `KHR_draco_mesh_compression` and no mesh-quantization extension. |
| AC-066 | The pack's printed artwork and its model shall each be reproducible from checked-in sources by a single documented command. |
| AC-067 | Every navigation and footer link shall resolve to a section or route that exists. |
| AC-068 | The launch countdown shall compute its target at render time and shall never display a zero or negative interval. |
| AC-069 | The launch countdown shall not announce its per-second changes to assistive technology, and shall expose the remaining time as text that does not update every second. |
| AC-070 | The waitlist section shall state that the site is a demonstration and that the address is neither stored nor transmitted, before the submit control. |
| AC-071 | The application shall declare no outbound message dependency — no SMTP client and no transactional-mail SDK — and no code path shall send mail, so that the precondition AC-047 was retired on is verifiable rather than assumed. |
| AC-072 | The site shall present, on every page, an accessibility menu offering text size, high contrast, link highlighting, a readable font, stopped motion and an enlarged cursor. |
| AC-073 | The accessibility menu shall be fully operable by keyboard: opened from a button with an accessible name, closed by `Escape` with focus returned to that button, and absent from the tab order while closed. |
| AC-074 | While motion is stopped from the accessibility menu, the site shall halt the WebGL camera as well as CSS animation and smooth scrolling. |
| AC-075 | The accessibility menu shall retain its settings across navigation within the site. |
| AC-076 | The accessibility menu shall link to the accessibility statement and shall state that it does not replace the accessibility of the site itself. |
| AC-077 | The server block shall refuse, with `403`, any connection whose socket address is outside the published Cloudflare ranges, so that `CF-Connecting-IP` cannot be set by anything but Cloudflare. |

## 3. Architecture

### Overview

A statically generated site with exactly one dynamic surface, running as a single long-lived Node
process inside a container. Every page is prerendered at build time; the only server code in the
product is a route that validates a submission and answers. There is no database and no upstream,
because nothing is kept and nothing is sent (0003). Two locales are two prerendered variants of the same
components, differing only in which content module they load and which `dir` the document carries.

```
                   Browser
                      │
                      │  HTTPS
                      ▼
        ┌──────────────────────────────┐
        │  nginx  (VPS, TLS terminated)│   meridian.<your-domain>
        │  reverse proxy → 127.0.0.1   │
        └──────────────────────────────┘
                      │  HTTP, loopback only
                      ▼
        ┌──────────────────────────────┐
        │  Docker container            │
        │  next start (standalone)     │   prerendered / /privacy /accessibility
        │  ├─ POST /api/subscribe      │   validate · honeypot · rate-limit
        │  └─ GET  /api/health         │
        └──────────────────────────────┘
                      │  HTTPS + Bearer — 8s timeout
                      ▼
        ┌──────────────────────────────┐
        │  (no upstream)               │   nothing is sent anywhere
        └──────────────────────────────┘

        Browser ──── HTTPS ────▶ Umami (shared container, all five projects)
```

### Components

| Component | Responsibility | Technology |
| --- | --- | --- |
| nginx | TLS termination, subdomain routing, the Cloudflare 403 gate, and `$remote_addr` resolved from `CF-Connecting-IP`. Owns no application logic. | nginx on the VPS, outside this repo |
| Container | Runs one Next.js process. Stateless apart from the rate-limit window. | Docker, `node:20-alpine`, non-root |
| Page shell | Sets `lang`/`dir`, loads the content module, composes sections. No layout of its own. | Next.js 15 App Router, single root route |
| Section components | Render one section each from props. Never fetch, never read the locale directly. | React 19 server components, except where motion or state forces `"use client"` |
| Content modules | Every user-facing string and all product data, one module per locale, both satisfying one type. | TypeScript, no runtime dependency |
| Subscribe route | Validates, screens the honeypot, rate-limits, answers. Forwards nowhere and stores nothing. | Next.js Route Handler, Node runtime |
| Health route | Reports that the process is serving, for Docker and nginx. | Next.js Route Handler |
| Accessibility menu | Holds and applies visitor display preferences. Renders no content and reads no page state. | React client component + CSS attribute selectors |
| Motion primitives | A reveal wrapper, reduced-motion aware. Used by the sections below the pinned sequence only. | `framer-motion` |
| Pinned sequence | Measures scroll over its own container and publishes progress. Owns no geometry and no copy. | Client component, `getBoundingClientRect` in rAF |
| Pack stage | The studio: five local lights, a contact blob, and one `useFrame` owning camera, rotation and key light together. | `@react-three/fiber`, code-split, client-only |
| Panel projection | Splits the mesh into front / back / foil groups and fits the flat artwork onto the printed faces. | Pure TypeScript over `three` buffer geometry |
| Choreography | The keyframe table. Every camera move, zoom, rotation and light position on the page is one row in it. | Pure TypeScript, no React |
| Analytics | Pageviews and the `subscribe` event. | Umami, self-hosted, shared across projects |

### Decisions

**Static generation inside a long-lived container** — pages prerendered at build, served by
`next start` from the `standalone` output.
Because: the page has no per-request content, and §1's success measure is a fast first paint on
mobile. The container exists for the two API routes, not for rendering.
Instead of: `output: 'export'` to plain nginx — cheaper to operate, but it deletes `/api/subscribe`
and disables `next/image` optimization, which are two of the three things this project is meant to
demonstrate.
Revisit if: the form ever moves to a third-party service, at which point static export becomes
strictly better.

**One container per project, one subdomain each** — no shared runtime between the five sites.
Because: constitution principle 1 requires each project to be deployable and forkable alone, and a
shared process would silently couple their dependency versions and their uptime.
Instead of: one Next.js app with five route groups — fewer containers to run, but a single
`npm install` shared by five sites that are supposed to prove five different stacks of decisions.
Revisit if: VPS memory becomes a real constraint; five idle Node processes are roughly 400MB.

**One Hebrew route, no locale layer** — a single content module, served at `/`.
Because: with one language, a locale segment buys a `/he` prefix on every URL, a redirect from
`/`, a `params` promise threaded through every page, and a lookup that can only return one
answer. Unused generality survives precisely because removing it feels like losing something.
Instead of: a `[locale]` segment with two content modules satisfying one `Content` type — the
original choice (0001 reversed it), and correct while the site was bilingual. That reasoning
still holds if a second language is ever committed to; restoring the segment is the work.
Revisit if: a second locale is actually funded, rather than anticipated.

**No email provider.** The route accepts, validates and answers; nothing is sent.
Because: this is a portfolio demonstration of a fictional brand. A live pipeline means a service
account, a signed DPA, a third-country transfer and Communications Law § 30A applying in full —
real obligations acquired to demonstrate a form that already demonstrates itself without them.
Instead of: Resend called from our own route — the original choice (0003 reversed it), and still
correct the moment a real address is wanted. That reasoning was never refuted, only descoped: an
address really is the conversion, and it really should not depend on a vendor's iframe.
Revisit if: the brand stops being fictional. Restoring it is this decision reversed, AC-020/024/
045/046 revived under new ids, and a DPA signed first.

**In-memory per-IP rate limiting, in a module-scoped Map** — 5 requests per 60 seconds.
Because: the container is one long-lived process, so this is genuinely reliable here. On serverless
the same code would be best-effort noise; in a single persistent Node process it is a real limit.
Instead of: Redis — correct for multi-instance deployments and unnecessary for one container.
Revisit if: this site is ever horizontally scaled to more than one replica, which immediately breaks
the guarantee.

**Client IP taken from `CF-Connecting-IP`** (0006)
Because: Cloudflare terminates in front of nginx, and it *appends* to a caller-supplied
`X-Forwarded-For` instead of replacing it — so the first entry is attacker-controlled, and AC-023
keyed on it would be no limit at all. `CF-Connecting-IP` is a single address Cloudflare writes over
anything the caller sent.
Instead of: the first `X-Forwarded-For` entry — the original choice, correct while nginx was the only
hop, and retired by the second one arriving exactly as its own "revisit if" predicted.
Depends on: AC-077's 403 gate. Without it any host that finds the origin address can set the header,
and this decision becomes *less* safe than the one it replaced.
Revisit if: Cloudflare is removed, or a second CDN is added.

**Motion in leaf components only** — a `Reveal` wrapper marked `"use client"`, wrapping otherwise
server-rendered sections.
Because: constitution decision 3 forbids motion in route files, and this keeps the client bundle to
the animation primitives rather than the page content.
Instead of: marking whole sections client components — simpler to write, and it ships every string
in the section to the browser twice.
Revisit if: a section needs interactive state beyond an entrance transition.

**Hand-rolled scroll measurement, not a scroll library** — progress is measured from
`getBoundingClientRect` every frame, never accumulated.
Because: an accumulated delta drifts the moment anything else on the page changes height, and
this sequence is three screens long.
Instead of: a scroll-linked animation library — correct when there are many independent scroll
effects; there is exactly one here, and it drives WebGL rather than CSS.
Revisit if: a second scroll-driven surface appears on the page.

**Plain glTF only — no Draco, no mesh quantization.**
Because: both produced a model that loaded without a single error and then never rendered. drei
suspends on `useGLTF` and the boundary never resolves — no exception, no console message, just a
lit scene with no product in it. The failure is invisible in CI and obvious only to a human
looking at the page.
Instead of: Draco, which would take the shipped model from 81 KB to roughly 40 KB — a saving
worth less than a class of bug the verify command cannot catch.
Revisit if: the loader stack changes and the boundary behaviour can be demonstrated to resolve.

**The model's own texture is discarded and the artwork is projected onto it.**
Because: the supplied image-to-3D exports carry hallucinated label text — "MERII SPECIA",
"JASNINE BLUERE", invented body copy across a fragmented atlas — and beats 2 and 3 push the
camera close enough to read it. Geometry from the generator, printing from us.
Instead of: regenerating until the label is right — image-to-3D does not produce legible type at
any seed, and the panels have to be editable as copy in any case.
Revisit if: a generator ships that can hold a typeface.

## 4. Project Layout & Conventions

Governed by `docs/CONSTITUTION.md` v1.3 — layout, dependency direction, naming, size limits,
tooling, and the verify command. Nothing there is restated here.

Specific to this spec:

- `content/` holds one module per locale — `en.ts`, `he.ts` — plus `types.ts` defining the `Content`
  interface both must satisfy. Adding a field to the type without adding it to both locales is a
  type error, which is the point.
- `app/` holds the three routes directly. There is no locale segment and no `params` to thread.
- `components/motion/` holds the reduced-motion-aware primitives. It is the only directory permitted
  to import `motion`.
- `deploy/` holds `nginx.conf.example` and the documented `docker build` / `docker run` invocation.
  It contains no secrets and nothing that runs at build time.
- Hebrew copy in `content/he.ts` is machine-drafted and carries a file-level marker comment until a
  native speaker has reviewed it (Assumption 4).

## 5. Data Models

No database. Two types matter: the content contract, and the subscribe payload.

```ts
// content/types.ts

/**
 * One module satisfies this — `he.ts`. The interface exists so a missing string
 * is a build failure rather than an `undefined` rendered to a visitor.
 *
 * The `Locale` union and the locale lookup that used to sit here went with the
 * routing machinery in 0001: there is one language, and a type with one member
 * describes a decision nobody is making.
 */

export interface Row { label: string; value: string }

/** One per entry in SCROLLY_STEPS. A beat carries at most one of rows / ctas / buy. */
export interface Beat {
  kicker: string;
  title: string;
  body?: string;
  rows?: Row[];
  ctas?: { primary: string };
  buy?: { label: string; note: string };
}

export interface Countdown {
  heading: string;
  units: { days: string; hours: string; minutes: string; seconds: string };
  a11y: string;             // read by assistive tech in place of per-second digits (AC-069)
}

/** A legal page. The notice states the demo posture where a page can be read alone (AC-035). */
export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[]; rows?: Row[] }[];
}

export interface Content {
  meta:      { title: string; description: string };
  brand:     { name: string; tagline: string };
  nav:       { roast: string };
  scrolly:   { beats: Beat[]; stageLabel: string; hint: string };   // exactly 3 beats
  countdown: Countdown;
  legal:     { demoNotice: string; backToSite: string; privacy: LegalDoc; accessibility: LegalDoc };
  waitlist: {
    heading: string;
    sub: string;
    nameLabel: string;      // visible, associated label. NOT the placeholder (AC-050)
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    consent: string;        // the checkbox's own label — the act, not a notice (AC-044)
    consentVersion: string; // identifies the wording a visitor agreed to. Not sent anywhere (0003)
    noticeBefore: string;   // purpose of collection, split so the link text is a string
    noticeLink: string;     // links the privacy page (AC-026)
    noticeAfter: string;
    errors: { name: string; email: string; consent: string };
    success: { heading: string; body: string };
  };
  footer: {
    links: { label: string; href: string }[];
    copyright: string;
    disclosure: string;     // AC-035
  };
}
```

```ts
// lib/subscribe.ts — the wire contract

export interface SubscribeRequest {
  email: string;
  consent: true;            // literal true. An unticked box cannot form a valid request (AC-044)
  website: string;          // honeypot. Always empty from a real user (AC-022)
  locale: "he";             // a literal: one language ships. Kept for shape, sent nowhere (0003)
}

export type SubscribeError =
  | 'invalid_email'
  | 'consent_missing'
  | 'rate_limited'
  | 'upstream_failed';

export type SubscribeResponse =
  | { ok: true }
  | { ok: false; error: SubscribeError };
```

**Constraints**

- `Content` is the single source of truth for copy. `en.ts` and `he.ts` are both declared
  `satisfies Content`, so a missing key fails the build rather than rendering `undefined`.
- `proof` and `testimonials` are fictional by construction and disclosed in the footer (AC-035).
- No timestamps, no ids, no persistence — there is no record to own. The only
  in-process state is the rate-limit window, which is intentionally lost on restart.

## 6. Interfaces

### HTTP API

| Signature | Purpose | Request → Response | Errors |
| --- | --- | --- | --- |
| `POST /api/subscribe` | Accept a launch-list submission. Validates, rate-limits, screens the honeypot, answers. Contacts nothing. | `SubscribeRequest` → `SubscribeResponse` | `400 invalid_email` · `400 consent_missing` · `429 rate_limited` · `502 upstream_failed` |
| `GET /api/health` | Liveness for Docker and nginx | — → `{ ok: true }` | none; never contacts an upstream (AC-040) |

Contract details, not commentary:

- A non-empty `website` returns `200 { ok: true }` with no upstream call. A bot must not learn it was
  detected (AC-022).
- `502 upstream_failed` survives 0003 as the catch-all: the route keeps a boundary that must
  answer with a code (AC-021, AC-057), and an unexpected throw is now the only thing that
  produces it.
- Client IP for rate limiting is `CF-Connecting-IP`, falling back to `X-Real-IP` and then to a
  single shared bucket when neither is present (local development). `X-Forwarded-For` is not
  consulted: behind Cloudflare it carries caller-controlled entries (0006).

### Routes

| Route | Renders | Generation |
| --- | --- | --- |
| `/` | the landing page | static (AC-001, AC-008) |
| `/privacy` | the privacy page | static (AC-027) |
| `/accessibility` | the accessibility statement | static (AC-049) |
| `/api/health` | `{ ok: true }` | dynamic, contacts nothing (AC-040) |

### Environment

| Variable | Scope | Absent behavior |
| --- | --- | --- |
| `NEXT_PUBLIC_UMAMI_URL` | client, build time | analytics script is not rendered; no error |
| `NEXT_PUBLIC_UMAMI_SITE_ID` | client, build time | same |
| `PORT` | server, runtime | defaults to `3000` (AC-039) |

There is no server-only variable left. 0003 removed the Resend pair with the pipeline, so every
remaining variable is either operational (`PORT`) or public by nature — the Umami two identify a
site, they do not authorise anything.

### Deployment

```
docker build -t meridian .
docker run -d --name meridian --restart unless-stopped \
  -p 127.0.0.1:3001:3000 \
  meridian
```

Published to loopback only — nginx is the sole public listener, and Cloudflare is the only thing
permitted to reach nginx (AC-077). The server block for `meridian.itamardahan.com` lives in
`deploy/nginx.cloudflare.conf.example`; it must include the Cloudflare real_ip snippet and the 403
gate, or AC-023's limit can be bypassed with a forged header.

## 7. Core Flows

### Flow A — First visit and scroll

1. Visitor opens `https://meridian.<domain>` on a phone → nginx terminates TLS and proxies to the
   container.
2. Container returns prerendered HTML. The LCP element is the first beat's headline, which is
   server-rendered text; the pinned section shows its poster frame at its reserved height
   (AC-061, AC-062).
3. After first paint the WebGL chunk loads and the canvas mounts over the poster. Nothing moves.
4. Visitor scrolls → the pinned section measures its own `getBoundingClientRect` each frame and
   publishes progress; the stage samples the keyframe table at that progress; beats cross-fade,
   and only the held beat is in the accessibility tree (AC-064).
5. Past the sequence, the sections below play their one-time entrance transitions (AC-014).
6. If the OS reports reduced motion, those sections are already in their final state and the
   stage follows scroll without damping (AC-015, AC-063).

**Satisfies:** AC-001, AC-008, AC-009, AC-011, AC-014, AC-015, AC-061, AC-062, AC-063, AC-064
**Failure branches:** no WebGL, or a lost context → the poster frame stays and every word is
still DOM text (AC-054). A slow chunk delays the pack, never the headline.


### Flow B — Subscribe

1. Visitor activates the hero CTA → page scrolls to capture, focus moves to the email input
   (AC-010).
2. Visitor types an address and submits.
3. Client validates syntactically. Invalid → inline message, no request issued (AC-018).
4. Valid → submit disabled, pending state rendered (AC-016); `POST /api/subscribe` sent.
5. Route applies the rate limit, screens the honeypot, and answers. Nothing is forwarded — the
   address is discarded when the handler returns (0003).
6. `200` → form replaced by the localized confirmation (AC-017); Umami `subscribe` event recorded
   (AC-034).
7. `4xx`/`5xx` → localized error rendered, address retained, retry permitted (AC-019).

**Satisfies:** AC-016, AC-017, AC-018, AC-019, AC-021, AC-022, AC-023, AC-034, AC-070
**Failure branches:** a dropped connection or blocked request → the network error, input retained,
retry permitted (AC-019). Rate limited →
its own distinct message, so a real user who double-clicks understands what happened rather than
seeing a generic failure.

### ~~Flow C — Language switch~~

**Removed** by 0001. Its first step was "visitor on `/en` activates the toggle", and neither
`/en` nor the toggle exists. AC-004 and AC-007, which this flow also satisfied, are satisfied by
Flow A instead — the document is `rtl`/`he` from the first byte rather than after a navigation,
which is strictly the safer of the two, because no component ever observes a direction change at
runtime.


## 8. Edge Cases & Failure Modes

| Case | Consequence if unhandled | Handling | AC |
| --- | --- | --- | --- |
| Bot fills every field | Junk submissions | Honeypot field; silent `200`, identical to success | AC-022 |
| Script hammers the endpoint | Quota exhaustion | Per-IP limit, 5/60s → `429` | AC-023 |
| The 403 gate is removed or misconfigured | `CF-Connecting-IP` becomes settable by any caller that finds the origin address, and the per-IP limit becomes unlimited | The gate and the header are documented as a pair, at `clientKey` and in `deploy/` | AC-023, AC-077 |
| Container restarts | Rate-limit window resets | Accepted — the honeypot still applies, and the blast radius is one 60s window | §3 Decisions |
| User has reduced-motion enabled | Vestibular discomfort; content invisible if the reveal never fires | Final state rendered directly, no observer | AC-015 |
| JS disabled or failed to load | Form is inert with no explanation | All content is server-rendered; the form is a real `<form>` and submit is progressively enhanced | AC-008 |
| Hebrew text in a component with physical CSS | Layout breaks only in `he`, so it ships unnoticed | Logical properties everywhere, enforced as a criterion | AC-007 |
| WebGL bundle and model slow on 3G | Blank first viewport where the headline should be | Poster frame in server-rendered markup; canvas mounts after first paint; section reserves its height | AC-061, AC-062 |
| Four beats stacked in one sticky container | A screen reader announces every headline at once; a keyboard user tabs into invisible CTAs | Faded beats carry `aria-hidden` and `inert` | AC-064 |
| WebGL unavailable or context lost | Blank first viewport, no headline, no CTA | Poster frame stays; the copy is DOM and never depended on the canvas | AC-061, AC-054 |
| Model shipped with a compression extension | Loads without error and never renders; nothing in `verify` catches it | Build step writes plain glTF and the extension list is asserted | AC-065 |
| Footer links to pages not yet built | Visitor clicks and stays where they are | Links resolve to an existing route, or the entry is not rendered | AC-067 |
| Sequence left running off-screen | A WebGL loop and a rAF loop burn battery behind three screens of text | `IntersectionObserver` gates both | — |
| Umami is down | Blocking script delays first paint | Script is `async` and `defer`; a failed load renders nothing and blocks nothing | AC-033 |
| Visitor expects the launch email the copy describes | A promise the site cannot keep | The notice above the submit control states the form is inert, before they act | AC-070 |
| Visitor reads fictional testimonials as real | Misleading claims on a public URL | Footer disclaimer, in both locales | AC-035 |

## 9. Security & Permissions

**Authentication:** none. There is no authenticated surface, no account, and no session. Every
visitor sees the same two pages.

**Authorization:** not applicable — no user owns any record in this system.

**Enforcement point:** the subscribe Route Handler is the only place input crosses a trust boundary.
Validation, honeypot screening, and rate limiting all live there, in that order, before any upstream
call is made.

**Data handling:**

- **What is collected:** an email address and the locale it was submitted in. Nothing else — no
  name, no stored IP, no cookie.
- **Where it goes:** nowhere. The address is read from the request body, validated, and discarded
  when the handler returns. No processor, no transfer, no storage, and nothing to erase (0003).
- **The API key:** server-only, never `NEXT_PUBLIC_`, never in a response body, passed to the
  container at runtime rather than baked into the image (AC-038).
- **IP addresses:** held in the application process for at most 60 seconds for rate limiting.
  nginx additionally writes client IPs to its access log by default — that is personal data, so
  either IP logging is disabled in the server block or the log is rotated on a stated retention
  period of no more than 30 days (AC-056). An earlier draft of this spec claimed IPs were never
  logged. That was wrong.
- **Consent:** an unticked, separable checkbox gates submission (AC-044), and its wording carries a
  version in the content module. Double opt-in and the recorded consent version went with the
  pipeline in 0003 — they are the first things to rebuild if a real address is ever collected.
- **Transfers:** none. Nothing leaves the container.
- **Deletion:** the privacy page names a contact address for removal requests, handled manually in
- **Client-side storage:** one key, `meridian.a11y`, holding the display preferences set from
  the accessibility menu (AC-059 as amended by 0005). It is read only by the page that wrote it,
  is never sent anywhere, and contains no identifier — the parse spreads over defaults, so a
  corrupt or stale value degrades to the default rather than throwing. ePrivacy Art. 5(3)
  exempts it as strictly necessary for a service the visitor explicitly requested.
- **Cookies:** none, and no other client-side storage of any kind (AC-059). Umami is cookieless, so
  ePrivacy Art. 5(3) is not engaged and no consent banner exists (AC-033). Umami's processing of IP
  and user agent still rests on legitimate interest under GDPR Art. 6(1)(f) and is disclosed on the
  privacy page. Replacing Umami with anything cookie-based reintroduces the opt-in gate.
- **Logs:** the subscribe route writes no address, no key and no request body to any log (AC-057).
- **Container:** runs as a non-root user, publishes to loopback only, and holds no secret in any
  image layer (AC-038).

## 10. Build Order

**M1 — The page, live on a real URL** ✅ *complete*
*Demo: a link you can send someone. Full page, real content, running on your VPS.*
- [x] Scaffold, content contract, single Hebrew route, `verify` wired — closes AC-001, AC-003, AC-004, AC-036
- [x] Pinned pack sequence: three beats, choreography table, one `useFrame` — closes AC-009, AC-011
- [x] Poster frame in server markup, canvas mounted after first paint — closes AC-061, AC-062
- [x] Beat accessibility: one `h1`, faded beats `inert` — closes AC-032, AC-064
- [x] Reduced motion on the sequence — closes AC-063
- [x] Launch countdown that cannot expire — closes AC-068, AC-069
- [x] Entrance reveals on the sections below the sequence — closes AC-014
- [x] Model and artwork pipeline, plain glTF asserted — closes AC-065, AC-066
- [x] Waitlist markup: labels, unticked separable consent, notice linking privacy — closes AC-026, AC-044, AC-050, AC-051
- [x] Privacy page and accessibility statement, in Hebrew — closes AC-008, AC-027, AC-049
- [x] Every link resolves; targets at least 24×24; focus clears the fixed header — closes AC-052, AC-053, AC-067
- [x] Logical properties throughout — closes AC-007
- [x] `GET /api/health` — closes AC-040
- [x] Dockerfile on `standalone`, non-root, `PORT` honoured — closes AC-038, AC-039
- [x] `deploy/nginx.cloudflare.conf.example` with TLS, HSTS, the 403 gate, `CF-Connecting-IP` real_ip, log policy — closes AC-042, AC-055, AC-056
- [x] Desktop and mobile captures under `shots/` — closes AC-043


**M2 — The form actually works** ✅ *complete*
*Demo: submit on the live site; pending, error, retry and success are all real.*
- [x] `POST /api/subscribe`: typed contract, address validation, honeypot — closes AC-021, AC-022
- [x] Per-IP rate limit, 5/60s, keyed on `CF-Connecting-IP` — closes AC-023
- [x] Logging boundary: a code and nothing else reaches any log — closes AC-057
- [x] Client submit flow: pending, disabled control, error with input retained, retry — closes AC-016, AC-019
- [x] Umami, rendered only when configured, cookieless — closes AC-033
- [x] `subscribe` event, on success only — closes AC-034
- [x] The waitlist states it is a demonstration and stores nothing, above the submit control — closes AC-070
- [x] Privacy page and accessibility statement, in Hebrew — closes AC-027, AC-049
- ~~Resend call, already-subscribed handling, consent recording, double opt-in~~ — removed by 0003


**M3 — ~~Hebrew and RTL~~** — *dissolved by 0001*
It existed to add a second language to an English page. There is no English page: Hebrew is the
only locale and the sections are written in it from the first line rather than translated into it
afterwards. The language toggle went with AC-006.


**M4 — Motion, accessibility, and the numbers**
*Demo: the Lighthouse report, and the page with reduced-motion toggled on and off.*
- [x] `components/motion/Reveal` and stagger container, reduced-motion aware — closes AC-014, AC-015
- [x] Apply reveals across sections — closes AC-014
- [x] CTA scroll-and-focus behavior — closes AC-010
- [ ] Focus indicators and contrast pass on both locales — closes AC-030, AC-031
- [x] Heading hierarchy audit — closes AC-032
- [x] Accessibility statement at `/accessibility`, linked from the footer — closes AC-049
- [x] Accessibility menu: preferences, keyboard operation, motion stop, persistence — closes AC-072, AC-073, AC-074, AC-075, AC-076
- [x] Target sizes at least 24×24, focus never obscured by sticky elements — closes AC-052, AC-053
- [x] Alt-text pass: informative images described, decorative images empty — closes AC-054
- [ ] Lighthouse ≥90 / ≥90 on both locales — closes AC-037
- [ ] Desktop and mobile captures of both locales into `shots/` — closes AC-043

**M5 — Compliance and launch readiness**
*Demo: the hardened nginx config, the processing record, and a signed DPA — the things that let you
point a real address at this without flinching.*
- [ ] nginx TLS 1.3, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, CSP — closes AC-055
- [ ] nginx access-log IP handling and rotation policy — closes AC-056
- [ ] Verify no cookie and no client-side storage in either locale — closes AC-059
- [x] Assert no outbound message dependency: no mail client in the dependency tree, no send path in the code — closes AC-071
- [ ] Cloudflare-gated server block, real_ip from CF-Connecting-IP, and the app keyed on it — closes AC-077
- [ ] `docs/ROPA.md` and `docs/BREACH-RUNBOOK.md` — closes AC-058 · *0003 removed the processor, so there is no DPA to sign and the record would describe a system that processes nothing*

## 11. Assumptions

1. **The brand is "Meridian" and the product is a 1 kg bag of whole-bean specialty coffee,
   unpriced and pre-launch.** Nothing on the page is for sale; the only conversion is the launch
   list. *(Amended by 0001 — was a $285 hand grinder.)*
2. **There is no photography.** Every asset is original: the pack artwork is rendered from HTML
   sources in `art/`, the roundel is inline SVG, and the model's geometry comes from a supplied
   image-to-3D export whose own texture is discarded. The one third-party animation that was used
   has been replaced by original work, because its licence could not be confirmed — see
   `CREDITS.md`. *(Amended by 0001; the animation resolved 2026-08-21.)*
3. ~~**Consent is the act of submitting.**~~ *Rejected 2026-08-21 by the ACSM audit, §13.*
   Communications Law § 30A requires prior explicit consent in writing, separable and recorded.
   Superseded by AC-044. AC-045 and AC-046 were themselves retired by 0003 with the pipeline.
4. **Hebrew copy is machine-drafted and needs your review** before M1 deploys — M3 is dissolved and Hebrew is now the only copy on the site. You are a native
   speaker; I am not. The file carries a marker comment until you have read it.
5. **Everything on the page is disclosed as fictional** — brand, statistics, testimonials, people —
   via the footer, in both locales. This is deliberate: invented testimonials presented as real
   would be a genuine problem on a public URL, and the disclaimer costs nothing.
6. ~~**Prices display in USD only.**~~ *Superseded by 0001* — no price is displayed. Currency
   handling is out of scope until something is sold.
7. **This spec lives at `01-landing-b2c/SPEC.md`, not `docs/SPEC.md`** — each project is its own repo
   and needs its own spec. Later chain stages must be pointed at this path.
8. **The container runs as a single replica.** The rate limiter's guarantee depends on it (§3
   Decisions). Scaling to two replicas requires a change proposal, not a config tweak.
9. **Umami is already running and reachable** before M2, as shared infrastructure across all five
   projects. Standing it up is outside this repo.
10. **Deployment is manual** — `docker build`, `docker run`, reload nginx. A GitHub Action is a later
    change proposal, not v1 scope.
11. ~~**You are the data controller** for every address collected here; Resend is the processor.~~
    *Superseded by 0003* — no address is collected, so there is no controller and no processor. If
    the form is ever wired to a sender, this assumption returns with the pipeline.
12. **The site is served at `meridian.<your-domain>`**, supplied at deploy time. No code depends on
    the hostname; it appears only in `deploy/nginx.conf.example` and the canonical URL meta tag, both
    of which are one-line edits.

## 12. Open Questions

- **Is Umami already running on the VPS?** — blocks: M2's analytics tasks only · needed by: end of
  M2. If not, standing it up is a separate piece of work and AC-033/AC-034 slip to M4.
- **Hebrew copy review** — blocks: **M1 deploy** · needed by: before the site is public. Every
  string on the site is Hebrew, including two legal documents, and none has been read by a native
  speaker. Building proceeded without it; only the deploy waits.
- **Five values for the legal pages** — contact email, phone, registered address, retention
  period, and the licence of the third-party animation. Recorded in `HANDOFF.md`. They bind only
  once real addresses are collected, which no code does today.

The Umami question blocks nothing that is built — the script renders only when configured.
**The Hebrew review blocks deploy**, and it now covers two legal documents as well as the page.

## 13. Compliance Basis

Produced by an ACSM audit on 2026-08-21. **Not legal advice**, and nothing here states that this
site is compliant — it records which obligations were identified, from which instrument, and what
the spec does about each.

**Configuration**

```
appType          Web
targetMarkets    [Israel, EU]
dataSensitivity  StandardPII        rank 1, enterpriseFlag false
aiIntegration    None
infrastructure   HybridCloud
```

**Modules loaded — 5 of 8**

| # | Module | Rule | Why |
| :-: | --- | --- | --- |
| 1 | Global core security | R04, R12 | personal data held; infrastructure is not purely on-prem |
| 3 | EU, UK & APAC | R04, R07 | personal data held; markets include EU |
| 4 | Israeli market | R08 | markets include Israel |
| 6 | Digital accessibility | R11 | the app renders a user interface |
| 8 | Auditability | R12 | infrastructure is not purely on-prem |

Not loaded: 2 (US market), 5 (payments and enterprise), 7 (desktop binary). All five loaded modules
were last verified 2026-08-15, six days before this audit.

**Conflict resolved**

| | |
| --- | --- |
| Behavior | marketing consent |
| Module 4 | Communications Law 5742-1982 § 30A — prior explicit consent in writing, recorded; up to ILS 1,000 per message without proof of damage |
| Module 3 | GDPR Arts. 4(11), 7 — freely given, specific, informed, unambiguous affirmative act |
| Applied | unticked separable checkbox (AC-044), kept after 0003 as the honest UI for a form that asks to contact you. The recorded consent version and double opt-in went with the pipeline; § 30A no longer binds because nothing is sent, and they are the first things to rebuild if that changes. |
| Cost | measurably lower signup conversion. Real, and expected. |

No cookie-consent conflict arises: analytics is cookieless, so ePrivacy Art. 5(3) is not engaged.
That holds only while it stays cookieless.

**Assessed and not applicable**

- Consumer Protection Law §§ 13C–13G (continuing transactions, online cancellation within three
  business days) — no subscription, payment or continuing transaction exists.
- Israeli database registration — narrowed by Amendment 13, in force 14 August 2025, to
  data-trading databases, public bodies, and sensitive data at very large scale.
- Data Security Regs. 5777-2017 access-logging duties — this project holds no database, and after
  0003 no processor holds one either.
  What lands here is account access control, not query logging.
- EU Accessibility Act (Directive 2019/882) — covers e-commerce, banking, e-books, transport and
  terminals; a marketing page is not clearly in scope. WCAG 2.2 AA is built to regardless, because
  Israeli Regs. 5773-2013 reg. 35 applies on its own.
- AI Act Art. 50 — no AI system in the product.

**Requires a human, not a spec**

1. **Israeli registration threshold** — Amendment 13 is the most heavily amended instrument in the
   matrix and secondary sources still report the pre-2025 rule. The conclusion above is reasoning,
   not verification. Confirm with the Privacy Protection Authority or Israeli counsel.
2. ~~**Resend DPA and transfer mechanism**~~ — *removed by 0003.* There is no processor and no
   transfer. If a sender is ever added, this returns as a precondition rather than a follow-up.

3. **Hebrew legal copy** — the privacy, consent and accessibility text must be effective in Hebrew
   against an Israeli reader. Machine-drafted Hebrew needs your review before it ships.
