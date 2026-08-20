# M1 — The English page, live on a real URL — Tasks

> Source: `01-landing-b2c/SPEC.md` §10 M1 (spec v1.2) · Constitution: `docs/CONSTITUTION.md` v1.3
> Verify: `npm run verify`
> Demo at the end: a link you can send someone. Full page, real content, real images, running on
> your VPS behind nginx.

- [x] T-01 Scaffold Next.js 15 with TypeScript strict and Tailwind, and wire `verify` to `next lint && next build` — closes AC-036 — files: package.json, tsconfig.json, next.config.ts, tailwind.config.ts, .eslintrc.json
- [x] T-02 Define the `Content` interface and the English content module, with every string and product value the page needs — closes AC-003 — files: content/types.ts, content/en.ts — depends: T-01
- [x] T-03 Build the `[locale]` shell setting `lang` and `dir` from a typed locale, with `generateStaticParams` returning `en` — closes AC-005 — files: app/[locale]/layout.tsx, app/[locale]/page.tsx, lib/locale.ts — depends: T-02
- [ ] T-04 Redirect `/` to `/en` — closes AC-002 — files: next.config.ts — depends: T-03
- [ ] T-05 Establish the Tailwind theme tokens and the logical-property baseline, so no physical directional utility appears in any component — closes AC-007 — files: tailwind.config.ts, app/globals.css — depends: T-01
- [ ] T-06 Render the hero from the content module, with the product image marked `priority` — closes AC-009, AC-029 — files: components/HeroSection.tsx, app/[locale]/page.tsx — depends: T-03, T-05
- [ ] T-07 Render the mid-page content sections — social proof strip, three feature blocks, specification grid, testimonials — with every image through `next/image` at explicit dimensions and lazy-loaded — closes AC-028 — files: components/SocialProof.tsx, components/FeatureBlock.tsx, components/SpecGrid.tsx, components/Testimonials.tsx — depends: T-06
- [ ] T-08 Build the FAQ accordion, each question focusable and toggled by Enter or Space — closes AC-012, AC-013 — files: components/Faq.tsx — depends: T-07
- [ ] T-09 Build the email capture markup: a visible associated label, an unticked separable consent checkbox that gates submission, and the consent notice linking the privacy page — closes AC-026, AC-044, AC-050 — files: components/EmailCapture.tsx — depends: T-08
- [ ] T-10 Build the footer with the fictional-demo disclaimer, completing the eight-section order — closes AC-011, AC-035 — files: components/Footer.tsx, app/[locale]/page.tsx — depends: T-09
- [ ] T-11 Add `GET /api/health` returning `{ ok: true }` with no upstream call — closes AC-040 — files: app/api/health/route.ts — depends: T-01
- [ ] T-12 Write the Dockerfile as a multi-stage build on `output: 'standalone'`, running non-root and honouring `PORT` — closes AC-038, AC-039 — files: Dockerfile, .dockerignore, next.config.ts — depends: T-11
- [ ] T-13 Write the nginx server block setting `X-Forwarded-For`, and deploy the container to the subdomain over HTTPS — closes AC-042 — files: deploy/nginx.conf.example, deploy/README.md — depends: T-12

---

## Coverage

19 criteria in this slice, 13 tasks, no orphans in either direction.

|  | 002 | 003 | 005 | 007 | 009 | 011 | 012 | 013 | 026 | 028 | 029 | 035 | 036 | 038 | 039 | 040 | 042 | 044 | 050 |
| --- |:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| T-01 |  |  |  |  |  |  |  |  |  |  |  |  | ● |  |  |  |  |  |  |
| T-02 |  | ● |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| T-03 |  |  | ● |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| T-04 | ● |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| T-05 |  |  |  | ● |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| T-06 |  |  |  |  | ● |  |  |  |  |  | ● |  |  |  |  |  |  |  |  |
| T-07 |  |  |  |  |  |  |  |  |  | ● |  |  |  |  |  |  |  |  |  |
| T-08 |  |  |  |  |  |  | ● | ● |  |  |  |  |  |  |  |  |  |  |  |
| T-09 |  |  |  |  |  |  |  |  | ● |  |  |  |  |  |  |  |  | ● | ● |
| T-10 |  |  |  |  |  | ● |  |  |  |  |  | ● |  |  |  |  |  |  |  |
| T-11 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ● |  |  |  |
| T-12 |  |  |  |  |  |  |  |  |  |  |  |  |  | ● | ● |  |  |  |  |
| T-13 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | ● |  |  |

## Criteria not in this slice

Not gaps — scheduled work, named by milestone.

| Criterion | Milestone | Why not M1 |
| --- | --- | --- |
| AC-001, AC-008 | **M3** | Both name routes that do not exist yet — AC-001 names `/he`, AC-008 names four routes including both privacy pages. The spec §10 cites both under M1; that is an over-claim, and citing them here would make T-03 unverifiable. |
| AC-016 – AC-025, AC-027, AC-041 | M2 | Subscribe route, error states, privacy page |
| AC-045, AC-046, AC-048, AC-051, AC-057, AC-060 | M2 | Double opt-in, consent record, Art. 13 disclosure, live-region announcement, log scrubbing |
| AC-004, AC-006 | M3 | Hebrew locale and the language toggle |
| AC-010, AC-014, AC-015, AC-030 – AC-032, AC-037, AC-043 | M4 | Motion, focus, contrast, Lighthouse, captures |
| AC-049, AC-052 – AC-054 | M4 | Accessibility statement, target size, focus obscuring, alt text |
| AC-033, AC-034 | M2 | Umami script and the `subscribe` event |
| AC-047, AC-055, AC-056, AC-058, AC-059 | M5 | Marketing template, TLS and headers, log retention, ROPA and breach runbook, storage check |
