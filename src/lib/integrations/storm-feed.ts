// Storm feed integration stub (Phase 2 High).
//
// TODO: integration — CoreLogic MapAlerts or equivalent. Feed recent
// hail/wind events to drive canvassing targets by zip code.

export type StormEvent = {
  id: string;
  type: 'hail' | 'wind' | 'tornado';
  severity: 'minor' | 'moderate' | 'severe';
  occurred_at: string;
  zip_codes: string[];
};

export async function fetchRecentStormEvents(_sinceIso?: string): Promise<StormEvent[]> {
  return [];
}
