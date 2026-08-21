# 0001 Coffee pivot, WebGL hero, Hebrew-only — Tasks

> Source: `SPEC.md` §10 M1, as amended by `docs/changes/0001-coffee-pivot-webgl-hero-hebrew/PROPOSAL.md`
> Constitution: `docs/CONSTITUTION.md` v1.3
> Verify: `npm run verify`

**This list is the work that is left.** The page itself is built — nav, the
three-beat pinned sequence, the countdown, the waitlist form and the footer all
render, and twenty criteria in this slice are already closed (see the handover in
the session that wrote this file, or re-derive by reading §2.1 against the code).
Nothing below re-does any of it.

M1's demo statement is unchanged: **a link you can send someone.** T-01 to T-06
are what makes the page correct; T-07 to T-10 are what makes it lawful to point
at a real address; T-11 to T-14 are what put it on a URL.

- [x] T-01 Demote beats 2 and 3 from `h1` to `h2` so the page has exactly one `h1` — closes AC-032 — files: components/scrolly/PackScrolly.tsx
- [x] T-02 Point every nav, column and legal link at a destination that exists, or stop rendering it — closes AC-067 — files: components/layout/SiteFooter.tsx, components/layout/NavBar.tsx, content/he.ts
- [x] T-03 Audit every interactive target to at least 24×24 CSS px — closes AC-052 — files: components/layout/NavBar.tsx, components/layout/SiteFooter.tsx, components/scrolly/PackScrolly.tsx, app/globals.css
- [x] T-04 Add scroll-margin under the fixed nav so an anchored or focused element is never covered by it — closes AC-053 — files: app/globals.css
- [x] T-05 Render a static poster of the pack in the pinned section's server markup and mount the canvas only after first paint, with the section reserving its height throughout — closes AC-061, AC-062 — files: components/scrolly/PackScrolly.tsx, components/three/PackStage.tsx, public/art/
- [x] T-06 Add the reduced-motion-aware reveal primitive and apply it to the countdown, waitlist and footer — closes AC-014 — files: components/motion/Reveal.tsx, components/sections/RoastCountdown.tsx, components/sections/WaitlistSection.tsx
- [x] T-07 Privacy page at `/privacy` carrying the controller, purposes, processor, transfer mechanism, retention and rights set — closes AC-008, AC-027 — files: app/privacy/page.tsx, content/he.ts
- [x] T-08 Consent notice under the form naming the purpose of collection and linking the privacy page — closes AC-026 — files: components/sections/WaitlistSection.tsx, content/he.ts — depends: T-07
- [x] T-09 Unticked, separable consent checkbox that blocks submission until ticked, with its version recorded in content — closes AC-044 — files: components/sections/WaitlistSection.tsx, content/types.ts, content/he.ts
- [x] T-10 Accessibility statement at `/accessibility`, linked from the footer, naming WCAG 2.2 AA, known limitations and a contact — closes AC-008, AC-049 — files: app/accessibility/page.tsx, content/he.ts — depends: T-02
- [x] T-11 `GET /api/health` returning `{ ok: true }` and contacting nothing upstream — closes AC-040 — files: app/api/health/route.ts
- [x] T-12 Dockerfile on `output: 'standalone'`, running as a non-root user and honouring `PORT` — closes AC-038, AC-039 — files: Dockerfile, .dockerignore, next.config.ts
- [x] T-13 `deploy/nginx.conf.example` forwarding `X-Forwarded-For`, and the site served over HTTPS at its subdomain — closes AC-042 — files: deploy/nginx.conf.example, deploy/README.md — depends: T-12
- [x] T-14 Desktop and mobile captures into `shots/` — closes AC-043 — files: shots/


## Queued — blocked on files only you can export

Three LottieFiles animations were requested. **All three return `403`** — they sit behind the
requester's account, and the share pages serve a 3 KB client-rendered shell with no asset URL in
it. Nothing here can be started until the JSON is in the repository.

| Wanted for | Share link | Status |
| --- | --- | --- |
| Form success | `app.lottiefiles.com/share/9318cb67-…` | shipped as drawn SVG instead; swap on request |
| Section loading | `app.lottiefiles.com/share/e4c70b4a-…` | **see note** |
| Checkbox tick | `app.lottiefiles.com/share/add0bdf7-…` | not started |

To unblock: **Download → Lottie JSON** from LottieFiles, save to `public/anim/<name>.json`.

Two things to decide with that, not after it:

- **A player is a dependency.** `lottie-web` is roughly 70 kB gzip on a page already carrying
  227 kB of WebGL above the fold, and AC-037's Lighthouse floor is the criterion most at risk
  here. Constitution principle 6 wants a named problem the dependency is the only solution to.
  Loading it lazily, only for the surface that uses it, is the mitigation.
- **The loading animation has nowhere to go.** This page has exactly one asynchronous surface —
  the WebGL stage — and T-05 answers it with a poster frame of the actual pack, which is
  strictly better than a spinner because it shows the product rather than announcing a wait.
  Every other section is static server-rendered HTML: a loading animation there would animate
  nothing.

## Coverage

```
              32  67  52  53  61  62  14  08  27  26  44  49  40  38  39  42  43
T-01 h1        ●
T-02 links         ●
T-03 targets           ●
T-04 scroll                ●
T-05 poster                    ●   ●
T-06 reveals                           ●
T-07 privacy                               ●   ●
T-08 notice                                        ●
T-09 checkbox                                          ●
T-10 a11y stmt                             ●               ●
T-11 health                                                    ●
T-12 docker                                                        ●   ●
T-13 nginx                                                                 ●
T-14 shots                                                                     ●
```

No row without a dot, no column without a dot.

`AC-008` is cited twice because it names three prerendered routes and two of them
do not exist yet; it is not closed until both T-07 and T-10 are done.

## Not in this slice

| Criteria | Milestone | Note |
| --- | --- | --- |
| AC-010, AC-016 – AC-025, AC-041 | M2 | The subscribe endpoint. The form collects nothing until it exists. |
| AC-033, AC-034 | M2 | Umami. Blocked on the open question about whether it is running. |
| AC-045 – AC-048 | M2 | Consent recording, double opt-in, marketing message rules. |
| AC-037 | M4 | Lighthouse ≥90/≥90. **Depends on T-05** — the WebGL bundle is above the fold. |
| AC-054 | M4 | Alt text. Currently vacuous: there is no raster image in the DOM. |
| AC-055 – AC-060 | M5 | nginx hardening, ROPA, breach runbook, storage audit. |
