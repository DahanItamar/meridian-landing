# Smell Registry

Every `SM-###` this repository has recorded, newest last. Nothing is ever deleted:
a paid-off smell becomes a tombstone, and one judged not worth fixing keeps its
row so the next run does not re-litigate it.

Allocation: next id is **SM-006**. Never reuse a retired id.

| ID | Smell | Where | Status |
|:-:|---|---|---|
| SM-001 | Divergent Change — form state machine, validation rules and presentation in one file | `components/sections/WaitlistSection.tsx` (242 lines) | ~~removed~~ R-01 and R-02 of 0001 · 242 → 201 lines |
| SM-002 | Shotgun Surgery — adding a beat edits three places correlated only by array index | `lib/scrolly-config.ts:49`, `lib/scrolly-config.ts:67`, `content/he.ts:33` | logged, 0001 · no scheduled work adds a beat |
| SM-003 | Large Class — 354 lines, over the constitution's 250 hard limit | `components/scrolly/PackScrolly.tsx` | logged, 0001 · 332 lines then, 354 now — the responsive fix and the `<picture>` negotiation both landed here, so "nothing scheduled edits it" has now been wrong twice |
| SM-004 | Four components in one file, against the constitution's one-per-file rule; 343 lines | `components/three/PackStage.tsx` | logged, 0001 · 317 lines then, 343 now — the breakpoint fix edited it, and the media-query listener had to be threaded past three other components to reach the one that samples the script |
| SM-005 | Large Class — 173 lines, over the 150 soft limit | `components/brand/BeansLoader.tsx` | **won't fix** — 160 of those lines are generated SVG path data; splitting them creates two files nobody reads instead of one |
