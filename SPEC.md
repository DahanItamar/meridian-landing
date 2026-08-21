# 01 — Meridian Landing Page — Technical Spec

> Status: Draft · 2026-08-21 · Spec version 2.0
> Merged: change proposal 0001 — coffee pivot, WebGL hero, Hebrew-only
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
- Working email capture writing to a Resend audience
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
| AC-020 | The subscribe route shall apply an 8-second timeout to its Resend call and shall treat expiry as a failure. |
| AC-021 | `POST /api/subscribe` shall respond `200` with `{ ok: true }` on success, and a 4xx or 5xx status with `{ ok: false, error: <code> }` otherwise. |
| AC-022 | If the honeypot field is non-empty, then the subscribe route shall respond `200` without contacting Resend. |
| AC-023 | If more than 5 requests carry the same client IP within 60 seconds, then the subscribe route shall respond `429`. |
| AC-024 | If the submitted address is already subscribed, then the subscribe route shall respond `200` and the site shall render the same confirmation as for a new subscription. |
| AC-025 | The site shall never expose the Resend API key in a response body, a client bundle, or a build artifact. |
| AC-026 | The email capture section shall display a consent notice naming the purpose of collection and linking to the privacy page, in the active locale. |
| AC-027 | The site shall serve a privacy page stating what is collected, the processor, the retention period, and a contact address for deletion requests. |
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
| AC-041 | If `RESEND_API_KEY` or `RESEND_AUDIENCE_ID` is absent at runtime, then the subscribe route shall respond `502 upstream_failed` and the rest of the site shall continue to serve. |
| AC-042 | The deployment shall serve the site over HTTPS at its subdomain, with nginx forwarding the originating client IP in `X-Forwarded-For`. |
| AC-043 | The repository shall contain desktop and mobile captures under `shots/`. |
| AC-044 | The email capture form shall present an unticked consent checkbox, separate from every other control, and shall refuse submission until it is ticked. |
| AC-045 | When a subscription succeeds, the subscribe route shall record the consent text version, the submission timestamp in UTC, and the locale, as fields on the Resend contact. |
| AC-046 | When the form is submitted, the site shall send a confirmation email containing a single-use link, and shall not treat the address as subscribed until that link is followed. |
| AC-047 | Every marketing message shall name the sender, identify itself as an advertisement in the locale it is sent in, and carry a free one-click opt-out valid for email. |
| AC-048 | The privacy page shall state the controller identity, each purpose and its lawful basis, the recipients, the third-country transfer mechanism, the retention period, the full list of data-subject rights, the right to withdraw consent, and the right to complain to a supervisory authority. |
| AC-049 | The site shall serve an accessibility statement at `/accessibility`, linked from the footer, naming WCAG 2.2 Level AA, known limitations, and a named contact for accessibility problems. |
| AC-050 | Every form input shall have a visible, programmatically associated label. A placeholder shall not serve as a label. |
| AC-051 | When a form error or a submission result is rendered, the site shall associate it with its input and announce it through a live region. |
| AC-052 | Every interactive target shall measure at least 24×24 CSS pixels. |
| AC-053 | While any sticky or overlaying element is displayed, the site shall keep the focused element visible. |
| AC-054 | The site shall give every informative image descriptive alternative text and every decorative image an empty `alt` attribute, and shall present no information in the WebGL canvas that is not also present as DOM text. |
| AC-055 | The reverse proxy shall serve over TLS 1.3, send HSTS, and set `X-Content-Type-Options`, `Referrer-Policy` and a `Content-Security-Policy`. |
| AC-056 | The reverse proxy shall omit the client IP address from its access log, or rotate that log on a stated retention period not exceeding 30 days. |
| AC-057 | The subscribe route shall write no email address, no API key and no request body to any log. |
| AC-058 | The repository shall contain a record of processing activities and a breach-notification runbook naming the GDPR 72-hour clock and the Israeli Privacy Protection Authority route. |
| AC-059 | The site shall set no cookie and shall write nothing to `localStorage`, `sessionStorage` or IndexedDB. |
| AC-060 | The privacy page shall state that erasure and opt-out requests are answered within 30 days, and shall name the address that receives them. |
| AC-061 | The pinned section shall render a static poster of the pack in its server-rendered markup, and shall mount the WebGL canvas only after first paint. |
| AC-062 | The pinned section shall reserve its full height before the canvas mounts, and mounting the canvas shall cause no layout shift. |
| AC-063 | While the user agent reports `prefers-reduced-motion: reduce`, the pinned sequence shall follow scroll position without damping, and shall come to rest in the same frame the scroll stops. |
| AC-064 | The pinned section shall expose exactly one beat to the accessibility tree and the tab order at a time; a faded beat shall be reachable by neither. |
| AC-065 | The shipped model shall declare no `KHR_draco_mesh_compression` and no mesh-quantization extension. |
| AC-066 | The pack's printed artwork and its model shall each be reproducible from checked-in sources by a single documented command. |
| AC-067 | Every navigation and footer link shall resolve to a section or route that exists. |
| AC-068 | The launch countdown shall compute its target at render time and shall never display a zero or negative interval. |
| AC-069 | The launch countdown shall not announce its per-second changes to assistive technology, and shall expose the remaining time as text that does not update every second. |

## 3. Architecture

### Overview

A statically generated site with exactly one dynamic surface, running as a single long-lived Node
process inside a container. Every page is prerendered at build time; the only server code in the
product is a route that forwards an email address to Resend. There is no database, because nothing
needs to be read back — Resend owns the list. Two locales are two prerendered variants of the same
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
        │  Resend Audience             │   owns the subscriber list
        └──────────────────────────────┘

        Browser ──── HTTPS ────▶ Umami (shared container, all five projects)
```

### Components

| Component | Responsibility | Technology |
| --- | --- | --- |
| nginx | TLS termination, subdomain routing, sets `X-Forwarded-For`. Owns no application logic. | nginx on the VPS, outside this repo |
| Container | Runs one Next.js process. Stateless apart from the rate-limit window. | Docker, `node:20-alpine`, non-root |
| Page shell | Sets `lang`/`dir`, loads the content module, composes sections. No layout of its own. | Next.js 15 App Router, single root route |
| Section components | Render one section each from props. Never fetch, never read the locale directly. | React 19 server components, except where motion or state forces `"use client"` |
| Content modules | Every user-facing string and all product data, one module per locale, both satisfying one type. | TypeScript, no runtime dependency |
| Subscribe route | Validates, screens the honeypot, rate-limits, forwards to Resend. Stores nothing durable. | Next.js Route Handler, Node runtime |
| Health route | Reports that the process is serving, for Docker and nginx. | Next.js Route Handler |
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

**Resend, called from our own route** — the key never leaves the server.
Because: the address is the conversion, and it should not depend on a third-party iframe or a
branded free-tier response sitting in the critical path.
Instead of: Formspree — less code, but puts a vendor's UI in the one interaction the page exists to
produce.
Revisit if: the list ever needs segmentation or automated sequences.

**In-memory per-IP rate limiting, in a module-scoped Map** — 5 requests per 60 seconds.
Because: the container is one long-lived process, so this is genuinely reliable here. On serverless
the same code would be best-effort noise; in a single persistent Node process it is a real limit.
Instead of: Redis — correct for multi-instance deployments and unnecessary for one container.
Revisit if: this site is ever horizontally scaled to more than one replica, which immediately breaks
the guarantee.

**Client IP taken from `X-Forwarded-For`, trusting exactly one proxy hop** — nginx is the only thing
in front.
Because: behind a reverse proxy the socket address is always the proxy, so every request would share
one bucket and the limit would be global rather than per-client.
Instead of: trusting the raw socket — makes AC-023 wrong in production while passing locally, which
is the worst kind of bug.
Revisit if: a CDN is ever placed in front of nginx, adding a second hop.

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
    consentVersion: string; // bumped on any wording change; recorded per contact (AC-045)
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
  locale: "he";             // recorded on the Resend contact for future sends (AC-045).
                            // A literal, not `Locale` — that type went with the
                            // routing machinery in 0001. The field stays because
                            // AC-045 names it; only its type collapsed.
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
- No timestamps, no ids, no persistence — Resend owns the record and its lifecycle. The only
  in-process state is the rate-limit window, which is intentionally lost on restart.

## 6. Interfaces

### HTTP API

| Signature | Purpose | Request → Response | Errors |
| --- | --- | --- | --- |
| `POST /api/subscribe` | Add an address to the Resend launch audience | `SubscribeRequest` → `SubscribeResponse` | `400 invalid_email` · `429 rate_limited` · `502 upstream_failed` |
| `GET /api/health` | Liveness for Docker and nginx | — → `{ ok: true }` | none; never contacts an upstream (AC-040) |

Contract details, not commentary:

- A non-empty `website` returns `200 { ok: true }` with no upstream call. A bot must not learn it was
  detected (AC-022).
- An address already on the list returns `200 { ok: true }`. List membership is not disclosed
  (AC-024).
- The Resend call carries an 8-second `AbortSignal`; expiry maps to `502 upstream_failed` (AC-020).
- Client IP for rate limiting is the first entry of `X-Forwarded-For`, falling back to the socket
  address when the header is absent (local development).

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
| `RESEND_API_KEY` | server only, runtime | subscribe returns `502`; the rest of the site serves normally (AC-041) |
| `RESEND_AUDIENCE_ID` | server only, runtime | same |
| `NEXT_PUBLIC_UMAMI_URL` | client, build time | analytics script is not rendered; no error |
| `NEXT_PUBLIC_UMAMI_SITE_ID` | client, build time | same |
| `PORT` | server, runtime | defaults to `3000` (AC-039) |

The two Resend variables are never prefixed `NEXT_PUBLIC_`, which is what makes AC-025 true by
construction rather than by discipline. The two Umami variables are public by nature — they identify
a site, they do not authorise anything.

### Deployment

```
docker build -t meridian .
docker run -d --name meridian --restart unless-stopped \
  -p 127.0.0.1:3001:3000 \
  -e RESEND_API_KEY=... -e RESEND_AUDIENCE_ID=... \
  meridian
```

Published to loopback only — nginx is the sole public listener. The nginx server block for
`meridian.<domain>` lives in `deploy/nginx.conf.example` and must set `X-Forwarded-For`, or AC-023
silently becomes a global limit.

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
5. Route reads `X-Forwarded-For`, screens the honeypot, then the rate limit, then forwards to Resend
   with an 8s timeout.
6. `200` → form replaced by the localized confirmation (AC-017); Umami `subscribe` event recorded
   (AC-034).
7. `4xx`/`5xx` → localized error rendered, address retained, retry permitted (AC-019).

**Satisfies:** AC-010, AC-016 – AC-024, AC-034
**Failure branches:** Resend down → `502` → network error message, address not lost. Rate limited →
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
| Bot fills every field | Junk addresses, Resend quota burned | Honeypot field; silent `200` | AC-022 |
| Script hammers the endpoint | Quota exhaustion | Per-IP limit, 5/60s → `429` | AC-023 |
| nginx does not forward the client IP | Every visitor shares one bucket; the limit becomes global | `X-Forwarded-For` required in the server block; documented in `deploy/` | AC-023 |
| Resend is down or slow | Request hangs, user sees a dead button | 8s timeout → `502` → error state, address retained | AC-019, AC-020 |
| Address already on the list | Duplicate error leaks membership | Treated as success, identical confirmation | AC-024 |
| Env vars missing on the VPS | Silent drop of every address, or a crash loop | Route returns `502` and logs; the site keeps serving | AC-041 |
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
- **Where it goes:** Resend, acting as processor. This project stores nothing itself.
- **The API key:** server-only, never `NEXT_PUBLIC_`, never in a response body, passed to the
  container at runtime rather than baked into the image (AC-025, AC-038).
- **IP addresses:** held in the application process for at most 60 seconds for rate limiting.
  nginx additionally writes client IPs to its access log by default — that is personal data, so
  either IP logging is disabled in the server block or the log is rotated on a stated retention
  period of no more than 30 days (AC-056). An earlier draft of this spec claimed IPs were never
  logged. That was wrong.
- **Consent:** an unticked checkbox, separate from every other control, gates submission (AC-044),
  followed by a double opt-in confirmation link (AC-046). This is required rather than cautious:
  Communications Law 5742-1982 § 30A demands prior explicit consent in writing and provides
  statutory damages of up to ILS 1,000 per message without proof of damage. The consent text
  version, timestamp and locale are recorded on the contact (AC-045) — under § 30A the record is
  the defence.
- **Transfers:** Resend is US-based, so this is an EU-to-US transfer. It rests on Resend's Data
  Processing Agreement and the transfer mechanism named in it, which must be signed before a single
  real address is collected.
- **Deletion:** the privacy page names a contact address for removal requests, handled manually in
  the Resend dashboard. At this volume an automated unsubscribe endpoint is not warranted; Resend's
  own unsubscribe link covers sent mail.
- **Cookies:** none, and no client-side storage of any kind (AC-059). Umami is cookieless, so
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
- [x] `deploy/nginx.conf.example` with TLS 1.3, HSTS, CSP, `X-Forwarded-For`, log policy — closes AC-042, AC-055, AC-056
- [x] Desktop and mobile captures under `shots/` — closes AC-043


**M2 — The form actually works**
*Demo: subscribe on the live site; the address appears in Resend.*
- [ ] `POST /api/subscribe`: validation, honeypot, `X-Forwarded-For` rate limit, 8s timeout — closes AC-020, AC-021, AC-022, AC-023, AC-024
- [ ] Client submit flow: pending, success, error, retry — closes AC-016, AC-017, AC-018, AC-019
- [ ] Runtime env wiring, server-only, absent-key behavior — closes AC-025, AC-041
- [ ] Errors and submission results associated with their input and announced via a live region — closes AC-051
- [ ] Double opt-in: confirmation email with a single-use link; not subscribed until followed — closes AC-046
- [ ] Record consent version, UTC timestamp and locale on the Resend contact — closes AC-045
- [ ] Log scrubbing: no address, key or request body reaches any log — closes AC-057
- [x] Privacy page at `/privacy` — closes AC-027 · *the Art. 48 disclosure set and the 30-day statement are drafted; five values still blank, see HANDOFF.md* — AC-048, AC-060 remain open
- [ ] Umami script and the `subscribe` event — closes AC-033, AC-034

**M3 — ~~Hebrew and RTL~~** — *dissolved by 0001*
It existed to add a second language to an English page. There is no English page: Hebrew is the
only locale and the sections are written in it from the first line rather than translated into it
afterwards. The language toggle went with AC-006.


**M4 — Motion, accessibility, and the numbers**
*Demo: the Lighthouse report, and the page with reduced-motion toggled on and off.*
- [ ] `components/motion/Reveal` and stagger container, reduced-motion aware — closes AC-014, AC-015
- [ ] Apply reveals across sections — closes AC-014
- [ ] CTA scroll-and-focus behavior — closes AC-010
- [ ] Focus indicators and contrast pass on both locales — closes AC-030, AC-031
- [ ] Heading hierarchy audit — closes AC-032
- [x] Accessibility statement at `/accessibility`, linked from the footer — closes AC-049
- [ ] Target sizes at least 24×24, focus never obscured by sticky elements — closes AC-052, AC-053
- [ ] Alt-text pass: informative images described, decorative images empty — closes AC-054
- [ ] Lighthouse ≥90 / ≥90 on both locales — closes AC-037
- [ ] Desktop and mobile captures of both locales into `shots/` — closes AC-043

**M5 — Compliance and launch readiness**
*Demo: the hardened nginx config, the processing record, and a signed DPA — the things that let you
point a real address at this without flinching.*
- [ ] nginx TLS 1.3, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, CSP — closes AC-055
- [ ] nginx access-log IP handling and rotation policy — closes AC-056
- [ ] Verify no cookie and no client-side storage in either locale — closes AC-059
- [ ] Marketing email template: sender identity, advertisement marking, one-click opt-out — closes AC-047
- [ ] `docs/ROPA.md` and `docs/BREACH-RUNBOOK.md`; sign the Resend DPA and enable MFA on the account — closes AC-058

## 11. Assumptions

1. **The brand is "Meridian" and the product is a 1 kg bag of whole-bean specialty coffee,
   unpriced and pre-launch.** Nothing on the page is for sale; the only conversion is the launch
   list. *(Amended by 0001 — was a $285 hand grinder.)*
2. **There is no photography.** Every asset is original: the pack artwork is rendered from HTML
   sources in `art/`, the roundel is inline SVG, and the model's geometry comes from a supplied
   image-to-3D export whose own texture is discarded. One third-party animation is used and its
   licence is unconfirmed — see `CREDITS.md`. *(Amended by 0001.)*
3. ~~**Consent is the act of submitting.**~~ *Rejected 2026-08-21 by the ACSM audit, §13.*
   Communications Law § 30A requires prior explicit consent in writing, separable and recorded.
   Superseded by AC-044, AC-045 and AC-046.
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
11. **You are the data controller** for every address collected here; Resend is the processor. If
    this were ever operated by a company instead, §9 and the privacy page need that entity.
12. **The site is served at `meridian.<your-domain>`**, supplied at deploy time. No code depends on
    the hostname; it appears only in `deploy/nginx.conf.example` and the canonical URL meta tag, both
    of which are one-line edits.

## 12. Open Questions

- **A Resend account and API key** — blocks: M2 · needed by: start of M2. Free tier is sufficient.
  M1 ships without it.
- **Is Umami already running on the VPS?** — blocks: M2's analytics tasks only · needed by: end of
  M2. If not, standing it up is a separate piece of work and AC-033/AC-034 slip to M4.
- **Hebrew copy review** — blocks: **M1 deploy** · needed by: before the site is public. Every
  string on the site is Hebrew, including two legal documents, and none has been read by a native
  speaker. Building proceeded without it; only the deploy waits.
- **Five values for the legal pages** — contact email, phone, registered address, retention
  period, and the licence of the third-party animation. Recorded in `HANDOFF.md`. They bind only
  once real addresses are collected, which no code does today.

The Resend and Umami questions block M2 only. **The Hebrew review blocks M1's deploy.**

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
| Applied | unticked separable checkbox, recorded consent version, double opt-in. Satisfies both. § 30A is the harder obligation because the record is the defence and the penalty is per-message. |
| Cost | measurably lower signup conversion. Real, and expected. |

No cookie-consent conflict arises: analytics is cookieless, so ePrivacy Art. 5(3) is not engaged.
That holds only while it stays cookieless.

**Assessed and not applicable**

- Consumer Protection Law §§ 13C–13G (continuing transactions, online cancellation within three
  business days) — no subscription, payment or continuing transaction exists.
- Israeli database registration — narrowed by Amendment 13, in force 14 August 2025, to
  data-trading databases, public bodies, and sensitive data at very large scale.
- Data Security Regs. 5777-2017 access-logging duties — this project holds no database; Resend does.
  What lands here is account access control, not query logging.
- EU Accessibility Act (Directive 2019/882) — covers e-commerce, banking, e-books, transport and
  terminals; a marketing page is not clearly in scope. WCAG 2.2 AA is built to regardless, because
  Israeli Regs. 5773-2013 reg. 35 applies on its own.
- AI Act Art. 50 — no AI system in the product.

**Requires a human, not a spec**

1. **Israeli registration threshold** — Amendment 13 is the most heavily amended instrument in the
   matrix and secondary sources still report the pre-2025 rule. The conclusion above is reasoning,
   not verification. Confirm with the Privacy Protection Authority or Israeli counsel.
2. **Resend DPA and transfer mechanism** — must be signed before a single real address is
   collected. Blocks M2, and the privacy page cannot name a transfer mechanism that does not exist.
3. **Hebrew legal copy** — the privacy, consent and accessibility text must be effective in Hebrew
   against an Israeli reader. Machine-drafted Hebrew needs your review before it ships.
