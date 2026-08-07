// Lead value scoring heuristic.
// Inputs are optional because intake from Tony / SAM often ships with
// partial data. Score is 0-100.

export type LeadScoreInputs = {
  home_value_cents?: number | null;
  roof_age_years?: number | null;
  story_count?: number | null;
  has_carrier?: boolean;
  in_territory?: boolean;
};

export function scoreLead(i: LeadScoreInputs): number {
  let score = 30; // base so a brand-new lead is not zero

  if (i.home_value_cents != null) {
    const dollars = i.home_value_cents / 100;
    if (dollars >= 750_000) score += 25;
    else if (dollars >= 500_000) score += 18;
    else if (dollars >= 300_000) score += 12;
    else if (dollars >= 150_000) score += 6;
  }

  if (i.roof_age_years != null) {
    if (i.roof_age_years >= 20) score += 20;
    else if (i.roof_age_years >= 15) score += 14;
    else if (i.roof_age_years >= 10) score += 8;
  }

  if (i.story_count === 1) score += 5;
  if (i.has_carrier) score += 10;
  if (i.in_territory) score += 10;

  return Math.max(0, Math.min(100, score));
}
