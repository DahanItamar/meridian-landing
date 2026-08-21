# M2 — The form actually works — Tasks

> Source: `SPEC.md` §10 M2 (spec v2.0) · Constitution: `docs/CONSTITUTION.md` v1.3
> Verify: `npm run verify`
> No proposal — this is a base-spec milestone, so the directory is `0002-m2-<milestone>`.

M2's demo statement: **subscribe on the live site; the address appears in Resend.**

**Seven of these twelve can be done today.** Five cannot, and they are marked ⛔
with what they wait on rather than being left to fail at verification time.
Nothing about the ordering assumes the blocked ones — T-05 lands a working
end-to-end form against a route that answers `502 upstream_failed`, which is
exactly what AC-041 says should happen with no key.

- [x] T-01 `POST /api/subscribe`: parse the request, validate the address, screen the honeypot, answer per the §6 contract — closes AC-021, AC-022 — files: app/api/subscribe/route.ts, lib/subscribe-contract.ts
- [x] T-02 Per-IP rate limit, 5 requests per 60s, keyed on the first `X-Forwarded-For` entry with the socket address as fallback — closes AC-023 — files: app/api/subscribe/route.ts, lib/rate-limit.ts — depends: T-01
- [x] T-03 Log scrubbing: no address, no key and no request body reaches any log — closes AC-057 — files: app/api/subscribe/route.ts — depends: T-01
- [x] T-04 Server-only env wiring, and `502 upstream_failed` when either Resend variable is absent while the rest of the site keeps serving — closes AC-025, AC-041 — files: app/api/subscribe/route.ts, deploy/README.md — depends: T-01
- [x] T-05 Client submit flow: disabled control and pending state while in flight, error message with the address retained and a retry on failure — closes AC-016, AC-019 — files: components/sections/WaitlistSection.tsx, content/types.ts, content/he.ts — depends: T-01
- [~] T-06 Resend call behind an 8-second `AbortSignal`, expiry mapped to `502`, and an address already on the list answered `200` — **removed by proposal 0003** (AC-020, AC-024 retired)
- [~] T-07 Record the consent text version, the UTC submission timestamp and the locale as fields on the Resend contact — **removed by proposal 0003** (AC-045 retired)
- [~] T-08 Double opt-in: a confirmation email carrying a single-use link, and no subscription until it is followed — **removed by proposal 0003** (AC-046 retired)
- [x] T-09 Umami script loaded, setting no cookie — closes AC-033 — files: app/layout.tsx
- [x] T-10 Record a Umami event named `subscribe` when the request succeeds — closes AC-034 — files: components/sections/WaitlistSection.tsx — depends: T-05, T-09
- [~] T-11 Privacy page carries the full Art. 13 disclosure set: controller identity, each purpose and its basis, recipients, transfer mechanism, retention period, the rights list, withdrawal, and the supervisory-authority route — **removed by proposal 0003** (AC-048 retired)
- [~] T-12 Privacy page states the 30-day response commitment and names the address that receives erasure and opt-out requests — **removed by proposal 0003** (AC-060 retired)

- [x] T-13 State in the waitlist section that the site is a demonstration and the address is neither stored nor transmitted, and remove the `RESEND_*` env check the retirement of AC-041 deletes — closes AC-070 — files: components/sections/WaitlistSection.tsx, content/types.ts, content/he.ts, app/api/subscribe/route.ts — depends: T-05

## Coverage

```
        021 022 023 057 025 041 016 019 020 024 045 046 033 034 048 060
T-01     ●   ●
T-02             ●
T-03                 ●
T-04                     ●   ●
T-05                             ●   ●
T-06                                     ●   ●
T-07                                             ●
T-08                                                 ●
T-09                                                     ●
T-10                                                         ●
T-11                                                             ●
T-12                                                                 ●
```

No row without a dot, no column without a dot.

## Already closed in M1 — do not re-implement

M2's entry in §10 lists these beside the client flow, but all three were closed
and verified during M1 and must simply stay true. `spec-implement` should
confirm them after T-05 rather than build them.

| AC | State |
| --- | --- |
| AC-017 | Form replaced by the confirmation — verified: *"המקום שלך שמור, איתמר."* |
| AC-018 | Invalid address renders inline and issues no request — verified: 0 non-GET requests |
| AC-051 | Errors associated with their input via `aria-describedby` and announced through `role="alert"` |

## Blocked, and on what

| Tasks | Waiting on | Who supplies it |
| --- | --- | --- |
| T-06, T-07, T-08 | A Resend account and API key. §12 records this as an open question against M2 | Account signup; free tier is enough |
| T-11, T-12 | Registered address, retention period, contact email — three of the five blanks in `HANDOFF.md` | The operator |

The key blocks three tasks, not the milestone. T-01 to T-05, T-09 and T-10 close
ten of the sixteen criteria without it.

## One spec defect found while decomposing

`SPEC.md` §5 declares `SubscribeRequest.locale: Locale`, and the `Locale` type was
deleted when proposal 0001 removed the routing machinery. The merge of 0001 into
the spec was done by hand this session — `/spec-drift` is not installed — and this
reference was missed.

It lands on **T-01**, which has to write that interface. This stage does not edit
`SPEC.md`, so it is reported rather than fixed: the field is either dropped, or
respecified as a string constant now that one locale exists. Either way it is a
change proposal for `/spec-architect`, and it should be resolved before T-01
starts rather than guessed at inside it.
