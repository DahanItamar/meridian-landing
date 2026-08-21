# 0004 — Retire the marketing-message criterion

> Status: proposed · 2026-08-21 · Against spec version 3.0

## Motivation

AC-047 requires every marketing message to name its sender, mark itself as an
advertisement in the locale it is sent in, and carry a free one-click opt-out.
Proposal 0003 removed the email pipeline: the site sends no messages of any
kind. The criterion governs a capability that no longer exists.

This is a correction, not a new decision. **The spec already reached this
conclusion and failed to apply it here.** §13's conflict table states, of the
consent behaviour, that "§ 30A no longer binds because nothing is sent, and they
are the first things to rebuild if that changes" — and 0003 retired AC-045 and
AC-046 on exactly that reasoning. AC-047 sits between them in §2.1 and was
skipped. `/spec-drift` is not installed, so 0003 was merged by hand; this is the
third defect that route has produced, after the two found in the v2.0 merge.

Retiring it leaves the premise unguarded, which is the part worth fixing rather
than just recording. "Nothing is sent" is what makes the retirement lawful, and
today it is true only because nobody has added a mail client. AC-071 makes it a
checkable property of the build, so that reintroducing a sender fails a
criterion instead of quietly reviving an obligation nobody is watching.

## Criteria added

| ID | Criterion |
| --- | --- |
| AC-071 | The application shall declare no outbound message dependency — no SMTP client and no transactional-mail SDK — and no code path shall send mail, so that the precondition AC-047 was retired on is verifiable rather than assumed. |

## Criteria retired

| ID | Reason |
| --- | --- |
| AC-047 | Retired by 0004 — the obligation attaches to sending an advertisement, and nothing is sent. Israeli Communications Law 5742-1982 § 30A binds a sender; with the pipeline gone there is no message to name a sender on, mark, or offer an opt-out from. **Revives in full the moment anything is sent** — alongside AC-045 and AC-046, which 0003 retired on the same ground. |

## Section edits

### §10 Build Order — M5 — remove

**Before:** `- [ ] Marketing email template: sender identity, advertisement marking, one-click opt-out — closes AC-047`

**Reason:** it is the only row that closes AC-047, and a task closing a retired
criterion is drift arriving early — `spec-implement` warns on it and builds it
anyway. M5 keeps its other four rows.

### §10 Build Order — M5 — add

| Row | Closes |
| --- | --- |
| `- [ ] Assert no outbound message dependency: no mail client in the dependency tree, no send path in the code` | AC-071 |

**Note:** this is not replacement work. The removed row was a mail template to
be written; this one is an assertion that no mailer exists, which is the
opposite obligation and is satisfied by the build as it stands today.

### §13 Compliance — no edit

The Module 4 row already records § 30A and already states that it no longer
binds. It needs nothing: it is the evidence for this proposal, not a casualty
of it. Noted explicitly so a reader does not go looking for a missing edit.

## Impact

- Milestones affected: **M5** — one row removed, one added; M5's open count is unchanged at 4
- Criteria added: 1 · retired: 1
- Census after merge: **56 active, 15 tombstoned, 71 ids issued**
- No change to §3 Architecture, §8 Edge Cases, or §9 Security
- No conflict with open proposals: `0002-m2-subscribe-endpoint` carries a `TASKS.md` only and makes no section edits
