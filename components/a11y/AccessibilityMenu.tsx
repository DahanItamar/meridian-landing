"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { A11yToggle } from "@/components/a11y/A11yToggle";
import type { Content } from "@/content/types";
import { DEFAULT_PREFS, applyPrefs, loadPrefs, savePrefs, type A11yPrefs } from "@/lib/a11y-prefs";

const STEPS = [0, 1, 2, 3] as const;
const PERCENT = ["100%", "112%", "125%", "150%"];

/**
 * The accessibility menu — the floating button and the panel it opens.
 *
 * See `lib/a11y-prefs.ts` for why this is built rather than installed, and for
 * what Israeli law does and does not require. In short: reg. 35 requires the
 * statement at `/accessibility`, not this; and this is not offered as
 * compliance with anything.
 *
 * The panel is a `dialog`-role region rather than a `<dialog>` element: it is
 * non-modal on purpose. Someone raising the text size wants to watch the page
 * reflow behind it, and a modal that hides the thing being adjusted makes the
 * adjustment guesswork.
 */
export function AccessibilityMenu({ content }: { content: Content }) {
  const t = content.a11y;
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Read and apply on mount, not during render: the server has no storage, and
  // reading it during render would hydrate a mismatch.
  useEffect(() => {
    const stored = loadPrefs();
    setPrefs(stored);
    applyPrefs(stored);
  }, []);

  const update = useCallback((next: A11yPrefs) => {
    setPrefs(next);
    applyPrefs(next);
    savePrefs(next);
  }, []);

  // Escape closes and returns focus to the button that opened it — otherwise
  // the tab order restarts at the top of the document.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const setScale = (delta: number) => {
    const i = STEPS.indexOf(prefs.fontScale);
    const next = STEPS[Math.min(STEPS.length - 1, Math.max(0, i + delta))];
    update({ ...prefs, fontScale: next });
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        // The icon is decorative; this is the accessible name. A menu whose own
        // button is announced as "button" is the first thing to fail.
        aria-label={t.open}
        className="a11y-fab"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path
            d="M4 8.5h16M12 8.5v5.5m0 0l-3.2 7m3.2-7l3.2 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      <div
        ref={panel}
        id={panelId}
        role="dialog"
        aria-label={t.title}
        // `hidden` rather than a class: it removes the panel from the
        // accessibility tree and the tab order in one attribute, which is the
        // behaviour a closed menu needs and the one CSS alone cannot give.
        hidden={!open}
        className="a11y-panel"
      >
        <div className="a11y-head">
          <h2>{t.title}</h2>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              button.current?.focus();
            }}
            aria-label={t.close}
            className="a11y-close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="a11y-row">
          <span id={`${panelId}-size`}>{t.textSize}</span>
          <span className="a11y-stepper">
            <button
              type="button"
              onClick={() => setScale(-1)}
              disabled={prefs.fontScale === 0}
              aria-label={t.smaller}
            >
              −
            </button>
            {/* aria-live so the new size is announced; the visible percentage is
                the same information, not a decoration beside it. */}
            <output aria-live="polite" aria-labelledby={`${panelId}-size`}>
              {PERCENT[prefs.fontScale]}
            </output>
            <button
              type="button"
              onClick={() => setScale(1)}
              disabled={prefs.fontScale === 3}
              aria-label={t.larger}
            >
              +
            </button>
          </span>
        </div>

        <A11yToggle
          id={`${panelId}-contrast`}
          label={t.contrast}
          checked={prefs.contrast}
          onChange={(v) => update({ ...prefs, contrast: v })}
        />
        <A11yToggle
          id={`${panelId}-links`}
          label={t.links}
          checked={prefs.links}
          onChange={(v) => update({ ...prefs, links: v })}
        />
        <A11yToggle
          id={`${panelId}-readable`}
          label={t.readable}
          checked={prefs.readable}
          onChange={(v) => update({ ...prefs, readable: v })}
        />
        <A11yToggle
          id={`${panelId}-motion`}
          label={t.stopMotion}
          checked={prefs.stopMotion}
          onChange={(v) => update({ ...prefs, stopMotion: v })}
        />
        <A11yToggle
          id={`${panelId}-cursor`}
          label={t.bigCursor}
          checked={prefs.bigCursor}
          onChange={(v) => update({ ...prefs, bigCursor: v })}
        />

        <button type="button" onClick={() => update(DEFAULT_PREFS)} className="a11y-reset">
          {t.reset}
        </button>

        <Link href="/accessibility" className="a11y-link">
          {t.statement}
        </Link>

        <p className="a11y-note">{t.note}</p>
      </div>
    </>
  );
}
