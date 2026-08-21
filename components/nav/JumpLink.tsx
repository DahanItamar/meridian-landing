"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * An in-page link that scrolls without leaving `#roast` in the address bar.
 *
 * It stays a real `<a href="#id">`, deliberately. That is what gives it the
 * link role, the status-bar preview, middle-click and open-in-new-tab, and a
 * working destination if the JavaScript never arrives — none of which a
 * `<button onClick={scrollTo}>` has. The handler only intercepts the plain
 * left-click and lets every modified click through untouched.
 *
 * Two things happen that a bare anchor would not do:
 *
 * 1. The URL is left alone. A hash is browser history, and three of them from
 *    one page means three back-presses to leave a site the visitor scrolled.
 * 2. Focus moves to the target. Scrolling the viewport without moving focus
 *    leaves a keyboard user's tab order where it was, so the next Tab jumps
 *    back to the top of the page — the classic skip-link bug. The target takes
 *    focus with `preventScroll`, because the smooth scroll is already running
 *    and a second jump would fight it.
 *
 * `focus` narrows that second behaviour to one element inside the target. The
 * waitlist CTA uses it because AC-010 asks for the email input specifically,
 * not the section: a visitor who pressed "save me a place" has already decided,
 * and landing them on the section still costs them a Tab to reach the field
 * they came for.
 */
export function JumpLink({
  href,
  focus,
  className,
  children,
}: {
  /** An in-page fragment, e.g. `#roast`. */
  href: string;
  /**
   * Optional CSS selector, resolved *inside* the target, for the element that
   * should take focus instead of the target itself. Falls back to the target
   * when it matches nothing, so a renamed input degrades to the old behaviour
   * rather than to no focus move at all.
   */
  focus?: string;
  className?: string;
  children: ReactNode;
}) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    // Let the browser handle new-tab, new-window, download and non-primary
    // clicks exactly as it would for any other link.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    const target = document.querySelector<HTMLElement>(href);
    if (!target) return; // no destination — fall through to the default jump

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    const inner = focus ? target.querySelector<HTMLElement>(focus) : null;
    if (inner) {
      inner.focus({ preventScroll: true });
      return;
    }

    // A section is not focusable by default; -1 makes it programmatically
    // focusable without adding it to the tab order.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
