import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BaseProjection,
  DEFAULT_DRIVERS,
  DEFAULT_EVENTS,
  Driver,
  COFFEE_KIOSK_NIZWA,
  WORKSHOP_VEHICLE,
  analyseRepairOrReplace,
  costOfPolicy,
  simulate,
  sampleTriangular,
  mulberry32,
} from "../index";

const flat: BaseProjection = {
  initialInvestment: 1200,
  revenue: [2400, 2400, 2400],
  costs: [{ label: "fixed", type: "fixed", yearly: [1200, 1200, 1200] }],
};

const fixedDriver = (kind: Driver["kind"], v: number): Driver => ({
  kind,
  label: kind,
  labelAr: kind,
  range: { low: v, mode: v, high: v },
});

test("no uncertainty: every run equals the hand calculation", () => {
  const r = simulate(flat, [fixedDriver("demand", 1)], [], { iterations: 500, annualDiscountRate: 0 });
  // 3 years x (2400 - 1200) - 1200 = 2400
  assert.equal(Math.round(r.baseCase.net), 2400);
  assert.equal(Math.round(r.net.min), 2400);
  assert.equal(Math.round(r.net.max), 2400);
  assert.equal(r.pPositiveNet, 1);
  // monthly profit 100, investment 1200 -> break-even in month 12
  assert.equal(r.baseCase.breakEvenMonth, 12);
  assert.equal(Math.round(r.baseCase.npv), 2400); // zero discount rate
});

test("launch delay costs the lost months of revenue", () => {
  const r = simulate(flat, [fixedDriver("launchDelay", 3)], [], { iterations: 200, annualDiscountRate: 0 });
  // 3 months with no revenue but rent still paid: 3 x 200 lost
  assert.equal(Math.round(r.net.p50), 2400 - 600);
});

test("same seed reproduces results; different seed differs", () => {
  const a = simulate(COFFEE_KIOSK_NIZWA, DEFAULT_DRIVERS, DEFAULT_EVENTS, { seed: 7, iterations: 3000 });
  const b = simulate(COFFEE_KIOSK_NIZWA, DEFAULT_DRIVERS, DEFAULT_EVENTS, { seed: 7, iterations: 3000 });
  const c = simulate(COFFEE_KIOSK_NIZWA, DEFAULT_DRIVERS, DEFAULT_EVENTS, { seed: 8, iterations: 3000 });
  assert.deepEqual(a.net, b.net);
  assert.equal(a.pPositiveNet, b.pPositiveNet);
  assert.notEqual(a.net.mean, c.net.mean);
});

test("outputs are well-formed", () => {
  const r = simulate(COFFEE_KIOSK_NIZWA, DEFAULT_DRIVERS, DEFAULT_EVENTS, { iterations: 5000 });
  for (const p of [r.pPositiveNet, r.pPositiveNPV, r.pBreakEvenWithinHorizon]) {
    assert.ok(p >= 0 && p <= 1);
  }
  assert.ok(r.net.p10 <= r.net.p50 && r.net.p50 <= r.net.p90);
  assert.equal(r.histogram.reduce((s, h) => s + h.count, 0), r.iterations);
  assert.equal(r.fan.length, 36);
  for (const f of r.fan) assert.ok(f.p10 <= f.p50 && f.p50 <= f.p90);
  // sorted by swing
  for (let i = 1; i < r.sensitivity.length; i++) {
    assert.ok(r.sensitivity[i - 1].swing >= r.sensitivity[i].swing);
  }
});

test("price moves profit more than equal-size demand moves (variable costs follow volume)", () => {
  const range = { low: 0.9, mode: 1, high: 1.1 };
  const r = simulate(
    COFFEE_KIOSK_NIZWA,
    [
      { kind: "demand", label: "d", labelAr: "d", range },
      { kind: "price", label: "p", labelAr: "p", range },
    ],
    [],
    { iterations: 200 },
  );
  const price = r.sensitivity.find((s) => s.kind === "price")!;
  const demand = r.sensitivity.find((s) => s.kind === "demand")!;
  assert.ok(price.swing > demand.swing);
});

test("a damaging event shows a negative average impact", () => {
  const r = simulate(
    COFFEE_KIOSK_NIZWA,
    [fixedDriver("demand", 1)],
    [{ id: "x", label: "x", labelAr: "x", probability: 0.5, affects: "demand", multiplier: 0.7 }],
    { iterations: 4000 },
  );
  assert.ok(r.events[0].avgImpactWhenOccurs < 0);
  assert.ok(Math.abs(r.events[0].occurredShare - 0.5) < 0.05);
});

test("triangular sampling stays in range and matches its mean", () => {
  const rng = mulberry32(1);
  const d = { low: 2, mode: 3, high: 7 };
  let sum = 0;
  const n = 50000;
  for (let i = 0; i < n; i++) {
    const v = sampleTriangular(d, rng());
    assert.ok(v >= 2 && v <= 7);
    sum += v;
  }
  assert.ok(Math.abs(sum / n - 4) < 0.05); // mean = (2+3+7)/3 = 4
});

test("invalid inputs are rejected with a clear message", () => {
  assert.throws(
    () => simulate(flat, [{ kind: "demand", label: "bad", labelAr: "x", range: { low: 1.2, mode: 1, high: 1.1 } }]),
    /low <= mode <= high/,
  );
  assert.throws(
    () => simulate({ ...flat, costs: [{ label: "short", type: "fixed", yearly: [1] }] }, []),
    /expected 3/,
  );
});

test("repair-or-replace: obvious cases go the obvious way", () => {
  const cheapOld = {
    ...WORKSHOP_VEHICLE,
    current: { ...WORKSHOP_VEHICLE.current, annualMaintenance: 100, downtimeDays: 0 },
  };
  const r1 = analyseRepairOrReplace(cheapOld, { iterations: 500 });
  assert.equal(r1.recommendedYear, cheapOld.horizonYears); // keep

  const awfulOld = {
    ...WORKSHOP_VEHICLE,
    current: { ...WORKSHOP_VEHICLE.current, annualMaintenance: 12000, downtimeDays: 90 },
  };
  const r2 = analyseRepairOrReplace(awfulOld, { iterations: 500 });
  assert.equal(r2.recommendedYear, 0); // replace now
  assert.ok(r2.pRecommendedBeatsKeeping > 0.99);
});

test("repair-or-replace: hand check of one policy", () => {
  const inp = {
    horizonYears: 2,
    annualDiscountRate: 0,
    current: {
      annualMaintenance: 1000,
      maintenanceGrowth: { low: 0, mode: 0, high: 0 },
      downtimeDays: 0,
      downtimeGrowth: { low: 0, mode: 0, high: 0 },
      costPerDowntimeDay: { low: 0, mode: 0, high: 0 },
      resaleValueNow: 500,
      resaleDecline: 0,
    },
    replacement: {
      price: { low: 3000, mode: 3000, high: 3000 },
      annualMaintenance: 100,
      maintenanceGrowth: { low: 0, mode: 0, high: 0 },
      downtimeDays: 0,
      residualRate: 0.5,
    },
  };
  const d = { g: 0, gd: 0, cpd: 0, price: 3000, gn: 0 };
  // keep: 2 x 1000 - 500 resale = 1500
  assert.equal(costOfPolicy(inp, d, 2), 1500);
  // replace now: (3000 - 500) + 2 x 100 - 3000 x 0.25 = 1950
  assert.equal(costOfPolicy(inp, d, 0), 1950);
  const res = analyseRepairOrReplace(inp, { iterations: 100 });
  assert.equal(res.recommendedYear, 2);
});
