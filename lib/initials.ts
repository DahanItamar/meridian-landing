/**
 * First letters of the first two words. Deliberately not clever about particles
 * or multi-part surnames — this labels an avatar, it does not address anyone.
 */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
