# Portfolio — Constitution

> Status: Active · 2026-08-21 · Constitution version 1.3

A repository of five independent client-style websites plus the portfolio shell that presents them.
This document states what is true about the repository regardless of which site is being built.

## Principles

1. **No project imports from a sibling project.** — a cross-project import means a site can no longer
   be deployed, forked, or handed to a client on its own, which is the only reason these are separate
   projects at all.
2. **`kit/` holds tooling, never visual components.** — the five sites exist to prove design range;
   a shared `Button` or `Card` makes them one site rendered five times, and the portfolio's entire
   argument collapses.
3. **Directional CSS is logical, never physical** — `margin-inline-start` over `margin-left`,
   `ps-4` over `pl-4`, `start-0` over `left-0`. A physical property does not fail in English; it
   fails only once the page is flipped to Hebrew, which means a client finds it, not you.
4. **Copy and product data live in a typed module under `content/`, never inline in JSX.** — the
   first thing any client asks for is a wording change, and hunting one sentence across twelve
   components turns a two-minute edit into an afternoon.
5. **Every form and async surface has an explicit loading, error, and success state.** — a submit
   handler with no failure branch renders as a dead button, and a dead CTA on a landing page is the
   single bug that costs the conversion the page exists to produce.
6. **No new dependency without a named problem it can't be solved without.** — every package is a
   permanent maintenance obligation and bundle weight on pages that will be judged by their
   Lighthouse score in front of a prospective client.
7. **Images render through `next/image` with explicit dimensions.** — an unsized hero image shifts
   the layout as it loads, which is both the worst CLS penalty available and the first thing a
   visitor sees.

## Layout

Each project directory is an independent git repository with its own remote, its own Dockerfile,
and its own subdomain. They sit side by side here for convenience only — siblings never import each
other, and nothing at this level is a package boundary.

```
portfolio/
├─ 01-landing-b2c/     # Landing — B2C physical product
├─ 02-ecom-apparel/    # E-Commerce — lifestyle/apparel
├─ 03-corporate/       # Corporate — multi-page business site
├─ 04-landing-b2b/     # Landing — B2B SaaS            (not yet specced)
├─ 05-ecom-single/     # E-Commerce — single product   (not yet specced)
├─ site/          # the portfolio shell. Created when 01–03 are live, not before.
├─ kit/           # shared tooling ONLY. Created when project 02 starts — you cannot know what is
│                 # shared until a second project exists. No components, no tokens, no CSS.
├─ docs/          # CONSTITUTION.md, SPEC.md, briefs, change proposals. No code.
└─ TOKENS.md      # per-project token ledger, updated every session
```

Inside every project:

```
NN-name/
├─ brief.md       # the fictional client, audience, goal — the "why" behind the design decisions
├─ app/           # App Router: routes and layouts. Composes sections, never contains them.
├─ components/    # this project's components. Never imported by a sibling.
├─ content/       # copy, product data, FAQ entries — typed modules, no JSX
├─ lib/           # pure helpers. No React, no DOM.
├─ public/        # static assets
├─ shots/         # desktop + mobile captures, consumed by site/
├─ docs/          # synced copy of the constitution
├─ Dockerfile     # multi-stage build on the `standalone` output
├─ .dockerignore
└─ package.json   # own dependencies, own `verify` script
```

## Dependency direction

`app/ → components/ → content/, lib/`

`lib/` imports no React. `content/` imports nothing but its own types. No project imports another
project. `kit/` is referenced by config files only — never at runtime, never from `app/` or
`components/`.

## Naming

| Kind | Convention | Example |
| --- | --- | --- |
| Project directory | `NN-category-angle`, kebab-case, at repo root | `01-landing-b2c` |
| Component | PascalCase file and export, one component per file | `components/HeroSection.tsx` |
| Route segment | kebab-case directory under `app/` | `app/product-details/page.tsx` |
| Content module | camelCase typed named export | `content/faq.ts` → `export const faq: FaqEntry[]` |
| Helper | camelCase, verb-first | `lib/formatPrice.ts` |
| Colour in JSX | semantic token from that project's Tailwind theme | `bg-brand`, never `bg-amber-600` |

The last row is what keeps principle 2 honest: each project defines its own palette as semantic
tokens in its own `tailwind.config.ts`, so the five sites diverge by configuration rather than by
scattered literal colours.

## Size limits

| Unit | Soft | Hard |
| --- | --- | --- |
| Component file | 150 lines | 250 lines |
| Route file (`page.tsx`) | 80 lines | 150 lines |
| Function | 40 lines | 60 lines |

A route file over 150 lines is holding a section that belongs in `components/`. These are not
linter-enforced; `spec-drift` reports them as findings.

## Tooling

| Concern | Tool |
| --- | --- |
| Framework | Next.js, App Router |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS |
| Linting | ESLint via `next lint`, with `jsx-a11y` enabled |
| Formatting | Prettier + `prettier-plugin-tailwindcss` |
| Icons | `lucide-react` |
| Motion | `motion` (formerly `framer-motion`) for scroll reveals and entrance transitions; plain CSS transitions for hover and focus states |
| Package manager | npm, one `package.json` per project |
| Deploy | Docker container per project, nginx reverse proxy on a VPS, one subdomain each |

## Verification

**Verify command:** `npm run verify` — defined per project as `next lint && next build`, run from
that project's directory.

**Static analysis:** `none`

The build typechecks and compiles every route, so a green run proves the site has no type errors, no
broken imports, and no page that fails to render on the server. Lint adds accessibility and Next.js
correctness rules on top.

It does **not** start the app, does not check that anything looks right, does not verify RTL
rendering, does not exercise a form, and does not run Lighthouse. Visual and RTL correctness are
confirmed by eye; the performance gate is standing decision 5.

## Standing decisions

Made without explicit confirmation. Any one can be rejected.

1. **Every project is its own standalone GitHub repository**, deployed as its own Docker container
   on a subdomain. This folder is the working hub: it holds the canonical constitution, the token
   ledger, and the portfolio shell that links to the five. Each project repo carries a synced copy
   of this constitution at `docs/CONSTITUTION.md`, because a standalone repo cannot inherit a file
   it does not contain — the hub copy is authoritative and changes flow outward, never inward.
2. **npm with a separate `package.json` per project, no workspace tooling** — if this is wrong,
   adopting pnpm workspaces later is a configuration change, not a code change.
3. **Framer Motion (`motion`) is the animation library**, used for scroll-triggered reveals and
   entrance transitions. Hover and focus states stay in CSS — routing every state change through JS
   costs a client-component boundary for no gain. Any file importing it needs `"use client"`, so
   motion lives in leaf components, never in a route file.
4. **RTL-ready means logical properties and `dir` support, not translation infrastructure** — no i18n
   library, no translated copy, until a project's spec asks for it. If this is wrong, the layout work
   is already done and only the string layer is missing.
5. **Lighthouse ≥ 90 on Performance and Accessibility is a pre-deploy gate**, checked manually in
   Chrome DevTools before a site goes live. Deliberately not part of `verify`, which must stay fast
   enough to run after every task.
6. **Projects 04 and 05 exist as names only** until 01–03 are live, per the build-order strategy.
