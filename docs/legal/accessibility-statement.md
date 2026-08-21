> ⚠️ **DISCLAIMER**: This document is an AI-generated template intended for MVP/early-stage testing. It does not constitute formal legal advice. Before scaling, accepting paying customers, or entering regulated markets, have this document reviewed by qualified legal counsel in your target jurisdiction.

# Accessibility Statement

**Last reviewed:** [INSERT_EFFECTIVE_DATE]

## Our commitment

[INSERT_COMPANY_NAME] wants [INSERT_SERVICE_NAME] to be usable by everyone, including people who
use screen readers, keyboard navigation, magnification, speech input, or other assistive
technology.

## Standard we work to

We aim to meet **WCAG 2.2 Level AA**. It is the standard referenced by EN 301 549 under the
European Accessibility Act and by Israeli Standard 5568.

## How we are doing

We currently meet WCAG 2.2 Level AA **partially**. Most of the site conforms; the list below is
what does not, and it is honest rather than aspirational.

### Known problems

- **Text contrast over the moving product render is not established.** The palette is measured
  against the page background and every pair passes, but the headline copy in the pinned
  sequence sits over a live 3D render with a moving warm light behind it. Token measurement does
  not prove contrast over that. Sampling rendered frames at each beat would settle it, and has
  not been done.
- **The pinned sequence is three screens of scrolling with no shortcut.** Reduced-motion
  settings remove the easing and the camera damping, but someone who wants less motion still has
  the same distance to travel.
- **No screen reader testing has been carried out.** The semantics were written carefully — one
  `h1`, faded beats removed from the accessibility tree with `inert`, the canvas hidden from
  assistive technology with every word it shows also present as text, the countdown silenced from
  per-second announcements — but none of it has been heard through NVDA, JAWS or VoiceOver.
  Automated checks establish roughly a third of WCAG; the rest needs a person.
- **A link shared with a fragment lands under the fixed header.** Following `#waitlist` from
  inside the page moves focus correctly, but arriving from outside with the fragment in the URL
  scrolls the target under the header.

## How we test

- The build fails on lint and type errors, and a repository check rejects physical directional
  CSS so the right-to-left layout cannot silently break.
- Contrast ratios are computed from the design tokens and recorded beside them in the
  stylesheet.
- Interactive target sizes are measured against the 24×24 minimum.
- Keyboard-only walkthrough of the whole page.

Automated tools alone do not establish conformance.

## Tell us about a problem

If you hit a barrier, we want to know. We will treat it as a bug, not a request.

Email [INSERT_CONTACT_EMAIL]
Phone [INSERT_PHONE_NUMBER]

We aim to reply within two working days, and to tell you what we will do and when.

If you are not satisfied with our response, you can escalate — in the European Union to the
enforcement body in your member state, and in Israel to the Commission for Equal Rights of
Persons with Disabilities.

## Israel

Our accessibility coordinator is [INSERT_COORDINATOR_NAME], reachable at [INSERT_CONTACT_EMAIL]
and [INSERT_PHONE_NUMBER].

This statement is published in accordance with the Equal Rights for Persons with Disabilities
(Service Accessibility Adjustments) Regulations, 5773-2013.

## Alternatives

If any part of the site remains inaccessible to you, contact us and we will provide the same
information another way, at no extra cost.

---

## Still blank — fill before publishing

| Placeholder | What it needs |
| --- | --- |
| `[INSERT_COMPANY_NAME]` | the operator's registered name |
| `[INSERT_SERVICE_NAME]` | what the site is called to a visitor |
| `[INSERT_CONTACT_EMAIL]` | the address that receives accessibility reports |
| `[INSERT_PHONE_NUMBER]` | a phone route — reg. 35 expects one, not only email |
| `[INSERT_COORDINATOR_NAME]` | the named accessibility coordinator |
| `[INSERT_EFFECTIVE_DATE]` | the date this is published |

None of these were inferred.

## Needs Hebrew

Regs. 5773-2013 expect this statement **in Hebrew**, with the coordinator's contact details.
**This draft does not provide the translation.**

## Before this is published

The alternatives paragraph is a commitment, and the two-working-day reply is a commitment.
Someone has to be able to honour both. Review the statement whenever the site changes
materially, and at least annually — a statement dated two years ago tells a reader you stopped
caring.
