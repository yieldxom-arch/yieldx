/**
 * YieldX Scenario Engine
 * ----------------------
 * Takes the deterministic 3-year projection YieldX already produces
 * (revenue + cost lines + initial investment) and stress-tests it with
 * Monte Carlo simulation. Instead of one profit number, it reports:
 *
 *  - the probability the project makes money / breaks even in the horizon
 *  - a pessimistic / likely / optimistic range (P10 / P50 / P90)
 *  - when break-even is likely to happen
 *  - which assumption the result is most sensitive to (tornado)
 *  - how much each "World Event" costs when it happens
 *
 * All figures are computed here, not by the language model. The AI advisors
 * only explain these results, so the numbers are reproducible (seeded) and
 * every one of them traces back to an input assumption.
 *
 * Figures are operating cash before tax, in the currency of the inputs (OMR).
 */

import {
  Rng,
  Spread,
  Triangular,
  assertTriangular,
  mulberry32,
  percentile,
  sampleTriangular,
  spread,
} from "./rng";

export type MultiplierKind = "demand" | "price" | "variableCost" | "fixedCost" | "capex";
export type DriverKind = MultiplierKind | "launchDelay";

export interface Driver {
  kind: DriverKind;
  label: string;
  labelAr: string;
  /**
   * For multiplier drivers: multiplier on the base projection (1 = as planned).
   * For "launchDelay": months of delay before revenue starts (0 = on time).
   */
  range: Triangular;
}

export interface WorldEvent {
  id: string;
  label: string;
  labelAr: string;
  /** Chance the event happens at some point within the horizon (0..1). */
  probability: number;
  affects: Exclude<MultiplierKind, "capex">;
  /** Applied from the month the event starts until the end of the horizon. */
  multiplier: number;
}

export interface CostLine {
  label: string;
  /** "variable" scales with sales volume; "fixed" is paid every month regardless. */
  type: "variable" | "fixed";
  /** One value per year, same length as `revenue`. */
  yearly: number[];
}

export interface BaseProjection {
  initialInvestment: number;
  /** Yearly revenue, e.g. 3 values for a 3-year study. */
  revenue: number[];
  costs: CostLine[];
}

export interface ScenarioOptions {
  iterations?: number;
  seed?: number;
  /** Annual discount rate for NPV, e.g. 0.08. */
  annualDiscountRate?: number;
  histogramBins?: number;
}

export interface Outcome {
  /** Cumulative cash at the end of the horizon, after the initial investment. */
  net: number;
  npv: number;
  /** 1-based month in which cumulative cash first reaches zero; null if never. */
  breakEvenMonth: number | null;
  cumulative: number[];
}

export interface SensitivityRow {
  kind: DriverKind;
  label: string;
  labelAr: string;
  /** Net result with this driver at its pessimistic / optimistic value, all else as planned. */
  netAtLow: number;
  netAtHigh: number;
  swing: number;
}

export interface EventImpact {
  id: string;
  label: string;
  labelAr: string;
  occurredShare: number;
  /** Average change in net result in runs where the event happened vs. runs where it did not. */
  avgImpactWhenOccurs: number;
}

export interface ScenarioResult {
  iterations: number;
  seed: number;
  months: number;
  /** The single-number answer a traditional study gives (all inputs as planned, no events). */
  baseCase: Outcome;
  pPositiveNet: number;
  pPositiveNPV: number;
  pBreakEvenWithinHorizon: number;
  net: Spread;
  npv: Spread;
  /** Spread of break-even month among runs that do break even. */
  breakEvenMonth: Spread | null;
  /** Monthly cumulative cash bands for a fan chart. */
  fan: { month: number; p10: number; p50: number; p90: number }[];
  histogram: { from: number; to: number; count: number }[];
  sensitivity: SensitivityRow[];
  events: EventImpact[];
}

interface DrawnScenario {
  mult: Record<MultiplierKind, number>;
  delay: number;
  active: { affects: WorldEvent["affects"]; multiplier: number; startMonth: number }[];
}

const NEUTRAL: Record<MultiplierKind, number> = {
  demand: 1,
  price: 1,
  variableCost: 1,
  fixedCost: 1,
  capex: 1,
};

export function validateProjection(base: BaseProjection): void {
  const years = base.revenue.length;
  if (years < 1) throw new Error("revenue must have at least one year");
  if (!(base.initialInvestment >= 0)) throw new Error("initialInvestment must be >= 0");
  for (const v of base.revenue) {
    if (!Number.isFinite(v)) throw new Error("revenue values must be numbers");
  }
  for (const c of base.costs) {
    if (c.yearly.length !== years) {
      throw new Error(`cost line "${c.label}" has ${c.yearly.length} years, expected ${years}`);
    }
    for (const v of c.yearly) {
      if (!Number.isFinite(v)) throw new Error(`cost line "${c.label}" has a non-number value`);
    }
  }
}

/** Runs one month-by-month path for a given set of drawn assumptions. */
export function runPath(
  base: BaseProjection,
  s: DrawnScenario,
  annualDiscountRate: number,
): Outcome {
  const years = base.revenue.length;
  const months = years * 12;
  const monthlyRate = Math.pow(1 + annualDiscountRate, 1 / 12) - 1;
  const capex = base.initialInvestment * s.mult.capex;

  const variableByYear = new Array(years).fill(0);
  const fixedByYear = new Array(years).fill(0);
  for (const c of base.costs) {
    const target = c.type === "variable" ? variableByYear : fixedByYear;
    c.yearly.forEach((v, y) => (target[y] += v));
  }

  let cum = -capex;
  let npv = -capex;
  let breakEvenMonth: number | null = capex <= 0 ? 0 : null;
  const cumulative: number[] = new Array(months);

  for (let m = 0; m < months; m++) {
    let demand = s.mult.demand;
    let price = s.mult.price;
    let variableCost = s.mult.variableCost;
    let fixedCost = s.mult.fixedCost;
    for (const e of s.active) {
      if (m < e.startMonth) continue;
      if (e.affects === "demand") demand *= e.multiplier;
      else if (e.affects === "price") price *= e.multiplier;
      else if (e.affects === "variableCost") variableCost *= e.multiplier;
      else fixedCost *= e.multiplier;
    }

    const k = m - s.delay; // operating month (sales start after the delay)
    let revenue = 0;
    let variable = 0;
    if (k >= 0) {
      const y = Math.floor(k / 12);
      revenue = (base.revenue[y] / 12) * demand * price;
      variable = (variableByYear[y] / 12) * demand * variableCost;
    }
    // Fixed costs (rent, salaries, utilities) are paid from month one, even during a delay.
    const fixed = (fixedByYear[Math.floor(m / 12)] / 12) * fixedCost;

    const cash = revenue - variable - fixed;
    cum += cash;
    npv += cash / Math.pow(1 + monthlyRate, m + 1);
    cumulative[m] = cum;
    if (breakEvenMonth === null && cum >= 0) breakEvenMonth = m + 1;
  }

  return { net: cum, npv, breakEvenMonth, cumulative };
}

function plannedScenario(): DrawnScenario {
  return { mult: { ...NEUTRAL }, delay: 0, active: [] };
}

export function simulate(
  base: BaseProjection,
  drivers: Driver[],
  events: WorldEvent[] = [],
  options: ScenarioOptions = {},
): ScenarioResult {
  validateProjection(base);
  for (const d of drivers) assertTriangular(d.range, `driver "${d.label}"`);
  for (const e of events) {
    if (!(e.probability >= 0 && e.probability <= 1)) {
      throw new Error(`event "${e.label}": probability must be between 0 and 1`);
    }
    if (!(e.multiplier > 0)) throw new Error(`event "${e.label}": multiplier must be > 0`);
  }

  const iterations = Math.max(100, Math.floor(options.iterations ?? 10000));
  const seed = options.seed ?? 2026;
  const rate = options.annualDiscountRate ?? 0.08;
  const bins = options.histogramBins ?? 24;
  const months = base.revenue.length * 12;
  const rng: Rng = mulberry32(seed);

  const nets: number[] = new Array(iterations);
  const npvs: number[] = new Array(iterations);
  const breakEvens: number[] = [];
  const cumByMonth: number[][] = Array.from({ length: months }, () => new Array(iterations));
  const eventHit: boolean[][] = events.map(() => new Array(iterations));

  for (let i = 0; i < iterations; i++) {
    const s = plannedScenario();
    for (const d of drivers) {
      const v = sampleTriangular(d.range, rng());
      if (d.kind === "launchDelay") s.delay = Math.max(0, Math.round(v));
      else s.mult[d.kind] *= v;
    }
    events.forEach((e, j) => {
      const hit = rng() < e.probability;
      const startMonth = Math.floor(rng() * months); // draw always, keeps streams aligned
      eventHit[j][i] = hit;
      if (hit) s.active.push({ affects: e.affects, multiplier: e.multiplier, startMonth });
    });

    const out = runPath(base, s, rate);
    nets[i] = out.net;
    npvs[i] = out.npv;
    if (out.breakEvenMonth !== null) breakEvens.push(out.breakEvenMonth);
    for (let m = 0; m < months; m++) cumByMonth[m][i] = out.cumulative[m];
  }

  const baseCase = runPath(base, plannedScenario(), rate);

  // Fan chart bands.
  const fan = cumByMonth.map((vals, m) => {
    const s = vals.sort((x, y) => x - y);
    return { month: m + 1, p10: percentile(s, 0.1), p50: percentile(s, 0.5), p90: percentile(s, 0.9) };
  });

  // Histogram of net results.
  const netSpread = spread(nets);
  const width = (netSpread.max - netSpread.min) / bins || 1;
  const histogram = Array.from({ length: bins }, (_, b) => ({
    from: netSpread.min + b * width,
    to: netSpread.min + (b + 1) * width,
    count: 0,
  }));
  for (const v of nets) {
    const b = Math.min(bins - 1, Math.floor((v - netSpread.min) / width));
    histogram[b].count++;
  }

  // One-at-a-time sensitivity (tornado): each driver at its extremes, everything else as planned.
  const sensitivity: SensitivityRow[] = drivers
    .map((d) => {
      const at = (v: number) => {
        const s = plannedScenario();
        if (d.kind === "launchDelay") s.delay = Math.max(0, Math.round(v));
        else s.mult[d.kind] = v;
        return runPath(base, s, rate).net;
      };
      // For cost drivers and delay, the "high" value is the bad one; keep low/high as the input range.
      const netAtLow = at(d.range.low);
      const netAtHigh = at(d.range.high);
      return {
        kind: d.kind,
        label: d.label,
        labelAr: d.labelAr,
        netAtLow,
        netAtHigh,
        swing: Math.abs(netAtHigh - netAtLow),
      };
    })
    .sort((a, b) => b.swing - a.swing);

  // Average effect of each event (independent draws, so a simple difference in means).
  const eventImpacts: EventImpact[] = events.map((e, j) => {
    let withSum = 0;
    let withN = 0;
    let withoutSum = 0;
    let withoutN = 0;
    for (let i = 0; i < iterations; i++) {
      if (eventHit[j][i]) {
        withSum += nets[i];
        withN++;
      } else {
        withoutSum += nets[i];
        withoutN++;
      }
    }
    const impact = withN && withoutN ? withSum / withN - withoutSum / withoutN : 0;
    return {
      id: e.id,
      label: e.label,
      labelAr: e.labelAr,
      occurredShare: withN / iterations,
      avgImpactWhenOccurs: impact,
    };
  });

  return {
    iterations,
    seed,
    months,
    baseCase,
    pPositiveNet: nets.filter((v) => v > 0).length / iterations,
    pPositiveNPV: npvs.filter((v) => v > 0).length / iterations,
    pBreakEvenWithinHorizon: breakEvens.length / iterations,
    net: netSpread,
    npv: spread(npvs),
    breakEvenMonth: breakEvens.length ? spread(breakEvens) : null,
    fan,
    histogram,
    sensitivity,
    events: eventImpacts,
  };
}

/**
 * Default uncertainty ranges for an early-stage small business.
 * The user's own plan is always the most likely value (mode = 1, no delay);
 * the ranges add a realistic downside and upside around it.
 * These are starting assumptions, to be tuned per sector and, later, calibrated on real outcomes.
 */
export const DEFAULT_DRIVERS: Driver[] = [
  { kind: "demand", label: "Customer demand", labelAr: "حجم الطلب", range: { low: 0.7, mode: 1, high: 1.2 } },
  { kind: "price", label: "Selling price", labelAr: "سعر البيع", range: { low: 0.92, mode: 1, high: 1.05 } },
  { kind: "variableCost", label: "Supply costs", labelAr: "تكاليف المواد والتوريد", range: { low: 0.95, mode: 1, high: 1.12 } },
  { kind: "fixedCost", label: "Rent & salaries", labelAr: "الإيجار والرواتب", range: { low: 0.98, mode: 1, high: 1.08 } },
  { kind: "capex", label: "Setup cost", labelAr: "تكلفة التأسيس", range: { low: 0.95, mode: 1, high: 1.25 } },
  { kind: "launchDelay", label: "Launch delay (months)", labelAr: "تأخر الافتتاح (أشهر)", range: { low: 0, mode: 0, high: 3 } },
];

/** World Events, reused from the YieldX game layer as random shocks. */
export const DEFAULT_EVENTS: WorldEvent[] = [
  { id: "competitor", label: "New competitor opens nearby", labelAr: "افتتاح منافس قريب", probability: 0.3, affects: "demand", multiplier: 0.88 },
  { id: "supplier", label: "Supplier raises prices", labelAr: "ارتفاع أسعار الموردين", probability: 0.3, affects: "variableCost", multiplier: 1.08 },
  { id: "rent", label: "Rent increase at renewal", labelAr: "زيادة الإيجار عند التجديد", probability: 0.25, affects: "fixedCost", multiplier: 1.08 },
  { id: "viral", label: "Strong social-media exposure", labelAr: "انتشار قوي على وسائل التواصل", probability: 0.15, affects: "demand", multiplier: 1.15 },
];
