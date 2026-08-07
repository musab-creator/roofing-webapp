// Email parser integration stub (Phase 2 Critical).
//
// TODO: integration — runs as a Supabase Edge Function triggered by a
// Gmail push subscription or IMAP watcher. Parses Tony Cisneros daily
// sheets and SAM Delivery notifications into lead rows.

import type { LeadInsert } from '../../types/crm_types';

export type ParsedEmail = {
  vendor: 'tony' | 'sam' | 'unknown';
  leads: LeadInsert[];
};

export async function parseTonySheet(_body: string): Promise<LeadInsert[]> {
  return [];
}

export async function parseSamDelivery(_body: string): Promise<LeadInsert[]> {
  return [];
}

export async function routeIncomingEmail(_subject: string, _body: string): Promise<ParsedEmail> {
  return { vendor: 'unknown', leads: [] };
}
