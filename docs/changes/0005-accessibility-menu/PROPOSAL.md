# 0005 — Accessibility menu

> Status: proposed · 2026-08-21 · Against spec version 3.0

## Motivation

Israeli sites are expected to carry an accessibility menu. It is convention
rather than obligation — Regulations 5773-2013 reg. 35 requires the *statement*,
which exists at `/accessibility` and closes AC-049, and IS 5568 governs the site
itself — but a Hebrew site without one reads as unfinished to an Israeli visitor
and to the accessibility coordinator who reviews it.

**It is built, not installed.** The usual route is a third-party overlay script.
Those rewrite the DOM and patch ARIA at runtime, and the accessibility
community's position on them is not mixed: they routinely worsen the experience
for the screen-reader users they claim to serve. They would also put a
third-party script on every page, which this site has otherwise refused. What
ships instead is ordinary CSS switched by data attributes on the root element —
it never touches the accessibility tree, so it cannot fight assistive technology.

Nothing here is offered as compliance with anything, and the menu says so to the
visitor in its own footnote.

## Criteria added

| ID | Criterion |
| --- | --- |
| AC-072 | The site shall present, on every page, an accessibility menu offering text size, high contrast, link highlighting, a readable font, stopped motion and an enlarged cursor. |
| AC-073 | The accessibility menu shall be fully operable by keyboard: opened from a button with an accessible name, closed by `Escape` with focus returned to that button, and absent from the tab order while closed. |
| AC-074 | While motion is stopped from the accessibility menu, the site shall halt the WebGL camera as well as CSS animation and smooth scrolling. |
| AC-075 | The accessibility menu shall retain its settings across navigation within the site. |
| AC-076 | The accessibility menu shall link to the accessibility statement and shall state that it does not replace the accessibility of the site itself. |

## Criteria amended

Both keep their IDs: the intent of each is unchanged, and what changes is an
exception the original wording should have carried. Neither is a relaxation
reached for after failing — AC-052 was failing on a target WCAG itself exempts,
and AC-059 was written before anything on this site had a reason to remember
something for the visitor's own benefit.

### AC-052 — add WCAG's inline exception

**Before:** Every interactive target shall measure at least 24×24 CSS pixels.

**After:** Every interactive target shall measure at least 24×24 CSS pixels,
except a target inline within a sentence, which WCAG 2.2 SC 2.5.8 exempts.

**Reason:** the criterion as written is unachievable by design for a link inside
a paragraph — meeting it would space body text out to 24px line boxes and damage
readability for everyone. WCAG carries the exception for exactly this. The one
target that failed and was *not* exempt, the consent checkbox at 18×18, was
fixed rather than excused; it is now 24×24.

### AC-059 — carve out accessibility preferences

**Before:** The site shall set no cookie and shall write nothing to
`localStorage`, `sessionStorage` or IndexedDB.

**After:** The site shall set no cookie, and shall write nothing to
`localStorage`, `sessionStorage` or IndexedDB **other than the accessibility
preferences the visitor sets from the accessibility menu**, under a single key
containing no identifier.

**Reason:** AC-075 cannot hold without it, and a menu that forgets a visitor's
150% text on every navigation is close to useless to the person who needed it.
The storage is exempt from consent rather than tolerated in spite of it:
ePrivacy Art. 5(3) exempts storage strictly necessary for a service the user has
explicitly requested, and a font size the visitor just clicked is that. It holds
six booleans and an integer, no identifier, and nothing reads it but the page
that wrote it. **The absolute rule stands for everything else** — this is the
only permitted key, and analytics remains cookieless under AC-033.

## Section edits

### §3 Architecture — Components — add

| Component | Responsibility | Technology |
| --- | --- | --- |
| Accessibility menu | Holds and applies visitor display preferences. Renders no content and reads no page state. | React client component + CSS attribute selectors |

### §9 Security & Permissions — add

> **Client-side storage.** One key, `meridian.a11y`, holding display preferences
> (AC-059 as amended by 0005). It is read only by the page that wrote it, is
> never sent anywhere, and contains no identifier — the parse is defensive and
> spreads over defaults, so a corrupt or stale value degrades to the default
> rather than throwing.

**Reason for the addition:** §9 previously asserted no client-side storage at
all. Leaving that unqualified while the code writes a key is precisely the
unexplained divergence `spec-drift` classifies as a regression.

### §10 Build Order — M4 — add

| Row | Closes |
| --- | --- |
| `- [ ] Accessibility menu: preferences, keyboard operation, motion stop, persistence` | AC-072, AC-073, AC-074, AC-075, AC-076 |

## Impact

- Milestones affected: **M4** — one row added
- Criteria added: 5 · amended: 2 · retired: 0
- Census after merge, assuming 0004 merges first: **61 active, 15 tombstoned, 76 ids issued**
- §9 Security gains a subsection; §3 gains a component. No change to §8 Edge Cases
- Overlaps 0004 in §10 M5 only by adjacency, not by edit: 0004 touches M5, this touches M4
- `components/a11y/AccessibilityMenu.tsx` is 200 lines, over the constitution's
  150-line soft limit and under its 250 hard limit. Logged rather than split:
  the file is one control panel and splitting it by preference would produce six
  files that are only ever read together
