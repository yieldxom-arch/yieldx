// Walking paths for the characters: a coarse grid of open ground that avoids
// buildings, houses and water, searched with Dijkstra and then smoothed.

import { BLOCKERS, PLOT, PLOT_GATE, SPOTS, WORLD, heightAt, houseSpots } from './world';

type Pt = { x: number; z: number };
type Circle = { x: number; z: number; r: number };

const PAD = 0.22;

let cache: { circles: Circle[]; nodes: Pt[]; edges: number[][] } | null = null;

function obstacles() {
  const circles: Circle[] = BLOCKERS.filter(b => !b.open && !(b.x === PLOT.x && b.z === PLOT.z)).map(b => ({ x: b.x, z: b.z, r: b.r + PAD }));
  for (const h of houseSpots()) circles.push({ x: h.x, z: h.z, r: Math.max(h.w, h.d) * 0.5 + 0.12 });
  return circles;
}

function inPlot(x: number, z: number) {
  return Math.abs(x - PLOT.x) < PLOT.w / 2 - 0.05 && Math.abs(z - PLOT.z) < PLOT.d / 2 - 0.05;
}

function clear(c: Circle[], x: number, z: number) {
  if (Math.abs(x) > WORLD.w / 2 - 0.7 || Math.abs(z) > WORLD.d / 2 - 0.7) return false;
  if (inPlot(x, z)) return false;
  if (heightAt(x, z) > 3.2) return false;
  for (const o of c) if ((x - o.x) ** 2 + (z - o.z) ** 2 < o.r * o.r) return false;
  return true;
}

function segmentClear(c: Circle[], a: Pt, b: Pt) {
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  const n = Math.max(2, Math.ceil(len / 0.15));
  let prevH = heightAt(a.x, a.z);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const x = a.x + (b.x - a.x) * t;
    const z = a.z + (b.z - a.z) * t;
    if (!clear(c, x, z)) return false;
    const h = heightAt(x, z);
    if (Math.abs(h - prevH) > 0.4) return false; // too steep for one step
    prevH = h;
  }
  return true;
}

function graph() {
  if (cache) return cache;
  const circles = obstacles();
  const nodes: Pt[] = [];
  const step = 0.9;
  for (let x = -WORLD.w / 2 + 1; x <= WORLD.w / 2 - 1; x += step) {
    for (let z = -WORLD.d / 2 + 1; z <= WORLD.d / 2 - 1; z += step) {
      if (clear(circles, x, z)) nodes.push({ x, z });
    }
  }
  const edges: number[][] = nodes.map(() => []);
  const reach = step * 1.5;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
      if (d <= reach && segmentClear(circles, nodes[i], nodes[j])) {
        edges[i].push(j);
        edges[j].push(i);
      }
    }
  }
  cache = { circles, nodes, edges };
  return cache;
}

/** A clear point next to a landmark, preferring the side facing the camera. */
function standNear(cx: number, cz: number, r: number): Pt {
  const { circles } = graph();
  for (let extra = 0.35; extra < 3; extra += 0.25) {
    for (const a of [0, 0.5, -0.5, 1, -1, 1.5, -1.5, 2.2, -2.2, Math.PI]) {
      const x = cx + Math.sin(a) * (r + extra);
      const z = cz + Math.cos(a) * (r + extra);
      if (clear(circles, x, z)) return { x, z };
    }
  }
  return { x: cx, z: cz + r + 0.5 };
}

const SPOT_R: Record<string, number> = { spring: 1.0, fort: 2.6, shop: 1.2, souq: 1.9, workshop: 2.0, tower: 0.9, gardens: 0.4, village: 0.4, road: 0.5 };

const standCache = new Map<string, Pt>();

/** Where a character stands for a landmark ('plot' = the user's plot gate). */
export function standFor(spot: keyof typeof SPOTS | 'plot'): Pt {
  if (standCache.has(spot)) return standCache.get(spot)!;
  const p =
    spot === 'plot'
      ? { x: PLOT_GATE.x, z: PLOT_GATE.y - 0.5 }
      : standNear(SPOTS[spot].x, SPOTS[spot].y, SPOT_R[spot] ?? 0.5);
  standCache.set(spot, p);
  return p;
}

function nearestNode(p: Pt) {
  const { nodes, circles } = graph();
  let best = -1;
  let bd = Infinity;
  nodes.forEach((n, i) => {
    const d = (n.x - p.x) ** 2 + (n.z - p.z) ** 2;
    if (d < bd && (d < 0.01 || segmentClear(circles, p, n))) {
      bd = d;
      best = i;
    }
  });
  if (best < 0) {
    nodes.forEach((n, i) => {
      const d = (n.x - p.x) ** 2 + (n.z - p.z) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
  }
  return best;
}

/** Walking route from a to b as a list of points (both ends included). */
export function findPath(a: Pt, b: Pt): Pt[] {
  const { nodes, edges, circles } = graph();
  if (segmentClear(circles, a, b)) return [a, b];
  const s = nearestNode(a);
  const t = nearestNode(b);
  if (s < 0 || t < 0) return [a, b];
  const dist = new Float64Array(nodes.length).fill(Infinity);
  const prev = new Int32Array(nodes.length).fill(-1);
  const done = new Uint8Array(nodes.length);
  dist[s] = 0;
  // small graph: a simple O(n^2) Dijkstra is fast enough
  for (;;) {
    let u = -1;
    let ud = Infinity;
    for (let i = 0; i < nodes.length; i++) if (!done[i] && dist[i] < ud) ((ud = dist[i]), (u = i));
    if (u < 0 || u === t) break;
    done[u] = 1;
    for (const v of edges[u]) {
      const w = Math.hypot(nodes[u].x - nodes[v].x, nodes[u].z - nodes[v].z);
      if (ud + w < dist[v]) {
        dist[v] = ud + w;
        prev[v] = u;
      }
    }
  }
  if (!isFinite(dist[t])) return [a, b];
  const route: Pt[] = [];
  for (let v = t; v >= 0; v = prev[v]) route.unshift(nodes[v]);
  const full = [a, ...route, b];
  // string pulling: skip points while the straight line stays clear
  const out: Pt[] = [full[0]];
  let i = 0;
  while (i < full.length - 1) {
    let j = full.length - 1;
    while (j > i + 1 && !segmentClear(circles, full[i], full[j])) j--;
    out.push(full[j]);
    i = j;
  }
  return out;
}

/** For debugging and tests: the nodes and edges of the walk graph. */
export function navGraph() {
  const { nodes, edges } = graph();
  return { nodes, edges };
}
