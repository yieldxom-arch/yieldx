// The Nizwa valley: one shared description of the ground and where things are.
// Everything that sits on the ground uses heightAt(), so it all lines up.

import * as THREE from 'three';

// ─── Deterministic random + noise ──────────────────────────────────────────────

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * f, y * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return sum; // ~0..1
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ─── Size of the model ─────────────────────────────────────────────────────────

export const WORLD = { w: 40, d: 28 }; // x from -20..20, z from -14..14
export const BASE_BOTTOM = -3.2;

// ─── Landmarks ─────────────────────────────────────────────────────────────────

export const SPOTS = {
  spring: new THREE.Vector2(-14, -5.4),
  fort: new THREE.Vector2(-4, -2.6),
  shop: new THREE.Vector2(-2.4, 3.7),
  souq: new THREE.Vector2(1.2, -0.6),
  workshop: new THREE.Vector2(5.6, -3.6),
  gardens: new THREE.Vector2(11.5, -0.6),
  village: new THREE.Vector2(-7.4, 0.9),
  road: new THREE.Vector2(9.5, 5.7),
  tower: new THREE.Vector2(5.2, -8.2),
};

/** Spot of each level 0..7, in order: each level owns the area nearest to it. */
export const ZONE_SPOTS: THREE.Vector2[] = [
  SPOTS.spring,
  SPOTS.shop,
  SPOTS.fort,
  SPOTS.road,
  SPOTS.workshop,
  SPOTS.village,
  SPOTS.gardens,
  SPOTS.souq,
];

/** Which level's area a point belongs to (-1 = mountains, no area). */
export function zoneOf(x: number, z: number, h: number) {
  if (z < -7.4 || h > 3.4) return -1;
  let best = -1;
  let bd = Infinity;
  ZONE_SPOTS.forEach((p, i) => {
    const d = Math.hypot(x - p.x, (z - p.y) * 1.15);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

export const FALAJ_POINTS: [number, number][] = [
  [-14, -5.4],
  [-11.8, -3.9],
  [-9.4, -1.9],
  [-6.9, 0.4],
  [-4.4, 1.7],
  [-1.6, 2.0],
  [1.0, 1.7],
  [3.6, 1.5],
  [6.4, 0.8],
  [9.4, 0.1],
  [12.4, -0.9],
  [15.6, -2.3],
  [18.4, -3.0],
];

export const ROAD_POINTS: [number, number][] = [
  [20.5, 6.4],
  [16.5, 6.6],
  [12.5, 6.0],
  [8.6, 5.5],
  [5.0, 4.8],
  [2.0, 4.2],
  [-0.6, 4.0],
];

export const TRACK_POINTS: [number, number][] = [
  [2.0, 4.2],
  [2.8, 2.6],
  [3.6, 0.2],
  [4.6, -2.2],
  [5.4, -3.2],
];

/** Gardens: ellipses (cx, cz, rx, rz). */
export const GARDENS: [number, number, number, number][] = [
  [11.6, -0.8, 6.4, 3.4],
  [4.8, 0.9, 2.6, 1.1],
  [-11.4, -1.0, 2.8, 1.3],
  [16.5, -3.4, 2.6, 1.6],
  [7.6, 3.0, 2.3, 1.0],
  [-15.6, -3.9, 1.7, 1.0],
  [2.4, -3.6, 1.6, 1.0],
];

export function inGarden(x: number, z: number, grow = 1) {
  return GARDENS.some(([cx, cz, rx, rz]) => ((x - cx) / (rx * grow)) ** 2 + ((z - cz) / (rz * grow)) ** 2 < 1);
}

// ─── Curves ────────────────────────────────────────────────────────────────────

function distToPolyline(x: number, z: number, pts: [number, number][]) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const px = ax + dx * t - x;
    const pz = az + dz * t - z;
    best = Math.min(best, Math.hypot(px, pz));
  }
  return best;
}

export const distToFalaj = (x: number, z: number) => distToPolyline(x, z, FALAJ_POINTS);
export const distToRoad = (x: number, z: number) => Math.min(distToPolyline(x, z, ROAD_POINTS), distToPolyline(x, z, TRACK_POINTS));

const wadiZ = (x: number) => 9.2 + Math.sin(x * 0.23 + 0.6) * 1.4;

// ─── Height and colour of the ground ───────────────────────────────────────────

export function heightAt(x: number, z: number): number {
  let h = (fbm(x * 0.09 + 3, z * 0.09 + 7) - 0.5) * 0.7;

  // Hajar mountains at the back, with ridges
  const m = smooth(-4.5, -13.5, z);
  const ridge = 1 - Math.abs(fbm(x * 0.12, z * 0.12 + 11, 5) * 2 - 1);
  h += m ** 1.4 * (4.6 + ridge * 4.2 + fbm(x * 0.35, z * 0.35) * 1.4);
  // slopes on the left where the terraced village climbs
  h += smooth(-7, -19, x) * smooth(4, -6, z) * (1.6 + fbm(x * 0.2, z * 0.2) * 1.2);

  // the fort hill
  const fx = x - SPOTS.fort.x;
  const fz = z - SPOTS.fort.y;
  h += 1.15 * Math.exp(-(fx * fx + fz * fz) / 7);

  // the wadi in front
  const wz = z - wadiZ(x);
  h -= 0.95 * Math.exp(-(wz * wz) / 1.6) * smooth(-20, -12, x);

  // dunes at the front right
  const dune = smooth(9, 17, x) * smooth(6.5, 12.5, z);
  h += dune * (Math.sin(x * 0.85 + z * 0.55) * 0.5 + 0.5) * 1.7;

  // flatten under the falaj, road and town so things sit nicely
  const flatF = Math.exp(-(distToFalaj(x, z) ** 2) / 0.35) * (1 - m);
  const flatR = Math.exp(-(distToRoad(x, z) ** 2) / 0.5) * (1 - m);
  const target = 0.35 + (fbm(x * 0.05, z * 0.05) - 0.5) * 0.3;
  h = h * (1 - Math.max(flatF, flatR) * 0.65) + target * Math.max(flatF, flatR) * 0.65;

  return h;
}

const C = {
  sand: new THREE.Color('#d4ad78'),
  sandLight: new THREE.Color('#e3c28c'),
  dune: new THREE.Color('#e9bf7f'),
  rock: new THREE.Color('#8d6c52'),
  rockDark: new THREE.Color('#6d5240'),
  rockLight: new THREE.Color('#a8876a'),
  pebble: new THREE.Color('#b6a48b'),
  garden: new THREE.Color('#6b9a3c'),
  gardenDry: new THREE.Color('#b8a670'),
  road: new THREE.Color('#bfa37a'),
};

export function groundColor(x: number, z: number, h: number, slope: number, green: number, out: THREE.Color) {
  const n = fbm(x * 0.6, z * 0.6);
  out.copy(C.sand).lerp(C.sandLight, n * 0.6);

  const m = smooth(-4.5, -12, z);
  const rocky = Math.max(m * smooth(0.5, 2.5, h), smooth(0.25, 0.6, slope));
  if (rocky > 0) {
    const r = C.rock.clone().lerp(C.rockDark, smooth(0.4, 0.8, slope)).lerp(C.rockLight, n * 0.4);
    out.lerp(r, Math.min(1, rocky));
  }

  const dune = smooth(9, 17, x) * smooth(6.5, 12.5, z);
  if (dune > 0) out.lerp(C.dune, dune * 0.8);

  const wz = z - wadiZ(x);
  const wadi = Math.exp(-(wz * wz) / 1.2) * smooth(-20, -12, x);
  if (wadi > 0.05) out.lerp(C.pebble, wadi * 0.8);

  if (inGarden(x, z, 1.15)) {
    const g = C.gardenDry.clone().lerp(C.garden, green).multiplyScalar(0.92 + n * 0.16);
    const inside = inGarden(x, z, 0.95) ? 1 : 0.55;
    out.lerp(g, inside);
  }
  // green strip along the falaj when water flows
  const fd = distToFalaj(x, z);
  if (green > 0 && fd < 0.9 && m < 0.6) out.lerp(C.garden, (1 - fd / 0.9) * 0.55 * Math.min(1, green + 0.4));

  const rd = distToRoad(x, z);
  if (rd < 0.55) out.lerp(C.road, (1 - rd / 0.55) * 0.5);
  return out;
}

// ─── Geometry for the ground and the cut sides of the model ────────────────────

const SEG_X = 200;
const SEG_Z = 140;

export function buildTerrain(green: number) {
  const geo = new THREE.PlaneGeometry(WORLD.w, WORLD.d, SEG_X, SEG_Z);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  }
  geo.computeVertexNormals();
  paintTerrain(geo, green);

  // level areas and their borders
  const zones = new Float32Array(pos.count);
  const edges = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) zones[i] = zoneOf(pos.getX(i), pos.getZ(i), pos.getY(i));
  const row = SEG_X + 1;
  for (let iz = 0; iz <= SEG_Z; iz++) {
    for (let ix = 0; ix <= SEG_X; ix++) {
      const i = iz * row + ix;
      const a = zones[i];
      if (a < 0) continue;
      const right = ix < SEG_X ? zones[i + 1] : a;
      const down = iz < SEG_Z ? zones[i + row] : a;
      if (right >= 0 && right !== a) {
        edges[i] = 1;
        edges[i + 1] = 1;
      }
      if (down >= 0 && down !== a) {
        edges[i] = 1;
        edges[i + row] = 1;
      }
    }
  }
  // widen the border band a little so it reads from far away
  const wide = edges.slice();
  for (let iz = 1; iz < SEG_Z; iz++) {
    for (let ix = 1; ix < SEG_X; ix++) {
      const i = iz * row + ix;
      if (edges[i] === 1 || zones[i] < 0) continue;
      if (edges[i - 1] === 1 || edges[i + 1] === 1 || edges[i - row] === 1 || edges[i + row] === 1) wide[i] = 0.55;
    }
  }
  edges.set(wide);
  geo.setAttribute('aZone', new THREE.BufferAttribute(zones, 1));
  geo.setAttribute('aEdge', new THREE.BufferAttribute(edges, 1));
  return geo;
}

export function paintTerrain(geo: THREE.BufferGeometry, green: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    groundColor(x, z, pos.getY(i), 1 - nor.getY(i), green, c);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

/** The four cut faces of the model, showing soil layers. */
export function buildSkirt() {
  const positions: number[] = [];
  const colors: number[] = [];
  const layers = [
    { y: 0, c: new THREE.Color('#b0875a') },
    { y: -0.9, c: new THREE.Color('#946b47') },
    { y: -1.9, c: new THREE.Color('#7a5a40') },
    { y: -2.6, c: new THREE.Color('#5f4836') },
  ];
  const colorAt = (y: number, top: number) => {
    const d = top - y;
    let col = layers[layers.length - 1].c;
    for (let i = 0; i < layers.length - 1; i++) {
      if (d <= -layers[i + 1].y) {
        col = layers[i].c.clone().lerp(layers[i + 1].c, (d + layers[i].y) / (layers[i].y - layers[i + 1].y));
        break;
      }
    }
    return col;
  };
  const edge = (pts: [number, number][]) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i];
      const [x1, z1] = pts[i + 1];
      const h0 = heightAt(x0, z0);
      const h1 = heightAt(x1, z1);
      const strata = [0, 0.5, 1.3, 2.2, h0 - BASE_BOTTOM];
      // build columns from top down in several bands so the layers show
      const bands = [h0, h0 - 0.4, h0 - 1.2, h0 - 2.1, BASE_BOTTOM];
      const bands1 = [h1, h1 - 0.4, h1 - 1.2, h1 - 2.1, BASE_BOTTOM];
      void strata;
      for (let b = 0; b < bands.length - 1; b++) {
        const ya0 = Math.max(bands[b], BASE_BOTTOM);
        const yb0 = Math.max(bands[b + 1], BASE_BOTTOM);
        const ya1 = Math.max(bands1[b], BASE_BOTTOM);
        const yb1 = Math.max(bands1[b + 1], BASE_BOTTOM);
        const quad = [
          [x0, ya0, z0, h0],
          [x0, yb0, z0, h0],
          [x1, ya1, z1, h1],
          [x1, ya1, z1, h1],
          [x0, yb0, z0, h0],
          [x1, yb1, z1, h1],
        ];
        for (const [x, y, z, top] of quad) {
          positions.push(x, y, z);
          const col = colorAt(y, top).multiplyScalar(0.92 + hash(x * 3.1, y * 5.7) * 0.12);
          colors.push(col.r, col.g, col.b);
        }
      }
    }
  };
  const hw = WORLD.w / 2;
  const hd = WORLD.d / 2;
  const n = 160;
  const line = (ax: number, az: number, bx: number, bz: number) =>
    Array.from({ length: n + 1 }, (_, i) => [ax + ((bx - ax) * i) / n, az + ((bz - az) * i) / n] as [number, number]);
  edge(line(-hw, hd, hw, hd)); // front
  edge(line(hw, hd, hw, -hd)); // right
  edge(line(hw, -hd, -hw, -hd)); // back
  edge(line(-hw, -hd, -hw, hd)); // left
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// ─── Scatter helpers ───────────────────────────────────────────────────────────

export interface Spot {
  x: number;
  z: number;
  y: number;
  s: number; // scale
  r: number; // rotation
}

/** Places that buildings use, so trees and rocks keep away from them. */
export const BLOCKERS: { x: number; z: number; r: number }[] = [
  { x: SPOTS.fort.x, z: SPOTS.fort.y, r: 2.6 },
  { x: SPOTS.shop.x, z: SPOTS.shop.y, r: 1.2 },
  { x: SPOTS.souq.x, z: SPOTS.souq.y, r: 1.9 },
  { x: SPOTS.workshop.x, z: SPOTS.workshop.y, r: 2.0 },
  { x: SPOTS.spring.x, z: SPOTS.spring.y, r: 1.0 },
  { x: SPOTS.tower.x, z: SPOTS.tower.y, r: 0.9 },
];

export function blocked(x: number, z: number, pad = 0) {
  return BLOCKERS.some(b => Math.hypot(x - b.x, z - b.z) < b.r + pad);
}

/** Simple village plan: houses on a jittered grid in a few quarters. */
export function houseSpots(): (Spot & { w: number; d: number; h: number; tone: number; storeys: number })[] {
  const out: (Spot & { w: number; d: number; h: number; tone: number; storeys: number })[] = [];
  const r = rng(7);
  const quarters: [number, number, number, number, number][] = [
    // x0, x1, z0, z1, spacing
    [-13.2, -7.6, -5.4, -0.2, 1.05], // terraced village on the slope
    [-8.2, -0.4, -0.6, 3.2, 1.0], // old quarter around the fort
    [-7.2, -1.2, -6.2, -3.8, 1.1], // behind the fort
    [6.6, 11.6, 6.9, 8.0, 1.2], // houses along the road
    [-16.5, -14, -2.5, 1.5, 1.2], // far left hamlet
  ];
  for (const [x0, x1, z0, z1, sp] of quarters) {
    for (let x = x0; x <= x1; x += sp) {
      for (let z = z0; z <= z1; z += sp) {
        const jx = x + (r() - 0.5) * sp * 0.35;
        const jz = z + (r() - 0.5) * sp * 0.35;
        if (r() < 0.18) continue;
        if (blocked(jx, jz, 0.5)) continue;
        if (distToFalaj(jx, jz) < 0.7 || distToRoad(jx, jz) < 0.75) continue;
        const w = 0.6 + r() * 0.45;
        const d = 0.6 + r() * 0.45;
        const storeys = r() < 0.25 ? 2 : 1;
        const h = (0.45 + r() * 0.25) * storeys;
        out.push({ x: jx, z: jz, y: heightAt(jx, jz), s: 1, r: Math.round(r() * 4) * (Math.PI / 2) + (r() - 0.5) * 0.12, w, d, h, tone: r(), storeys });
      }
    }
  }
  return out;
}

export function scatter(
  count: number,
  seed: number,
  accept: (x: number, z: number) => boolean,
  scale: [number, number] = [0.8, 1.2],
  tries = 40
): Spot[] {
  const r = rng(seed);
  const out: Spot[] = [];
  let guard = 0;
  while (out.length < count && guard < count * tries) {
    guard++;
    const x = (r() - 0.5) * (WORLD.w - 1.2);
    const z = (r() - 0.5) * (WORLD.d - 1.2);
    if (!accept(x, z)) continue;
    out.push({ x, z, y: heightAt(x, z), s: scale[0] + r() * (scale[1] - scale[0]), r: r() * Math.PI * 2 });
  }
  return out;
}

export function pointsOnCurve(pts: [number, number][], lift = 0.05, samples = 200) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, heightAt(x, z) + lift, z)), false, 'centripetal');
  return { curve, points: curve.getSpacedPoints(samples) };
}
