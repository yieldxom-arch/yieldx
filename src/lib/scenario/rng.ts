/**
 * Small, dependency-free helpers for reproducible simulation.
 * A fixed seed means the same inputs always give the same report,
 * so every figure shown to a user (or a judge) can be reproduced.
 */

export type Rng = () => number;

/** Mulberry32: fast 32-bit seeded PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Three-point estimate: pessimistic, most likely, optimistic. */
export interface Triangular {
  low: number;
  mode: number;
  high: number;
}

export function assertTriangular(d: Triangular, name: string): void {
  const ok =
    Number.isFinite(d.low) &&
    Number.isFinite(d.mode) &&
    Number.isFinite(d.high) &&
    d.low <= d.mode &&
    d.mode <= d.high;
  if (!ok) {
    throw new Error(
      `${name}: expected low <= mode <= high, got ${d.low} / ${d.mode} / ${d.high}`,
    );
  }
}

/** Inverse-CDF sample from a triangular distribution, given u in [0, 1). */
export function sampleTriangular(d: Triangular, u: number): number {
  const { low: a, mode: c, high: b } = d;
  if (b === a) return a;
  const f = (c - a) / (b - a);
  return u < f
    ? a + Math.sqrt(u * (b - a) * (c - a))
    : b - Math.sqrt((1 - u) * (b - a) * (b - c));
}

/** Percentile with linear interpolation; `sorted` must be ascending. */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export interface Spread {
  mean: number;
  p10: number;
  p50: number;
  p90: number;
  min: number;
  max: number;
}

export function spread(values: number[]): Spread {
  const s = [...values].sort((x, y) => x - y);
  const mean = s.reduce((acc, v) => acc + v, 0) / (s.length || 1);
  return {
    mean,
    p10: percentile(s, 0.1),
    p50: percentile(s, 0.5),
    p90: percentile(s, 0.9),
    min: s[0],
    max: s[s.length - 1],
  };
}
