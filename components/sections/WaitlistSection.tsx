"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { SubscribeRequest, SubscribeResponse } from "@/lib/subscribe-contract";

/**
 * Umami attaches itself to `window` when its script loads. Declared rather than
 * cast at the call site so the optional chain is checked instead of asserted —
 * the whole point is that it is legitimately absent most of the time.
 */
declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}
import { WaitlistSuccess } from "@/components/sections/WaitlistSuccess";
import type { Content } from "@/content/types";
import {
  validateWaitlist,
  type WaitlistError,
  type WaitlistField,
} from "@/lib/waitlist-validation";

/**
 * The launch list.
 *
 * The form posts to `/api/subscribe`. Nothing reaches Resend until the key
 * exists (T-06), so today every well-formed submission comes back
 * `502 upstream_failed` and the visitor sees the retry path — which is exactly
 * what AC-041 specifies should happen with the variables absent, not a
 * placeholder standing in for real behaviour.
 *
 * SPEC.md §13 records what still has to exist before this may collect a real
 * address: double opt-in (AC-046) and the recorded consent version on the
 * contact (AC-045), both of which are T-07 and T-08.
 */
export function WaitlistSection({ content }: { content: Content }) {
  const w = content.waitlist;
  const nameId = useId();
  const emailId = useId();
  const errorId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<WaitlistError | null>(null);

  /**
   * AC-016. `pending` is what disables the control and swaps the label; it is
   * separate from `joined` because a request can settle into failure, and the
   * form has to come back rather than disappear.
   */
  const [pending, setPending] = useState(false);

  /**
   * The honeypot the route screens (AC-022). It has to be a real field a bot
   * will fill, so it is hidden from people rather than from the DOM — and it
   * carries `aria-hidden` and `tabIndex={-1}` so no screen reader or keyboard
   * user is ever offered it.
   */
  const [honeypot, setHoneypot] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const consentId = useId();
  const honeypotId = useId();

  /** Where focus goes when a rule fails. The rules themselves live in lib/. */
  const fieldRefs: Record<WaitlistField, RefObject<HTMLInputElement | null>> = {
    name: nameRef,
    email: emailRef,
    consent: consentRef,
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;

    const failure = validateWaitlist({ name, email, consented }, w.errors);
    if (failure) {
      setError(failure);
      // AC-018: an inline message and no network request. Moving focus is what
      // makes the message reachable rather than merely present.
      fieldRefs[failure.field].current?.focus();
      return;
    }

    setError(null);
    setPending(true);

    try {
      const body: SubscribeRequest = {
        email: email.trim(),
        consent: true,
        website: honeypot,
        locale: "he",
      };

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as SubscribeResponse;

      if (result.ok) {
        // AC-034. Optional-chained on purpose: the script is only rendered when
        // Umami is configured (AC-033), and a conversion must never fail
        // because analytics did not load. It also fires only on `ok` — an event
        // recorded on a 502 would make the funnel say the opposite of the truth.
        window.umami?.track("subscribe");
        setJoined(true);
        return;
      }

      // AC-019. Nothing is cleared: `name` and `email` are still in state, so
      // the fields keep what was typed and the button comes back enabled.
      setError({
        field: "email",
        message: result.error === "rate_limited" ? w.errors.rate : w.errors.network,
      });
    } catch {
      // A thrown fetch is a dropped connection or a blocked request — the same
      // thing to the visitor as a 502, and the same recovery.
      setError({ field: "email", message: w.errors.network });
    } finally {
      // AC-016: "until the request settles" — both branches, which is why this
      // is `finally` and not a line at the end of the happy path.
      setPending(false);
    }
  }

  return (
    <section
      id="waitlist"
      className="border-line border-t px-4 py-20 text-center sm:px-10 lg:py-[132px]"
      style={{
        background:
          "radial-gradient(60% 70% at 50% 100%, rgba(201,162,95,0.09) 0%, rgba(8,8,10,0) 72%)",
      }}
    >
      <Reveal>
        <h2 className="mx-auto max-w-[24ch] text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.06] font-extrabold tracking-[-0.032em]">
          {w.heading}
        </h2>
        <p className="text-muted mx-auto mt-[22px] max-w-[44ch] text-[17px] leading-[1.72] font-light">
          {w.sub}
        </p>
      </Reveal>

      {joined ? (
        <WaitlistSuccess content={content} name={name.trim()} />
      ) : (
        <form onSubmit={submit} noValidate className="mx-auto mt-10 max-w-[460px] text-start">
          {/* AC-022. Off-screen rather than `display:none` — some bots skip
              undisplayed inputs, and an off-screen one still gets filled.
              aria-hidden and tabIndex keep it away from anybody real. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor={honeypotId}>Website</label>
            <input
              id={honeypotId}
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor={nameId} className="flex flex-col gap-2">
              <span className="text-subtle text-[11px] tracking-[0.2em] uppercase">
                {w.nameLabel}
              </span>
              <input
                id={nameId}
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder={w.namePlaceholder}
                autoComplete="name"
                // The asterisk in the placeholder is a visual convention and
                // nothing more — a screen reader reads the label, not the
                // placeholder, so `required` is what actually says "required".
                required
                aria-invalid={error?.field === "name" || undefined}
                aria-describedby={error?.field === "name" ? errorId : undefined}
                className="field h-13 px-4 text-[15.5px]"
              />
            </label>

            <label htmlFor={emailId} className="flex flex-col gap-2">
              <span className="text-subtle text-[11px] tracking-[0.2em] uppercase">
                {w.emailLabel}
              </span>
              <input
                id={emailId}
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder={w.emailPlaceholder}
                autoComplete="email"
                required
                // An address is LTR even on an RTL page: "name@example.com"
                // reordered by the bidi algorithm is unreadable and, worse,
                // looks like a typo the visitor made.
                dir="ltr"
                aria-invalid={error?.field === "email" || undefined}
                aria-describedby={error?.field === "email" ? errorId : undefined}
                className="field h-13 px-4 text-start text-[15.5px]"
              />
            </label>
          </div>

          {/* Announced, not merely drawn: a message that only appears visually
              leaves a screen-reader user with a form that silently refuses. */}
          <p id={errorId} role="alert" className="text-error mt-3 min-h-[1.2em] text-[13px]">
            {error?.message ?? ""}
          </p>

          {/* AC-044. Unticked by default, its own control, and submission is
              refused until it is ticked — the three things § 30A asks for. */}
          <label
            htmlFor={consentId}
            className="text-faint mt-4 flex cursor-pointer items-start gap-3 text-start text-[12.5px] leading-[1.7] font-light"
          >
            <span className="consent-control">
              <input
                id={consentId}
                ref={consentRef}
                type="checkbox"
                checked={consented}
                onChange={(e) => {
                  setConsented(e.target.checked);
                  setError(null);
                }}
                aria-invalid={error?.field === "consent" || undefined}
                aria-describedby={error?.field === "consent" ? errorId : undefined}
                className="consent-box"
              />
              <svg className="consent-tick" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.5 12.4l3.6 3.6L17.5 8.6"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{w.consent}</span>
          </label>

          {/* AC-026. The purpose of collection and a route to the policy, both
              before the submit rather than after it. The consent above is the
              act; this is the disclosure the act is made against. */}
          <p className="text-faint mt-3 text-start text-[12px] leading-[1.7] font-light">
            {w.noticeBefore}
            <Link href="/privacy" className="text-gold hover:text-gold-hover underline">
              {w.noticeLink}
            </Link>
            {w.noticeAfter}
          </p>

          <button
            type="submit"
            disabled={pending}
            // AC-016. `aria-busy` says the same thing to assistive tech that the
            // changed label says to everyone else; `disabled` alone announces
            // nothing about why the control stopped responding.
            aria-busy={pending || undefined}
            className="btn btn-gold mt-2 h-[54px] w-full text-base"
          >
            <span>{pending ? w.submitPending : w.submit}</span>
            {pending ? null : (
              <span aria-hidden="true" className="text-[15px] leading-none rtl:rotate-180">
                →
              </span>
            )}
          </button>
        </form>
      )}
    </section>
  );
}
