import type { Content } from "@/content/types";

/**
 * What replaces the form once someone has joined the list (AC-017).
 *
 * Extracted from `WaitlistSection` by refactoring 0001/R-02. It shares nothing
 * with the form but the name, and it is the half M2 never touches — separating
 * it means the M2 diff, which adds a network call and four new states to the
 * form, is entirely about the form.
 *
 * `role="status"` rather than `role="alert"`: this is a polite announcement of
 * something that went right, and an assertive live region interrupts whatever a
 * screen reader was in the middle of saying.
 *
 * The mark is drawn, not played — two stroke-dash animations defined in
 * globals.css. Under reduced motion the global rule collapses their durations
 * and the mark lands complete, because both are `forwards`.
 */
export function WaitlistSuccess({
  content,
  name,
}: {
  content: Content;
  /** Already trimmed. Empty means the greeting is left off entirely. */
  name: string;
}) {
  const { success } = content.waitlist;

  return (
    <div
      role="status"
      className="border-gold/45 rounded-card mx-auto mt-10 max-w-[460px] border bg-[rgba(201,162,95,0.07)] px-7 py-[34px]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 52 52"
        className="text-gold mx-auto block h-[52px] w-[52px]"
        fill="none"
      >
        <circle
          className="mark-ring"
          cx="26"
          cy="26"
          r="24"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          className="mark-tick"
          d="M15 26.5l7.5 7.5L37.5 19"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <p className="font-display mt-5 text-xl font-bold">
        {success.heading}
        {name ? `, ${name}` : ""}.
      </p>
      <p className="text-muted mt-2.5 text-[14.5px] leading-[1.75] font-light">{success.body}</p>
    </div>
  );
}
