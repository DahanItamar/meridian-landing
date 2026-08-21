# Captures

Desktop 1440×900 and mobile 390×844, captured from the running production build
at the scroll positions that define the page (AC-043).

Regenerate them the same way they were made — drive the real page over the
DevTools protocol rather than screenshotting by hand, so the set stays
consistent and the pinned sequence lands on the same beats each time:

```
npm run build && npx next start -p 3000
# then capture at 0 / 0.50 / 0.85 of the pinned section, plus each section below
```

Two things to know if a capture looks wrong:

- **Headless WebGL is SwiftShader.** The pack renders approximately — geometry
  and flat panel artwork are faithful, transmission and fine specular are not.
  Judge those on a real GPU.
- **The beans loader may appear** in a capture taken on a cold cache. It is
  correct behaviour, not a broken frame: it shows while the 2.1 MB model loads
  and leaves when the canvas is ready.
