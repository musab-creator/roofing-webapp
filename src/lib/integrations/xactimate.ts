// Xactimate ESX integration stub (Phase 4b).
//
// TODO: integration — real implementation needs sample .esx files from
// Musab. ESX is a proprietary Verisk format. Once the SDK access is
// sorted, replace these functions with real parsing + generation.

import type { SupplementLineItem } from '../../types/crm_types';

export type ParsedEsx = {
  claim_number?: string;
  carrier_name?: string;
  adjuster_name?: string;
  adjuster_email?: string;
  loss_date?: string;
  acv_cents?: number;
  rcv_cents?: number;
  recoverable_depreciation_cents?: number;
  line_items: {
    xactimate_code?: string;
    description: string;
    qty: number;
    unit?: string;
    rate_cents: number;
    amount_cents: number;
  }[];
};

export async function parseEsxFile(_file: File): Promise<ParsedEsx> {
  // TODO: integration — wire up Verisk ESX parser here.
  return { line_items: [] };
}

export async function exportSupplementAsEsx(
  _lineItems: SupplementLineItem[]
): Promise<Blob> {
  // TODO: integration — build compliant ESX payload.
  return new Blob([], { type: 'application/octet-stream' });
}
