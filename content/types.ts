/**
 * The content contract.
 *
 * One module satisfies it — `he.ts` — and the interface still exists because it
 * is what makes a missing string a build failure rather than an `undefined`
 * rendered to a visitor. The `Locale` union and the locale lookup that used to
 * sit beside it are gone: there is one language, and a type with one member
 * describes a decision nobody is making.
 */

/** A label/value pair. The beats and the beans cards are both built from these. */
export interface Row {
  label: string;
  value: string;
}

/**
 * A beat in the pinned sequence. Exactly one per entry in SCROLLY_STEPS — the
 * step owns the scroll slice and the pack's rotation, the beat owns the words,
 * and the two are zipped by index so copy and geometry cannot drift apart.
 *
 * `rows`, `ctas` and `buy` are the three shapes a beat's body can take, and a
 * beat carries at most one of them.
 */
export interface Beat {
  kicker: string;
  title: string;
  body?: string;
  rows?: Row[];
  ctas?: { primary: string };
  buy?: { label: string; note: string };
}

/**
 * A legal page — privacy, accessibility.
 *
 * The notice at the top states what is actually true of this site: the brand is
 * fictional, nothing is collected, and the form transmits nothing. That is the
 * accurate legal posture rather than a hedge, and it is why these pages are not
 * marked as unfinished drafts — the values that are still blank matter only
 * once real addresses are collected, and they are tracked in docs/legal/ and
 * HANDOFF.md where the next person will look, not on a page a visitor reads.
 */
export interface LegalDoc {
  title: string;
  updated: string;
  /** Optional. The accessibility statement opens on its first heading instead. */
  intro?: string;
  sections: { heading: string; body: string[]; rows?: Row[] }[];
}

export interface Countdown {
  /** The whole of the section's copy. There is deliberately nothing else. */
  heading: string;
  units: { days: string; hours: string; minutes: string; seconds: string };
  /** Read by assistive tech in place of the per-second digits. */
  a11y: string;
}

export interface Content {
  meta: { title: string; description: string };

  brand: { name: string; tagline: string };

  /** One entry. The launch section and the form are one destination. */
  nav: { roast: string };

  /**
   * The accessibility menu. Every string is visible to a screen reader — the
   * toggles are real checkboxes with real labels, not icons with title
   * attributes, so these are the accessible names too.
   */
  a11y: {
    open: string;
    title: string;
    close: string;
    textSize: string;
    smaller: string;
    larger: string;
    contrast: string;
    links: string;
    readable: string;
    stopMotion: string;
    bigCursor: string;
    reset: string;
    statement: string;
    note: string;
  };

  /** Exactly 3 beats, matching SCROLLY_STEPS. */
  scrolly: {
    beats: Beat[];
    /** Alt text for the pinned stage, and the word under the scroll hint. */
    stageLabel: string;
    hint: string;
  };

  countdown: Countdown;

  legal: {
    /** AC-035, restated where a legal page can be read on its own. */
    demoNotice: string;
    backToSite: string;
    privacy: LegalDoc;
    accessibility: LegalDoc;
  };

  waitlist: {
    heading: string;
    sub: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    /** Replaces the submit label while the request is in flight (AC-016). */
    submitPending: string;
    /**
     * The consent checkbox's own label. This is the act, not a notice beside
     * one: Communications Law § 30A wants a separable, unticked affirmative
     * step, so the sentence the visitor agrees to has to be the thing they
     * tick (AC-044).
     */
    consent: string;
    /**
     * Identifies the wording a visitor agreed to. Not sent anywhere — AC-045
     * was retired with the pipeline by 0003, and this is kept because the
     * version of a consent string is a property of the string.
     */
    consentVersion: string;
    /**
     * AC-026 and AC-070. Sits above the submit control, not below it: a visitor
     * has to know the form is inert *before* they act on it, which is the whole
     * reason AC-070 specifies the position rather than only the wording.
     *
     * Split into three so the link text stays a string — a content module has
     * no business holding markup.
     */
    noticeBefore: string;
    noticeLink: string;
    noticeAfter: string;
    errors: {
      name: string;
      email: string;
      consent: string;
      /** The request failed or timed out. The address is kept (AC-019). */
      network: string;
      /** Too many attempts from one address — the route answered 429 (AC-023). */
      rate: string;
    };
    success: { heading: string; body: string };
  };

  footer: {
    /**
     * Each link carries its own destination. Every one of these used to be a
     * hardcoded `#top` in the component, which is how the footer ended up
     * naming three sections that no longer exist (AC-067).
     */
    links: { label: string; href: string }[];
    copyright: string;
    /** AC-035: the brand, the lot and the figures are invented. */
    disclosure: string;
  };
}
