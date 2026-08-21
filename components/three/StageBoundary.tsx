"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps a failed 3D stage from taking the page down with it.
 *
 * `<Suspense>` around `Pack` handles the model still *arriving*. It does not
 * handle the model failing to arrive: Suspense catches suspension, not errors,
 * so a thrown `useGLTF` propagated past it and unmounted everything up to the
 * nearest boundary — and there was none. A blocked GLB left the whole pinned
 * section empty: no canvas, no poster, and none of the four beats of copy,
 * which is every word in the first three screens of the site.
 *
 * That is the wrong failure. The words are the content and the pack is the
 * illustration, so the illustration failing must cost the illustration only.
 * With this in place a dead model leaves the poster frame on screen and every
 * beat readable, which is a page that still works rather than a blank one.
 *
 * A class component because error boundaries have no hook equivalent — this is
 * the one thing React still requires a class for.
 */
export class StageBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // A fixed string, deliberately. The caught error's message carries the URL
    // it tried to fetch and, on some loaders, a slice of the response — neither
    // belongs in a log, and the same reasoning governs the subscribe route.
    console.error("pack stage: failed to load");
    this.props.onFail();
  }

  render() {
    // null, not a fallback of its own: the poster underneath is already the
    // right thing to show, and the parent switches it back to opaque on fail.
    return this.state.failed ? null : this.props.children;
  }
}
