// Commission math for the roofing sales compensation model.
//
// Rules agreed with Musab (see docs/CRM_ROADMAP.md §4.2):
//   * Standard: one rep earns 50% of (contract - cost - overhead)
//     where overhead is capped at $1,800.
//   * Split: two reps share a deal 25% / 25% (legs) + the closer/manager
//     takes 50%. Each rep's share_pct is stored independently, so any
//     combination is expressible without branching logic here.
//   * Custom: share_pct + overhead_cap_cents can both be overridden per
//     commission row.

export type CommissionInputs = {
  contract_cents: number;
  material_cents: number;
  labor_cents: number;
  overhead_cents: number;
  supplement_fee_cents: number;
  other_cents: number;
  share_pct: number;
  overhead_cap_cents: number;
};

export type CommissionOutputs = {
  effective_overhead_cents: number;
  net_profit_cents: number;
  payout_cents: number;
};

// Capped-overhead net profit applied to a single rep's share.
export function calculateCommission(i: CommissionInputs): CommissionOutputs {
  const effective_overhead_cents = Math.min(i.overhead_cents, i.overhead_cap_cents);
  const net_profit_cents = Math.max(
    0,
    i.contract_cents -
      i.material_cents -
      i.labor_cents -
      effective_overhead_cents -
      i.supplement_fee_cents -
      i.other_cents
  );
  const payout_cents = Math.round((net_profit_cents * i.share_pct) / 100);
  return { effective_overhead_cents, net_profit_cents, payout_cents };
}

// Margin targets surfaced in the spec (§4.8). Returns a status tag the
// UI uses to flag job P&L rows.
export type MarginStatus = 'healthy' | 'watch' | 'outlier';

export function marginStatus(
  contract_cents: number,
  material_cents: number,
  labor_cents: number
): MarginStatus {
  if (contract_cents <= 0) return 'watch';
  const ratio = (material_cents + labor_cents) / contract_cents;
  if (ratio > 0.6) return 'outlier';
  if (ratio > 0.55) return 'watch';
  return 'healthy';
}

// Break-even tracker thresholds from the spec.
export const JOB_THROUGHPUT = {
  breakEvenPerMonth: 2.2,
  healthyGrowthPerMonth: 4.88,
  millionDollarTargetPerMonth: 20.3
};

export function throughputTier(jobsPerMonth: number): 'below' | 'break_even' | 'growth' | 'target' {
  if (jobsPerMonth < JOB_THROUGHPUT.breakEvenPerMonth) return 'below';
  if (jobsPerMonth < JOB_THROUGHPUT.healthyGrowthPerMonth) return 'break_even';
  if (jobsPerMonth < JOB_THROUGHPUT.millionDollarTargetPerMonth) return 'growth';
  return 'target';
}
