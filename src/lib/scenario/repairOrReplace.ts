/**
 * Repair-or-Replace template
 * --------------------------
 * The same idea as the scenario engine, applied to an equipment decision:
 * keep repairing an ageing asset, or replace it — and if so, when?
 *
 * For every possible replacement year it computes the present value of
 * total cost of ownership (maintenance + downtime + purchase − resale),
 * then repeats that thousands of times with uncertain cost growth,
 * downtime cost and purchase price. Standard engineering-economics
 * life-cycle cost analysis, with uncertainty made explicit.
 */

import { Rng, Spread, Triangular, assertTriangular, mulberry32, sampleTriangular, spread } from "./rng";

export interface RepairReplaceInputs {
  /** Planning horizon in years, e.g. 8. */
  horizonYears: number;
  /** Annual discount rate, e.g. 0.06. */
  annualDiscountRate: number;
  current: {
    /** Maintenance cost over the coming year if the asset is kept (OMR). */
    annualMaintenance: number;
    /** Yearly growth of maintenance cost as it ages, e.g. {0.08, 0.12, 0.25}. */
    maintenanceGrowth: Triangular;
    /** Days out of service over the coming year. */
    downtimeDays: number;
    downtimeGrowth: Triangular;
    /** Cost of one day out of service (rental, lost work), OMR. */
    costPerDowntimeDay: Triangular;
    /** What the asset could be sold for today (OMR). */
    resaleValueNow: number;
    /** Fraction of resale value lost each year, e.g. 0.15. */
    resaleDecline: number;
  };
  replacement: {
    /** Purchase price of the new asset (OMR). */
    price: Triangular;
    annualMaintenance: number;
    maintenanceGrowth: Triangular;
    downtimeDays: number;
    /** Fraction of value the new asset keeps each year, e.g. 0.85. */
    residualRate: number;
  };
}

export interface RepairReplaceOptions {
  iterations?: number;
  seed?: number;
}

export interface RepairReplaceResult {
  iterations: number;
  seed: number;
  horizonYears: number;
  /**
   * Present value of total cost for each policy, all inputs at most-likely values.
   * Index k = replace at the start of year k (0 = now); index = horizonYears = keep the asset.
   */
  baseCasePV: number[];
  baseCaseBestYear: number;
  /** Share of simulations in which each policy was the cheapest. */
  bestYearShare: number[];
  /** Policy with the lowest expected life-cycle cost across simulations. */
  recommendedYear: number;
  /** Expected (mean) present value of total cost for each policy. */
  expectedPV: number[];
  /** Probability the recommended policy is cheaper than keeping the asset. */
  pRecommendedBeatsKeeping: number;
  /** Savings of the recommended policy vs keeping (PV, OMR); positive = saves money. */
  savingsVsKeeping: Spread;
  pvKeep: Spread;
  pvRecommended: Spread;
}

interface Draw {
  g: number;
  gd: number;
  cpd: number;
  price: number;
  gn: number;
}

export function costOfPolicy(inp: RepairReplaceInputs, d: Draw, k: number): number {
  const H = inp.horizonYears;
  const r = inp.annualDiscountRate;
  const c = inp.current;
  const n = inp.replacement;
  let pv = 0;

  for (let t = 0; t < H; t++) {
    let yearCost: number;
    if (t < k) {
      const maint = c.annualMaintenance * Math.pow(1 + d.g, t);
      const down = c.downtimeDays * Math.pow(1 + d.gd, t) * d.cpd;
      yearCost = maint + down;
    } else {
      const age = t - k;
      const maint = n.annualMaintenance * Math.pow(1 + d.gn, age);
      const down = n.downtimeDays * Math.pow(1 + d.gn, age) * d.cpd;
      yearCost = maint + down;
    }
    pv += yearCost / Math.pow(1 + r, t + 1); // paid through the year, counted at year end
  }

  if (k < H) {
    const resaleOld = c.resaleValueNow * Math.pow(1 - c.resaleDecline, k);
    pv += (d.price - resaleOld) / Math.pow(1 + r, k);
    const residualNew = d.price * Math.pow(n.residualRate, H - k);
    pv -= residualNew / Math.pow(1 + r, H);
  } else {
    const resaleOld = c.resaleValueNow * Math.pow(1 - c.resaleDecline, H);
    pv -= resaleOld / Math.pow(1 + r, H);
  }
  return pv;
}

function argmin(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) if (values[i] < values[best]) best = i;
  return best;
}

export function analyseRepairOrReplace(
  inp: RepairReplaceInputs,
  options: RepairReplaceOptions = {},
): RepairReplaceResult {
  const H = Math.floor(inp.horizonYears);
  if (!(H >= 1 && H <= 30)) throw new Error("horizonYears must be between 1 and 30");
  if (!(inp.current.resaleDecline >= 0 && inp.current.resaleDecline < 1)) {
    throw new Error("resaleDecline must be in [0, 1)");
  }
  if (!(inp.replacement.residualRate > 0 && inp.replacement.residualRate <= 1)) {
    throw new Error("residualRate must be in (0, 1]");
  }
  assertTriangular(inp.current.maintenanceGrowth, "current.maintenanceGrowth");
  assertTriangular(inp.current.downtimeGrowth, "current.downtimeGrowth");
  assertTriangular(inp.current.costPerDowntimeDay, "current.costPerDowntimeDay");
  assertTriangular(inp.replacement.price, "replacement.price");
  assertTriangular(inp.replacement.maintenanceGrowth, "replacement.maintenanceGrowth");

  const iterations = Math.max(100, Math.floor(options.iterations ?? 10000));
  const seed = options.seed ?? 2026;
  const rng: Rng = mulberry32(seed);
  const policies = H + 1;

  const modeDraw: Draw = {
    g: inp.current.maintenanceGrowth.mode,
    gd: inp.current.downtimeGrowth.mode,
    cpd: inp.current.costPerDowntimeDay.mode,
    price: inp.replacement.price.mode,
    gn: inp.replacement.maintenanceGrowth.mode,
  };
  const baseCasePV = Array.from({ length: policies }, (_, k) => costOfPolicy(inp, modeDraw, k));

  const bestCount = new Array(policies).fill(0);
  const allPV: number[][] = [];
  for (let i = 0; i < iterations; i++) {
    const d: Draw = {
      g: sampleTriangular(inp.current.maintenanceGrowth, rng()),
      gd: sampleTriangular(inp.current.downtimeGrowth, rng()),
      cpd: sampleTriangular(inp.current.costPerDowntimeDay, rng()),
      price: sampleTriangular(inp.replacement.price, rng()),
      gn: sampleTriangular(inp.replacement.maintenanceGrowth, rng()),
    };
    const pvs = Array.from({ length: policies }, (_, k) => costOfPolicy(inp, d, k));
    bestCount[argmin(pvs)]++;
    allPV.push(pvs);
  }

  // Recommend the policy with the lowest expected (mean) life-cycle cost across all simulations.
  const meanPV = Array.from(
    { length: policies },
    (_, k) => allPV.reduce((s, p) => s + p[k], 0) / iterations,
  );
  const recommendedYear = argmin(meanPV);
  const keep = allPV.map((p) => p[H]);
  const rec = allPV.map((p) => p[recommendedYear]);
  const savings = allPV.map((p) => p[H] - p[recommendedYear]);

  return {
    iterations,
    seed,
    horizonYears: H,
    baseCasePV,
    baseCaseBestYear: argmin(baseCasePV),
    bestYearShare: bestCount.map((c) => c / iterations),
    recommendedYear,
    expectedPV: meanPV,
    pRecommendedBeatsKeeping:
      recommendedYear === H ? 1 : savings.filter((s) => s > 0).length / iterations,
    savingsVsKeeping: spread(savings),
    pvKeep: spread(keep),
    pvRecommended: spread(rec),
  };
}
