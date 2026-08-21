# 0001 — M2 subscribe endpoint

> Status: proposed · 2026-08-21 · baseline `npm run verify` **green**, no ESLint warnings
> Static analysis: `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` — **nothing flagged**
> Scheduled work considered: `SPEC.md` §10 M2 (subscribe endpoint, submit flow, consent recording, log scrubbing)

**One actionable finding.** The codebase is two days old with a spec that was
merged this session, and most of what a catalogue would match here is either
deliberate or unscheduled. That is the expected result and it is worth being
told plainly rather than padded.

## 1. Actionable

- [x] R-01 Extract the field rules into `lib/waitlist-validation.ts` — removes SM-001 — preserves AC-018, AC-044, AC-050 — files: components/sections/WaitlistSection.tsx, lib/waitlist-validation.ts — kind: mechanical
- [x] R-02 Extract the success panel into `components/sections/WaitlistSuccess.tsx` — removes SM-001 — preserves AC-017 — files: components/sections/WaitlistSection.tsx, components/sections/WaitlistSuccess.tsx — kind: mechanical — depends: R-01

### SM-001 · Divergent Change — three reasons to change, one file

`components/sections/WaitlistSection.tsx:22-38` (state), `:40-71` (rules), `:73-242` (markup)

The file currently holds five `useState`, three `useRef`, three `useId`, a
validation function with three inline branches and a regex, and the JSX for both
the form and the success state. 242 lines, already past the constitution's 150
soft limit.

**Every one of M2's first four tasks edits this file**, and each adds a fourth
kind of reason to change it:

| M2 task | What it adds here | Criteria |
| --- | --- | --- |
| Client submit flow | pending state, disabled control, retry | AC-016, AC-019 |
| `POST /api/subscribe` | a network call and its failure taxonomy | AC-021 |
| Honeypot | a fourth field that must not be validated like the others | AC-022 |
| Live region | error association across three fields, not one | AC-051 |

Added to the current shape, the file crosses the 250-line hard limit and
interleaves network handling with validation and markup — three things that fail
for unrelated reasons and would then be read together to change any of them.

**R-01** moves the rules to `lib/`, which the constitution already reserves for
code with no React and no DOM. They become independently readable and the
component keeps only the wiring. Mechanical: the same rules in the same order,
returning the same message for the same input.

**R-02** moves the success panel out. It shares no state with the form beyond
the name, and it is the half M2 never touches — separating it means the M2 diff
is entirely about the form.

Both are mechanical, so both can land in one commit ahead of M2 rather than
inside it.

## 2. Cleanup

**Nothing.** `tsc --noUnusedLocals --noUnusedParameters` flags no unused local,
parameter or import, and ESLint reports no warnings.

An earlier grep in this session appeared to show seven unused exports. Six were
false positives — `Row`, `Countdown`, `LegalDoc` and `Keyframe` are referenced
inside their own module by the exported interfaces that use them, and `Frame` is
`sample()`'s return type. They are recorded here so the same grep does not get
run again and believed.

## 3. Logged this run

Real, recorded, not scheduled. No work proposed.

| ID | Smell | Why not actionable |
| --- | --- | --- |
| SM-002 | Shotgun Surgery — a beat lives in `SCROLLY_STEPS`, `KEYFRAMES` and `content.scrolly.beats`, correlated by index with nothing enforcing equal length | No scheduled work adds or removes a beat. Worth paying off the moment one does — the failure mode is silent desync, not an error |
| SM-003 | `PackScrolly.tsx` at 332 lines, over the constitution's hard limit of 250 | M2, M4 and M5 do not edit it. It is a constitution violation and should be reported as one by `/spec-drift`, which is a different question from whether it blocks work |
| SM-004 | `PackStage.tsx` holds four components against the constitution's one-per-file rule, at 317 lines | Same — a rule violation nothing scheduled trips over |

SM-003 and SM-004 are the two findings a report is most tempted to lead with,
because they are measurable. Both fail the gate: the constitution's size limits
are `spec-drift`'s finding to report, and this stage only acts on what stands
between the user and work that is actually queued.

## 4. Routed to spec-architect

**Nothing.** No finding in this run requires a criterion to change.
