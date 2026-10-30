/**
 * Financing survival test
 * -----------------------
 * Builds a monthly loan schedule (interest-only during the grace period, then
 * equal monthly instalments) and checks whether the business keeps a positive
 * cash balance every month under a given financing option.
 */

export interface LoanTerms {
  amount: number;
  /** Annual interest rate, e.g. 0.05 for 5%. */
  annualRate: number;
  /** Months of interest-only payments before repayment starts. */
  graceMonths: number;
  /** Total loan term in years, including the grace period. */
  termYears: number;
}

/** Monthly loan payment (interest + principal) for each of `months` months from opening. */
export function loanSchedule(terms: LoanTerms, months: number): { payments: number[]; totalInterest: number } {
  const payments = new Array(months).fill(0);
  const amount = Math.max(0, terms.amount);
  if (amount === 0) return { payments, totalInterest: 0 };
  const r = Math.max(0, terms.annualRate) / 12;
  const totalMonths = Math.max(1, Math.round(terms.termYears * 12));
  const grace = Math.min(Math.max(0, Math.round(terms.graceMonths)), totalMonths - 1);
  const repayMonths = totalMonths - grace;
  const instalment = r === 0 ? amount / repayMonths : (amount * r) / (1 - Math.pow(1 + r, -repayMonths));
  let balance = amount;
  let totalInterest = 0;
  for (let m = 0; m < totalMonths; m++) {
    const interest = balance * r;
    const principal = m < grace ? 0 : Math.min(balance, instalment - interest);
    balance -= principal;
    totalInterest += interest;
    if (m < months) payments[m] = interest + principal;
  }
  return { payments, totalInterest };
}

export interface SurvivalResult {
  /** Cash balance at the end of each month. */
  balances: number[];
  lowestBalance: number;
  /** 1-based month of the lowest balance. */
  lowestMonth: number;
  /** 1-based month the balance first goes below zero, or null if it never does. */
  firstNegativeMonth: number | null;
  endBalance: number;
}

export function cashSurvival(operatingCash: number[], startingCash: number, payments: number[] = []): SurvivalResult {
  let bal = startingCash;
  let lowest = Infinity;
  let lowestMonth = 0;
  let firstNegative: number | null = null;
  const balances: number[] = [];
  operatingCash.forEach((cash, m) => {
    bal += cash - (payments[m] ?? 0);
    balances.push(bal);
    if (bal < lowest) {
      lowest = bal;
      lowestMonth = m + 1;
    }
    if (firstNegative === null && bal < 0) firstNegative = m + 1;
  });
  if (operatingCash.length === 0) {
    lowest = startingCash;
  }
  return { balances, lowestBalance: lowest, lowestMonth, firstNegativeMonth: firstNegative, endBalance: bal };
}
