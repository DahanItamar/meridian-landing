# 0003 — Drop the email pipeline

> Status: proposed · 2026-08-21 · Against spec version 2.0

## Motivation

This site is a portfolio demonstration of a fictional brand. The spec was written
as though it would operate: an address reaching a real Resend audience, a signed
DPA, double opt-in, a retention period, an erasure contact. None of that is
wanted, and each item carried a real obligation the moment it existed.

The form already demonstrates everything a visitor or a reviewer looks at — a real
POST, syntactic validation, per-IP rate limiting, a honeypot, a pending state, an
error path with retry, and a success state. What it does *not* do is put an
address in a mailbox, and dropping that removes a service account, a data
processor, a third-country transfer, and the whole of Communications Law § 30A's
exposure.

**The route stays.** It is the part with portfolio value: a typed contract, a
limiter, a honeypot, and an error taxonomy. Only the upstream leaves.

## Criteria added

| ID | Criterion |
| --- | --- |
| AC-070 | The waitlist section shall state that the site is a demonstration and that the address is neither stored nor transmitted, before the submit control. |

AC-070 exists because retiring the pipeline opens a gap nobody asked about. The
success state currently reads *"נשלח מייל אחד ביום שהקלייה הראשונה יוצאת"* — one
email on the day the roast ships. With no pipeline that is a promise the site
cannot keep, made to a real person reading a real page. The footer disclosure
(AC-035) says the *brand* is invented; it says nothing about the form.

An inert form that admits it is inert is a demonstration. One that says it will
write to you is a small lie, and it is the kind a reviewer notices.

## Criteria retired

| ID | Reason |
| --- | --- |
| AC-020 | No Resend call to time out. |
| AC-024 | No list to be already on. Membership cannot be disclosed by a route that holds no membership. |
| AC-045 | No contact to record a consent version, a timestamp or a locale on. The version string stays in the content module — it identifies the wording a visitor agreed to, which is not the same thing as a field on a vendor's record. |
| AC-046 | Double opt-in confirms an address for a sender that no longer exists. |
| AC-048 | Art. 13 disclosure describes processing. There is none: no recipient, no transfer, no retention period, because nothing is kept. |
| AC-060 | A 30-day response commitment for erasure requests against data that is never stored. |
| AC-025 | **Not named in the request, retired as a consequence.** There is no Resend key, so "shall never expose the Resend API key" is vacuously true for the rest of the project's life and `spec-drift` would check it forever. If a secret is ever introduced it needs its own criterion, not this one revived. |
| AC-041 | **Same.** `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` cease to exist, so behaviour on their absence is not a requirement. The code that closed it in M2/T-04 is removed by this change. |

## Section edits

### §2 Scope — In scope — replace

**Before:** Working email capture writing to a Resend audience
**After:** A working capture form — validated, rate-limited, honeypot-screened — that stores and transmits nothing

**Reason:** the line described the pipeline this proposal removes. What survives is
the surface, and saying so keeps the scope honest rather than merely shorter.

### §2.1 Acceptance Criteria — replace

| ID | Before | After |
| --- | --- | --- |
| AC-022 | …the subscribe route shall respond `200` without contacting Resend. | If the honeypot field is non-empty, then the subscribe route shall respond `200` and shall take no further action. |
| AC-027 | The site shall serve a privacy page stating what is collected, the processor, the retention period, and a contact address for deletion requests. | The site shall serve a privacy page stating what the form collects, that the address is neither stored nor transmitted, and that the brand and the product are a portfolio demonstration. |

### §3 Architecture — Components — replace

**Before:**

| Component | Responsibility | Technology |
| --- | --- | --- |
| Subscribe route | Validates, screens the honeypot, rate-limits, forwards to Resend. Stores nothing durable. | Next.js Route Handler, Node runtime |

**After:**

| Component | Responsibility | Technology |
| --- | --- | --- |
| Subscribe route | Validates, screens the honeypot, rate-limits, answers. Forwards nowhere and stores nothing. | Next.js Route Handler, Node runtime |

**Reason:** "forwards to Resend" is the only line in the component table this
change makes false.

### §3 Architecture — Decisions — replace

**Before:**

```
Resend, called from our own route — the key never leaves the server.
Because: the address is the conversion, and it should not depend on a third-party
  iframe or a branded free-tier response sitting in the critical path.
Instead of: Formspree — less code, but puts a vendor's UI in the one interaction
  the page exists to produce.
Revisit if: the list ever needs segmentation or automated sequences.
```

**After:**

```
No email provider. The route accepts, validates and answers; nothing is sent.
Because: this is a portfolio demonstration of a fictional brand. A live pipeline
  means a service account, a signed DPA, a third-country transfer and
  Communications Law § 30A applying in full — real obligations acquired to
  demonstrate a form that already demonstrates itself without them
Instead of: Resend called from our own route — the original choice (0003 reversed
  it), and still correct the moment a real address is wanted. That reasoning was
  not refuted, only descoped: an address really is the conversion, and it really
  should not depend on a vendor's iframe
Revisit if: the brand stops being fictional. Restoring it is this decision
  reversed, AC-020/024/045/046 revived under new ids, and a DPA signed first
```

**Reason:** the decision is reversed rather than deleted, and its original
justification stays legible, because that reasoning is what makes the reversal
reviewable. Nothing about Formspree changed; what changed is that no provider is
wanted at all.

### §5 Data Models — replace

**Before:** `consentVersion` is described as *recorded per contact (AC-045)*.

**After:** `consentVersion` stays in the content module, and its comment becomes
*identifies the wording a visitor agreed to; not sent anywhere*.

`SubscribeError` keeps `upstream_failed` deliberately. The route retains the
catch-all boundary added for AC-057, that boundary must answer with a code
(AC-021), and an unexpected throw is now the only thing that produces it.
Narrowing the type to match a smaller world would leave the boundary with nothing
to return.

### §6 Interfaces — replace

**Before:** `POST /api/subscribe` — *Add an address to the Resend launch audience*.
The environment table lists `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`.

**After:** `POST /api/subscribe` — *Accept a launch-list submission. Validates,
rate-limits, screens the honeypot, and answers. Contacts nothing.* Both Resend
variables leave the environment table; what remains at runtime is `PORT` and the
two `NEXT_PUBLIC_UMAMI_*`.

### §7 Core Flows — Flow B — replace

**Before:** step 5 forwards to Resend under an 8-second timeout, and the failure
branches describe Resend being down.

**After:** the route reads `X-Forwarded-For`, screens the honeypot, applies the
rate limit, and answers `200`. The failure branches that remain are real ones — a
dropped connection, a blocked request, the limiter — and each still produces
AC-019's error message, retained input and retry.

### §8 Edge Cases — remove

**Removed:** | Resend is down or slow | Request hangs, user sees a dead button | 8s timeout → `502` → error state, address retained | AC-019, AC-020 |
**Removed:** | Env vars missing on the VPS | Silent drop of every address, or a crash loop | Route returns `502` and logs; the site keeps serving | AC-041 |

**Reason:** both describe an upstream that no longer exists. The bot row above
them stays, with "Resend quota burned" replaced by "junk submissions" — the
honeypot is still doing work.

### §9 Security & Permissions — replace

**Before:** *Where it goes:* Resend, acting as processor. This project stores
nothing itself.

**After:** *Where it goes:* nowhere. The address is read from the request body,
validated, and discarded when the handler returns. No processor, no transfer, no
storage, and nothing to erase.

**Reason:** this is the section a reader checks to answer "what happens to my
data", and the honest answer became much shorter.

### §11 Assumptions — replace

| # | Before | After |
| --- | --- | --- |
| 11 | You are the data controller for every address collected here; Resend is the processor. | ~~Superseded by 0003~~ — no address is collected, so there is no controller and no processor. If the form is ever wired to a sender, this assumption returns with the pipeline. |

### §12 Open Questions — remove

**Removed:** *A Resend account and API key — blocks: M2 · needed by: start of M2.*

**Reason:** answered by this proposal. Not needed under the current scope.

### §13 Compliance Basis — add

The ACSM audit recorded in §13 was run against a site that collects an address.
It no longer does, and the effect is worth recording rather than left for a
reader to infer:

- **Communications Law § 30A** no longer binds. The consent checkbox (AC-044)
  **stays** — it is the honest UI for a form that asks to contact you, and it is
  the control that would otherwise have to be rebuilt first if the pipeline ever
  returns.
- **The Resend DPA** is not needed. There is no processor.
- **The third-country transfer** does not occur.
- **Amendment 13 registration** does not arise from this project — no database of
  personal data exists.

Unchanged: the accessibility statement (Regs. 5773-2013 reg. 35), the
fictional-brand disclosure (AC-035), and the Hebrew review that still blocks
deploy.

## Impact

- **Milestones affected:** M2 — T-06, T-07, T-08, T-11 and T-12 are removed rather
  than blocked. M2 becomes its seven completed tasks plus one new task for AC-070.
- **Criteria added:** 1 · **retired:** 8 · **amended:** 3 · net 63 → 56 active
- **Code this change removes:** the `RESEND_*` env check in
  `app/api/subscribe/route.ts`, which closed AC-041 in M2/T-04 and was verified.
  It goes with the criterion.
- **No other open proposals.**

### The one thing this makes worse

Retiring AC-046 removes double opt-in and retiring AC-045 removes the recorded
consent version. Those two are the machinery that makes a marketing list
defensible. Removing them is correct while nothing is collected — and they are
exactly what has to be rebuilt, before anything else, if the brand ever stops
being fictional. The reversal note in §3 says so, so the next person meets it as
a precondition rather than discovering it after the first send.
