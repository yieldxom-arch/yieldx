/**
 * Illustrative inputs for demos. These are made-up example figures,
 * not market data — replace them with a real study before presenting results.
 */

import type { BaseProjection } from "./scenarioEngine";
import type { RepairReplaceInputs } from "./repairOrReplace";

/** Example: a specialty coffee kiosk in Nizwa (3-year study, OMR). */
export const COFFEE_KIOSK_NIZWA: BaseProjection = {
  initialInvestment: 9000,
  revenue: [28000, 38000, 45000],
  costs: [
    { label: "Coffee, milk & packaging", type: "variable", yearly: [11200, 15200, 18000] },
    { label: "Rent", type: "fixed", yearly: [4800, 4800, 5000] },
    { label: "Salaries", type: "fixed", yearly: [8400, 9000, 9400] },
    { label: "Utilities & licences", type: "fixed", yearly: [1200, 1200, 1200] },
  ],
};

/** Example: a 9-year-old workshop vehicle — keep repairing or replace? (OMR) */
export const WORKSHOP_VEHICLE: RepairReplaceInputs = {
  horizonYears: 8,
  annualDiscountRate: 0.06,
  current: {
    annualMaintenance: 1000,
    maintenanceGrowth: { low: 0.12, mode: 0.18, high: 0.3 },
    downtimeDays: 8,
    downtimeGrowth: { low: 0.05, mode: 0.12, high: 0.25 },
    costPerDowntimeDay: { low: 30, mode: 45, high: 70 },
    resaleValueNow: 3000,
    resaleDecline: 0.12,
  },
  replacement: {
    price: { low: 14000, mode: 15000, high: 17000 },
    annualMaintenance: 500,
    maintenanceGrowth: { low: 0.03, mode: 0.06, high: 0.1 },
    downtimeDays: 3,
    residualRate: 0.88,
  },
};
