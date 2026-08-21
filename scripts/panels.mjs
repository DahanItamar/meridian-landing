#!/usr/bin/env node
/**
 * Renders the flat pack artwork: art/panel-{front,back}.html -> public/art/*.png.
 *
 * These are the two textures three/project.js prints onto the pouch geometry.
 * They are authored as HTML rather than drawn in an image editor because their
 * layout is registered to relief measured off the model — see art/README.md —
 * and a set of numbers in a stylesheet can be re-measured and re-rendered,
 * where a flattened PNG cannot.
 *
 * Both sources seed their own randomness, so re-running this is idempotent:
 * the same input renders the same bytes, and a diff means somebody changed the
 * artwork.
 *
 * Headless Chrome rather than a Node canvas library on purpose — the panels use
 * web fonts, flexbox and inline SVG, and the browser is the only renderer that
 * agrees with the browser.
 *
 *   node scripts/panels.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Panel pixel sizes are the measured face aspects, not round numbers.
    front 0.5000 w/h, back 0.5027 — see lib/pack-projection.ts ART. */
const PANELS = [
  { src: "art/panel-front.html", out: "public/art/panel-front.png", width: 680, height: 1360 },
  { src: "art/panel-back.html", out: "public/art/panel-back.png", width: 684, height: 1360 },
];

const CANDIDATES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("No Chrome found. Set CHROME=/path/to/chrome and re-run.");
  process.exit(1);
}

for (const { src, out, width, height } of PANELS) {
  const target = resolve(out);
  mkdirSync(dirname(target), { recursive: true });

  execFileSync(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      // The panels pull Playfair Display and Inter from Google Fonts. Without
      // the budget the shot can land before the faces do, and the wordmark
      // renders in a fallback serif that is not the one the pack uses.
      "--virtual-time-budget=20000",
      `--window-size=${width},${height}`,
      `--screenshot=${target}`,
      pathToFileURL(resolve(src)).href,
    ],
    { stdio: ["ignore", "ignore", "inherit"] }
  );

  console.log(`${src} -> ${out}  ${width}x${height}`);
}
