#!/usr/bin/env node
/**
 * AC-007: every directional value must be a CSS logical property.
 *
 * `next lint` cannot see this — Tailwind class names are opaque strings to
 * ESLint, so `ml-4` is indistinguishable from any other text. Without a check
 * the criterion degrades to "verified by reading", and a physical property only
 * fails once the page is flipped to Hebrew, which means a client finds it first.
 *
 * Deliberately not part of `npm run verify`: AC-036 fixes that command to
 * exactly `next lint && next build`. Run it directly, or in M3's RTL sweep.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib"];
const EXT = new Set([".tsx", ".ts", ".css"]);

/** Physical utility or property -> the logical form to use instead. */
const BANNED = [
  [/(?:^|[\s"'`{])(?:sm:|md:|lg:|xl:|2xl:)?[mp][lr]-\d/, "ms-/me-/ps-/pe-"],
  [/(?:^|[\s"'`{])(?:sm:|md:|lg:|xl:|2xl:)?(?:left|right)-\d/, "start-/end-"],
  [/(?:^|[\s"'`{])text-(?:left|right)(?![-\w])/, "text-start / text-end"],
  [/(?:^|[\s"'`{])border-[lr]-/, "border-s- / border-e-"],
  [/(?:^|[\s"'`{])rounded-(?:[lr]|tl|tr|bl|br)-/, "rounded-s- / rounded-e-"],
  [/(?:^|[\s"'`{])float-(?:left|right)(?![-\w])/, "float-start / float-end"],
  [/\bmargin-(?:left|right)\s*:/, "margin-inline-start / -end"],
  [/\bpadding-(?:left|right)\s*:/, "padding-inline-start / -end"],
  [/\bborder-(?:left|right)(?:-\w+)?\s*:/, "border-inline-start / -end"],
  [/(?<![-\w])(?:left|right)\s*:/, "inset-inline-start / -end"],
  [/\btext-align\s*:\s*(?:left|right)/, "text-align: start / end"],
];

/** Comments describe the rule; they are not violations of it. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (EXT.has(extname(full))) yield full;
  }
}

const findings = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const lines = stripComments(readFileSync(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (line.includes("check-logical-ignore")) return;
      // First match wins: `margin-left:` is one mistake, not two.
      for (const [re, fix] of BANNED) {
        if (re.test(line)) {
          findings.push({ file, line: i + 1, text: line.trim(), fix });
          return;
        }
      }
    });
  }
}

if (findings.length === 0) {
  console.log("AC-007 ok — no physical directional values in app/, components/ or lib/");
  process.exit(0);
}

for (const f of findings) {
  console.error(`${f.file}:${f.line}  use ${f.fix}\n    ${f.text}`);
}
console.error(`\n${findings.length} physical directional value(s) — AC-007 fails.`);
process.exit(1);
