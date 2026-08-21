#!/usr/bin/env node
/**
 * Captures the pinned section's poster frames into public/art/.
 *
 *   npm run dev            # or next start — anything serving the real page
 *   node scripts/poster.mjs [url]
 *
 * WHY A CAPTURE AND NOT A SECOND SCENE. The poster has to be the same object,
 * lit the same way, at the same keyframe. Rebuilding the studio in a standalone
 * page would be a copy of `PackStage` that drifts the first time a light moves
 * — and it would drift silently, because nothing compares the two. So this
 * drives the real page and reads its canvas back.
 *
 * Two frames come out, one per breakpoint — see POSTERS below.
 *
 * The output is transparent — the section paints its own radial ground behind
 * both the poster and the canvas, so baking a background in would show as a
 * visible square.
 *
 * Each frame is written three times: AVIF, WebP and the PNG that Chrome handed
 * back. The PNG is the fallback and the source of the other two, so it stays.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const URL_ = process.argv[2] ?? "http://localhost:3000/he";
const PORT = 9444;

/**
 * Two posters, because the choreography frames the pack differently at each.
 * Below the lg breakpoint `sample()` takes its narrow branch — the camera backs
 * off and lifts, dropping the pack into the lower frame so the copy can own the
 * top. One poster would be visibly wrong at one of the two, and the crossfade
 * would show it as a jump.
 */
const POSTERS = [
  { out: "public/art/pack-poster-wide.png", w: 1440, h: 900 },
  { out: "public/art/pack-poster-narrow.png", w: 430, h: 932 },
];

const CANDIDATES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chromePath = CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error("No Chrome found. Set CHROME=/path/to/chrome and re-run.");
  process.exit(1);
}

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    // Software WebGL. The poster is geometry and flat panels, not transmission
    // or fine specular, so SwiftShader is faithful enough for this frame.
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
    "--no-first-run",
    `--window-size=${POSTERS[0].w},${POSTERS[0].h}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function debuggerUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error("Chrome did not expose a devtools target");
}

const ws = new WebSocket(await debuggerUrl());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const n = ++id;
    pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result
    ?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: URL_ });

mkdirSync(dirname(resolve(POSTERS[0].out)), { recursive: true });

for (const { out, w, h } of POSTERS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Wait for the canvas to exist, then for the model and both textures to land.
  // A fixed sleep would either be too short on a cold cache or waste time on a
  // warm one, and the failure mode of "too short" is a poster of an empty stage.
  let ready = false;
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    ready = await evaluate("!!document.querySelector('canvas')");
    if (ready) break;
  }
  if (!ready) {
    console.error(`No canvas at ${URL_} — is a server running?`);
    chrome.kill();
    process.exit(1);
  }

  await evaluate("window.scrollTo(0, 0)");
  // The camera damps toward its target rather than snapping, and the resize
  // just changed which branch of `sample()` applies, so the first frame after
  // either is not yet the keyframe-0 pose.
  await sleep(4500);

  const dataUrl = await evaluate("document.querySelector('canvas').toDataURL('image/png')");

  if (!dataUrl || !dataUrl.startsWith("data:image/png")) {
    console.error(
      "Canvas returned no image — check that preserveDrawingBuffer is set on the GL context."
    );
    chrome.kill();
    process.exit(1);
  }

  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  writeFileSync(resolve(out), buf);

  // The poster is the LCP element on both breakpoints — it is what a visitor
  // looks at for the whole first second, while the GLB is still arriving. As a
  // PNG it was the largest thing on the wire by an order of magnitude and the
  // only transfer Lighthouse could fault that was not an artefact of software
  // rendering.
  //
  // Quality is high on purpose: this frame stands in for the WebGL render and
  // then cross-fades to it, so banding in the pack's shading would read as a
  // rendering fault rather than as compression. Alpha is preserved — the
  // section paints its own ground behind it.
  const avif = out.replace(/\.png$/, ".avif");
  const webp = out.replace(/\.png$/, ".webp");
  await sharp(buf).avif({ quality: 62, effort: 6 }).toFile(resolve(avif));
  await sharp(buf).webp({ quality: 82, effort: 6 }).toFile(resolve(webp));

  const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
  const size = (f) => kb(statSync(resolve(f)).size);
  console.log(
    `  -> ${out.replace(/\.png$/, ".{avif,webp,png}")}  ${w}×${h}  ` +
      `avif ${size(avif)} · webp ${size(webp)} · png ${kb(buf.length)}`
  );
}

ws.close();
chrome.kill();
process.exit(0);
