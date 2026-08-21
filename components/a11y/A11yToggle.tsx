"use client";

/**
 * One switch in the accessibility menu.
 *
 * A real `<input type="checkbox">` with a real `<label>`, not a `<div
 * role="switch">`. A menu whose own controls are simulated is the joke that
 * writes itself, and the native control already carries the role, the state,
 * the keyboard behaviour and the forced-colors rendering for free.
 */
export function A11yToggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="a11y-row">
      <span>{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="a11y-switch"
      />
    </label>
  );
}
