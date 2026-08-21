import {
  BufferGeometry,
  Float32BufferAttribute,
  Matrix3,
  Vector3,
  type BufferAttribute,
  type Mesh,
  type Object3D,
} from "three";

/**
 * Panel projection: the pack's geometry comes from one place and its printing
 * from another, and this is the seam between them.
 *
 * The supplied model is a Tripo export. Its mesh is a genuinely good crumpled
 * box-bottom pouch and its baked texture is a hallucination — "MERII SPECIA",
 * "JASNINE BLUERE", invented body copy scattered across a fragmented atlas. So
 * this keeps the geometry and throws the texture away: the flat panels in
 * public/art are projected onto it instead, which is the artwork that was
 * actually approved. See art/README.md.
 *
 * Mapping rules, all measured off the mesh rather than assumed:
 *
 *   - The flat panel's extent comes from triangles with |normal.z| >= FLATNESS,
 *     so the artwork registers to the panel, not to the whole silhouette.
 *   - Material assignment is looser (dominant normal axis), so the print WRAPS
 *     the shoulder as real packaging does; the wrap samples the artwork's
 *     clamped edge, which is its own foil-coloured border.
 *   - Each panel is fitted BY HEIGHT and centred, so neither is ever stretched.
 */

export const FRONT = 0;
export const BACK = 1;
export const FOIL = 2;

/**
 * The artwork, flattened onto the pack's foil colour (#0d0c0b) so there is no
 * transparency for an opaque material to render as grey.
 *
 * `aspect` is the file's own width/height and must stay in step with the pixel
 * size scripts/panels.mjs renders — the fit divides by it, so a mismatch here
 * squeezes the type sideways. The values are the faces' measured extents:
 * front 0.5000 w/h, back 0.5027.
 */
export const ART = [
  { src: "/art/panel-front.png", aspect: 680 / 1360 },
  { src: "/art/panel-back.png", aspect: 684 / 1360 },
] as const;

/** How flat a triangle must be to count toward the panel's own extent. */
const FLATNESS = 0.9;

/** Print if it faces the camera at all; gussets, seal and base are foil. */
function classify(nx: number, ny: number, nz: number): number {
  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const az = Math.abs(nz);
  if (az >= ax && az >= ay) return nz > 0 ? FRONT : BACK;
  return FOIL;
}

/**
 * Flattens every mesh under `root` into world-space triangle corner arrays.
 * De-indexed, transforms baked in — `projectPanels` needs plain triangles and
 * knows nothing about scene graphs.
 */
export function collectTriangles(root: Object3D): { pos: number[]; nrm: number[] } {
  const pos: number[] = [];
  const nrm: number[] = [];
  const p = new Vector3();
  const n = new Vector3();
  const normalMatrix = new Matrix3();

  root.updateWorldMatrix(true, true);
  root.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    let geo = mesh.geometry;
    if (geo.index) geo = geo.toNonIndexed();
    if (!geo.attributes.normal) geo.computeVertexNormals();

    const P = geo.attributes.position as BufferAttribute;
    const N = geo.attributes.normal as BufferAttribute;
    normalMatrix.getNormalMatrix(mesh.matrixWorld);

    for (let i = 0; i < P.count; i++) {
      p.fromBufferAttribute(P, i).applyMatrix4(mesh.matrixWorld);
      n.fromBufferAttribute(N, i).applyMatrix3(normalMatrix).normalize();
      pos.push(p.x, p.y, p.z);
      nrm.push(n.x, n.y, n.z);
    }
  });

  return { pos, nrm };
}

/**
 * Builds the grouped, UV'd geometry.
 *
 * `pos` and `nrm` are flat arrays of world-space triangle corners (9 numbers per
 * triangle). The result is normalised to body height 1, centred on the origin,
 * base at y = -0.5 — the units lib/scrolly-config.ts expresses its camera
 * distances in, so any mesh at any real-world scale drops straight in.
 *
 * Three groups come out, in FRONT / BACK / FOIL order, matching the material
 * array from `panelMaterialSpecs`.
 */
export function projectPanels(pos: number[], nrm: number[]): BufferGeometry {
  const count = pos.length / 3;
  const mn = [Infinity, Infinity, Infinity];
  const mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < count; i++) {
    for (let a = 0; a < 3; a++) {
      const val = pos[i * 3 + a];
      if (val < mn[a]) mn[a] = val;
      if (val > mx[a]) mx[a] = val;
    }
  }

  const s = 1 / (mx[1] - mn[1] || 1);
  const cx = (mn[0] + mx[0]) / 2;
  const cz = (mn[2] + mx[2]) / 2;

  const atX = (i: number) => (pos[i * 3] - cx) * s;
  const atY = (i: number) => (pos[i * 3 + 1] - mn[1]) * s - 0.5;
  const atZ = (i: number) => (pos[i * 3 + 2] - cz) * s;

  const tris = count / 3;

  /** Average of a triangle's three corner normals. */
  const avgNormal = (t: number): [number, number, number] => {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let k = 0; k < 3; k++) {
      const i = (t * 3 + k) * 3;
      x += nrm[i] / 3;
      y += nrm[i + 1] / 3;
      z += nrm[i + 2] / 3;
    }
    return [x, y, z];
  };

  // ── Pass 1: the flat panel's own extent, per printed face ─────────────────
  const box = [FRONT, BACK].map(() => ({
    x0: Infinity,
    x1: -Infinity,
    y0: Infinity,
    y1: -Infinity,
  }));

  for (let t = 0; t < tris; t++) {
    const [, , nz] = avgNormal(t);
    if (Math.abs(nz) < FLATNESS) continue;
    const g = nz > 0 ? FRONT : BACK;
    for (let k = 0; k < 3; k++) {
      const i = t * 3 + k;
      const x = atX(i);
      const y = atY(i);
      const b = box[g];
      if (x < b.x0) b.x0 = x;
      if (x > b.x1) b.x1 = x;
      if (y < b.y0) b.y0 = y;
      if (y > b.y1) b.y1 = y;
    }
  }

  // A mesh with no flat region at all (heavily crumpled) still has to print, so
  // fall back to its silhouette rather than emitting NaN UVs.
  for (const g of [FRONT, BACK]) {
    if (box[g].x1 > box[g].x0) continue;
    box[g] = { x0: (mn[0] - cx) * s, x1: (mx[0] - cx) * s, y0: -0.5, y1: 0.5 };
  }

  // ── Pass 2: emit ──────────────────────────────────────────────────────────
  const P: number[][] = [[], [], []];
  const N: number[][] = [[], [], []];
  const UV: number[][] = [[], [], []];

  for (let t = 0; t < tris; t++) {
    const [nx, ny, nz] = avgNormal(t);
    const g = classify(nx, ny, nz);

    for (let k = 0; k < 3; k++) {
      const i = t * 3 + k;
      const px = atX(i);
      const py = atY(i);

      P[g].push(px, py, atZ(i));
      N[g].push(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]);

      if (g === FOIL) {
        UV[g].push(0, 0); // the foil material carries no map
        continue;
      }

      const b = box[g];
      const h = b.y1 - b.y0;
      const faceCx = (b.x0 + b.x1) / 2;
      // Fit by height, centre by width. The back mirrors in U so its print
      // reads correctly once the pack has turned round.
      const u = (px - faceCx) / (h * ART[g].aspect) + 0.5;
      UV[g].push(g === BACK ? 1 - u : u, (b.y1 - py) / h);
    }
  }

  // Concatenated by copy, never by spread. `push(...arr)` passes every element
  // as an argument, and these arrays run to hundreds of thousands of entries —
  // it throws RangeError somewhere above a hundred thousand, which on a mesh
  // this size is not an edge case but the normal path.
  const total = P[0].length + P[1].length + P[2].length;
  const position = new Float32Array(total);
  const normal = new Float32Array(total);
  const uv = new Float32Array((total / 3) * 2);
  const geo = new BufferGeometry();

  let at3 = 0;
  let at2 = 0;
  for (let g = 0; g < 3; g++) {
    geo.addGroup(at3 / 3, P[g].length / 3, g);
    position.set(P[g], at3);
    normal.set(N[g], at3);
    uv.set(UV[g], at2);
    at3 += P[g].length;
    at2 += UV[g].length;
  }

  geo.setAttribute("position", new Float32BufferAttribute(position, 3));
  geo.setAttribute("normal", new Float32BufferAttribute(normal, 3));
  geo.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  return geo;
}
