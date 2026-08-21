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
 */
export function JumpLink({
  href,
  className,
  children,
}: {
  /** An in-page fragment, e.g. `#roast`. */
  href: string;
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
