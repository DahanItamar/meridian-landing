/**
 * The accessibility menu's preference model, storage and application.
 *
 * WHY THIS IS BUILT AND NOT INSTALLED. Israeli sites overwhelmingly reach for a
 * third-party overlay script for this. Those work by rewriting the DOM and
 * patching ARIA at runtime, and the accessibility community's position on them
 * is not mixed — they routinely make things worse for the screen-reader users
 * they claim to serve, and they load a third-party script on every page, which
 * this site has otherwise refused to do. So the menu here is ordinary CSS
 * switched by data attributes on the root element. It cannot fight assistive
 * technology because it never touches the accessibility tree.
 *
 * WHAT THE LAW ACTUALLY REQUIRES. Regulations 5773-2013 reg. 35 requires the
 * accessibility STATEMENT, which is at `/accessibility` and closes AC-049.
 * IS 5568 governs the site itself. Neither requires a menu — it is convention
 * in Israel rather than obligation, and it is not a substitute for the page
 * being accessible underneath it. Nothing here is offered as compliance.
 *
 * No React and no DOM types beyond the document it writes to, per the
 * constitution's dependency direction.
 */

export interface A11yPrefs {
  /** 0 = 100%, 1 = 112.5%, 2 = 125%, 3 = 150%. */
  fontScale: 0 | 1 | 2 | 3;
  /** Maximum text contrast, at the cost of the warm palette. */
  contrast: boolean;
  /** Underline and outline every link, so they are not colour-only. */
  links: boolean;
  /** A plain, widely-shipped font stack with letter-spacing neutralised. */
  readable: boolean;
  /** True = motion stopped. Named for the state the user asked for. */
  stopMotion: boolean;
  /** An enlarged cursor for low-vision pointer use. */
  bigCursor: boolean;
}

export const DEFAULT_PREFS: A11yPrefs = {
  fontScale: 0,
  contrast: false,
  links: false,
  readable: false,
  stopMotion: false,
  bigCursor: false,
};

const KEY = "meridian.a11y";

/**
 * Fired on `window` whenever preferences change, so the WebGL stage can stop
 * its camera without being handed a prop through four component layers.
 */
export const A11Y_EVENT = "meridian:a11y";

export function loadPrefs(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>;
    // Spread over the defaults rather than trusting the parse: this value
    // survives deploys, so a key added later must not arrive as undefined.
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      fontScale: ([0, 1, 2, 3] as const).includes(parsed.fontScale as 0)
        ? (parsed.fontScale as 0 | 1 | 2 | 3)
        : 0,
    };
  } catch {
    // Private mode, disabled storage, or corrupt JSON. The menu still works;
    // it simply forgets. Never let a storage failure break the page.
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: A11yPrefs): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* see loadPrefs — forgetting is an acceptable degradation */
  }
}

/**
 * Writes the preferences onto `<html>` as data attributes. Every visual
 * consequence lives in globals.css keyed off these, so this function stays the
 * only place that knows the attribute names.
 *
 * Absent rather than "off": `[data-a11y-contrast]` present means on, which
 * keeps the selectors short and the DOM readable in devtools.
 */
export function applyPrefs(prefs: A11yPrefs): void {
  const root = document.documentElement;
  const set = (name: string, on: boolean) =>
    on ? root.setAttribute(name, "") : root.removeAttribute(name);

  if (prefs.fontScale === 0) root.removeAttribute("data-a11y-font");
  else root.setAttribute("data-a11y-font", String(prefs.fontScale));

  set("data-a11y-contrast", prefs.contrast);
  set("data-a11y-links", prefs.links);
  set("data-a11y-readable", prefs.readable);
  set("data-a11y-stop-motion", prefs.stopMotion);
  set("data-a11y-cursor", prefs.bigCursor);

  window.dispatchEvent(new CustomEvent(A11Y_EVENT, { detail: prefs }));
}

/** True when motion should stop — either preference source counts. */
export function motionStopped(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.hasAttribute("data-a11y-stop-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
