# YieldX Scenario Engine (Monte Carlo risk simulation)

## What it does
A standard feasibility study gives one profit figure. The scenario engine takes the
same plan (Level 6 revenue, costs and investment) and replays it across thousands of
possible futures, then reports:

- **Probability of profit** and of break-even within the study horizon
- **P10 / P50 / P90** results (1-in-10 bad case, likely, 1-in-10 good case)
- **Likely break-even month** vs the plan's break-even month
- **Sensitivity (tornado)**: which assumption the result depends on most
- **World Events impact**: the average cost of each random shock when it happens

All figures are computed in `src/lib/scenario/`; the language model never produces numbers.
Runs are seeded (seed 2026), so the same inputs always give the same result.

## Method
- Month-by-month cash model: revenue and variable costs scale with demand; fixed costs
  (salaries, rent, insurance, utilities, loan interest) are paid from month 1, including during a launch delay.
- Uncertain drivers use three-point (triangular) estimates around the user's plan
  (the plan is always the most likely value): demand, price, supply costs, fixed costs,
  setup cost, launch delay. Defaults are in `DEFAULT_DRIVERS` and are meant to be tuned per sector.
- World Events are discrete shocks with a probability and an effect from a random start month.
- Cash basis, before tax. Depreciation is excluded because it is not a cash payment.
- Sensitivity is one-at-a-time: each driver at its pessimistic and optimistic value, all else as planned.

## Repair-or-replace template
`analyseRepairOrReplace()` applies the same approach to equipment decisions:
present value of life-cycle cost (maintenance + downtime + purchase − resale) for every
replacement year, under uncertain cost growth, downtime cost and purchase price.
It recommends the year with the lowest expected cost and reports how often each choice is cheapest.

## Tests
```
npx tsx --test src/lib/scenario/__tests__/engine.test.ts
```
10 tests: hand-calculated cases, reproducibility, well-formed outputs, sensitivity ordering,
event impact sign, triangular sampling mean, input validation, repair-or-replace sanity and hand checks.

## Limitations (say these out loud if asked)
- Default uncertainty ranges are expert starting points, not yet calibrated on Omani outcome data.
- Drivers are sampled independently (no correlation between, e.g., demand and price).
- No tax model; financing is simplified (interest-only on the loan).

## Omani calendar (`src/lib/scenario/omanCalendar.ts`)
Monthly demand multipliers from the planned opening month:
- Ramadan and both Eids from the Umm al-Qura calendar built into the browser (`Intl`, `islamic-umalqura`).
  Ramadan moves about 11 days earlier each year, so weak months shift between years. Oman confirms
  dates by moon sighting, so real dates can differ by a day.
- Summer (June–August), Khareef in Dhofar (about 21 June – 21 September), university summer break
  (about 15 June – 31 August).
- Demand patterns (`DEMAND_PATTERNS`): general, food & retail, near a university, tourism in Dhofar,
  construction & outdoor work, none. Factors are starting assumptions; monthly inputs are a normal month.
- The simulation reports the calendar effect alone (`calendarCase` vs `baseCase`).

## Omani rules (`src/lib/oman/rules.ts`)
Each rule carries a source and `checkedOn` date (2026-10-31):
- Social Protection Fund: employer 14.5% for Omani staff (since the sick-leave branch started on 19 July 2026).
- VAT 5%: mandatory registration above OMR 38,500 of taxable supplies in 12 months, voluntary from OMR 19,250.
- Corporate income tax 15%, or 3% for small Omani businesses (capital ≤ OMR 50,000, ≤ 15 employees, gross
  income limit). Published income limits differ (OMR 100,000 / 150,000), so the limit is editable.
- Omanization uses YieldX's sector targets; official quotas are set per profession by the Ministry of Labour.

## Financing survival test (`src/lib/scenario/financing.ts`)
Loan schedule: interest only during the grace period, then equal monthly instalments. Cash starts at the
financing minus fixed assets and pre-opening costs (so it includes working capital), then follows the
plan's monthly operating cash with the Omani calendar. Compared for own money only, the user's plan and a
development-finance offer (terms entered by the user), with the plan and with 20% less revenue.

## National impact score
0–100, the sum of: jobs for Omanis (30), Omanization vs sector target (30), spending that stays in Oman
(25: Omani salaries, social protection, rent, utilities; raw materials excluded because origin is unknown),
Vision 2040 priority sector (15). Also reports public revenue (social protection, income tax, VAT collected).

## Tests
`npx tsx --test src/lib/scenario/__tests__/*.test.ts` — 19 tests, including Ramadan 1448 falling in
February–March 2027, VAT registration month, tax rates and blockers, loan repayment and cash survival.
