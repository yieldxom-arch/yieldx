import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSeasonality,
  calendarMonth,
  monthMultiplier,
  loanSchedule,
  cashSurvival,
  simulate,
  monthlyOperatingCash,
  COFFEE_KIOSK_NIZWA,
  DEFAULT_DRIVERS,
  DEFAULT_EVENTS,
} from "../index";
import { corporateTax, vatCheck, nationalImpact } from "../../oman/rules";

test("Ramadan 1448 falls in February–March 2027 (Umm al-Qura)", () => {
  const feb = calendarMonth(2027, 2);
  const mar = calendarMonth(2027, 3);
  const jun = calendarMonth(2027, 6);
  assert.ok(feb.ramadanShare > 0.7, `Feb share ${feb.ramadanShare}`);
  assert.ok(mar.ramadanShare > 0 && mar.ramadanShare < 0.4, `Mar share ${mar.ramadanShare}`);
  assert.ok(mar.eidShare > 0, "Eid al-Fitr in March 2027");
  assert.equal(jun.ramadanShare, 0);
  // Ramadan moves about 11 days earlier each year
  const feb2028 = calendarMonth(2028, 1);
  assert.ok(feb2028.ramadanShare > 0, "Ramadan 1449 starts in late January 2028");
});

test("seasonality: food & retail dips in Ramadan, 'none' is flat", () => {
  const s = buildSeasonality(2027, 1, 24, "food_retail");
  assert.equal(s.multipliers.length, 24);
  assert.ok(s.multipliers[1] < 1, "February 2027 (Ramadan) is below a normal month");
  assert.ok(s.ramadanMonths.includes(2));
  const flat = buildSeasonality(2027, 1, 24, "none");
  assert.ok(flat.multipliers.every((m) => Math.abs(m - 1) < 1e-12));
  // Khareef boosts tourism in Dhofar in August
  assert.ok(monthMultiplier(calendarMonth(2027, 8), "tourism_dhofar") > 1.5);
});

test("seasonality changes the simulated result but not the plan as written", () => {
  const seasonality = buildSeasonality(2027, 1, 36, "food_retail").multipliers;
  const flat = simulate(COFFEE_KIOSK_NIZWA, DEFAULT_DRIVERS, DEFAULT_EVENTS, { iterations: 2000 });
  const oman = simulate(COFFEE_KIOSK_NIZWA, DEFAULT_DRIVERS, DEFAULT_EVENTS, { iterations: 2000, seasonality });
  assert.equal(Math.round(flat.baseCase.net), Math.round(oman.baseCase.net));
  assert.ok(oman.calendarCase.net < oman.baseCase.net, "calendar lowers the food & retail plan");
  assert.ok(oman.net.p50 < flat.net.p50);
});

test("loan schedule: interest-only grace, then repays the full amount", () => {
  const { payments, totalInterest } = loanSchedule({ amount: 12000, annualRate: 0.06, graceMonths: 6, termYears: 3 }, 36);
  assert.ok(Math.abs(payments[0] - 60) < 1e-9, "grace month pays interest only (12000 × 0.5%)");
  const principalPaid = payments.reduce((s, p) => s + p, 0) - totalInterest;
  assert.ok(Math.abs(principalPaid - 12000) < 1e-6);
  const zero = loanSchedule({ amount: 6000, annualRate: 0, graceMonths: 0, termYears: 1 }, 12);
  assert.ok(zero.payments.every((p) => Math.abs(p - 500) < 1e-9));
});

test("cash survival finds the first negative month", () => {
  const r = cashSurvival([-100, -100, 50, 300], 150);
  assert.equal(r.firstNegativeMonth, 2);
  assert.equal(r.lowestBalance, -50);
  assert.equal(r.lowestMonth, 2);
  assert.equal(r.endBalance, 300);
});

test("monthly operating cash leaves out financing lines when asked", () => {
  const base = { ...COFFEE_KIOSK_NIZWA, costs: [...COFFEE_KIOSK_NIZWA.costs, { label: "interest", type: "fixed" as const, yearly: [1200, 1200, 1200], financing: true }] };
  const withInt = monthlyOperatingCash(base);
  const without = monthlyOperatingCash(base, { excludeFinancing: true });
  assert.ok(Math.abs(without[0] - withInt[0] - 100) < 1e-9);
});

test("VAT: mandatory registration month from rolling 12-month revenue", () => {
  const r = vatCheck(new Array(24).fill(4000)); // 48,000 a year
  assert.equal(r.voluntaryMonth, 5); // 20,000 > 19,250
  assert.equal(r.mandatoryMonth, 10); // 40,000 > 38,500
  assert.ok(Math.abs(r.annualRevenueLossIfPricesInclusive - 48000 * (0.05 / 1.05)) < 1e-6);
  assert.equal(vatCheck(new Array(24).fill(1000)).mandatoryMonth, null);
});

test("corporate tax: 3% when eligible, 15% otherwise, with reasons", () => {
  const small = corporateTax({ omaniOwned: true, employees: 4, capital: 12000, annualGrossIncome: [50000, 60000], annualProfit: [7000, 9000] });
  assert.deepEqual(small.years.map((y) => y.rate), [0.03, 0.03]);
  assert.equal(small.blockers.length, 0);
  const big = corporateTax({ omaniOwned: true, employees: 20, capital: 12000, annualGrossIncome: [50000], annualProfit: [10000] });
  assert.equal(big.years[0].rate, 0.15);
  assert.ok(big.blockers.some((b) => b.includes("employees")));
  const loss = corporateTax({ omaniOwned: true, employees: 2, capital: 1000, annualGrossIncome: [10000], annualProfit: [-500] });
  assert.equal(loss.years[0].tax, 0);
});

test("national impact score is bounded and transparent", () => {
  const r = nationalImpact({ omaniEmployees: 3, totalEmployees: 4, omanizationTarget: 35, monthlyOmaniSalaries: 1350, monthlyRent: 350, monthlyUtilities: 120, monthlyOperatingCosts: 3476, sector: "none", annualSpf: 2349, annualCorporateTax: 200, annualVat: 0 });
  assert.ok(r.score >= 0 && r.score <= 100);
  assert.equal(Math.round(r.parts.reduce((s, p) => s + p.points, 0)), r.score);
  assert.equal(r.parts.find((p) => p.id === "omanization")!.points, 30); // 75% vs 35% target
});
