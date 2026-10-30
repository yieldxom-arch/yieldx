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
