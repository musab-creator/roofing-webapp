import {
  SupplementLineItem,
  SupplementEstimate,
  EstimateSettings,
  LineItemTotals,
  EstimateTotals,
  RoofMeasurements,
  ClaimInfo,
  CatalogItem
} from '../types/supplement_types';
import { SUPPLEMENT_CATALOG, TRADE_NAMES, catalogKey } from '../data/supplement-catalog';

// ---------------------------------------------------------
// Money math — round at the line level like estimate software
// ---------------------------------------------------------

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcLineItemTotals(
  item: SupplementLineItem,
  settings: EstimateSettings
): LineItemTotals {
  const itemTotal = round2(item.quantity * item.unitPrice);
  const taxableBase = itemTotal * (item.materialRatio ?? 0);
  const tax = round2(taxableBase * (settings.salesTaxPct / 100));
  const rcv = round2(itemTotal + tax);
  const depreciation = item.nonDepreciable
    ? 0
    : round2(rcv * (Math.min(Math.max(item.depreciationPct, 0), 100) / 100));
  const acv = round2(rcv - depreciation);
  return { itemTotal, tax, rcv, depreciation, acv };
}

export function calcEstimateTotals(
  lineItems: SupplementLineItem[],
  settings: EstimateSettings
): EstimateTotals {
  let lineItemSubtotal = 0;
  let salesTax = 0;
  let totalDepreciation = 0;
  const byTrade = new Map<string, number>();

  for (const item of lineItems) {
    const t = calcLineItemTotals(item, settings);
    lineItemSubtotal = round2(lineItemSubtotal + t.itemTotal);
    salesTax = round2(salesTax + t.tax);
    totalDepreciation = round2(totalDepreciation + t.depreciation);
    byTrade.set(item.cat, round2((byTrade.get(item.cat) ?? 0) + t.rcv));
  }

  const subtotalWithTax = round2(lineItemSubtotal + salesTax);
  const overhead = settings.applyOAndP ? round2(subtotalWithTax * (settings.overheadPct / 100)) : 0;
  const profit = settings.applyOAndP ? round2(subtotalWithTax * (settings.profitPct / 100)) : 0;
  const rcv = round2(subtotalWithTax + overhead + profit);

  // O&P depreciates proportionally with the depreciable share of the estimate
  const opDepreciation =
    settings.applyOAndP && subtotalWithTax > 0
      ? round2((overhead + profit) * (totalDepreciation / subtotalWithTax))
      : 0;
  const totalDepWithOp = round2(totalDepreciation + opDepreciation);
  const acv = round2(rcv - totalDepWithOp);

  const tradeRecap = Array.from(byTrade.entries())
    .map(([cat, tradeRcv]) => ({
      cat,
      trade: TRADE_NAMES[cat] ?? cat,
      rcv: tradeRcv,
      pctOfTotal: subtotalWithTax > 0 ? round2((tradeRcv / subtotalWithTax) * 100) : 0
    }))
    .sort((a, b) => b.rcv - a.rcv);

  return {
    lineItemSubtotal,
    salesTax,
    subtotalWithTax,
    overhead,
    profit,
    rcv,
    totalDepreciation: totalDepWithOp,
    acv,
    deductible: settings.deductible,
    netClaimIfRecoverable: round2(rcv - settings.deductible),
    netClaimAcv: round2(acv - settings.deductible),
    tradeRecap
  };
}

// ---------------------------------------------------------
// Age-based depreciation helper: pct = min(age/life, cap) * 100
// ---------------------------------------------------------

export function ageBasedDepreciationPct(ageYears: number, lifeYears?: number, capPct = 80): number {
  if (!lifeYears || lifeYears <= 0 || ageYears <= 0) return 0;
  return round2(Math.min((ageYears / lifeYears) * 100, capPct));
}

// ---------------------------------------------------------
// Roof report parsing — paste raw text from an EagleView /
// Hover / GAF QuickMeasure style report and pull the numbers.
// ---------------------------------------------------------

function matchNumber(text: string, patterns: RegExp[]): number | undefined {
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (!Number.isNaN(val)) return val;
    }
  }
  return undefined;
}

export function parseRoofReport(raw: string): Partial<RoofMeasurements> {
  const text = raw.replace(/\r/g, '');
  const out: Partial<RoofMeasurements> = {};

  out.totalRoofAreaSqFt = matchNumber(text, [
    /total\s*(?:roof\s*)?area[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sf|square\s*feet)?/i,
    /roof\s*area\s*[:=]?\s*([\d,]+(?:\.\d+)?)/i
  ]);
  // Reports that give squares instead of sq ft
  if (!out.totalRoofAreaSqFt) {
    const squares = matchNumber(text, [/(?:total\s*)?squares?\s*[:=]?\s*([\d,]+(?:\.\d+)?)/i]);
    if (squares && squares < 500) out.totalRoofAreaSqFt = round2(squares * 100);
  }

  out.ridgeLf = matchNumber(text, [
    /(?:total\s*)?ridges?(?:\s*\/\s*hips?)?\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i,
    /ridges?\s*[:=]\s*([\d,]+(?:\.\d+)?)/i
  ]);
  out.hipLf = matchNumber(text, [
    /(?:total\s*)?hips?\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i,
    /hips?\s*[:=]\s*([\d,]+(?:\.\d+)?)/i
  ]);
  out.valleyLf = matchNumber(text, [
    /(?:total\s*)?valleys?\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i,
    /valleys?\s*[:=]\s*([\d,]+(?:\.\d+)?)/i
  ]);
  out.eaveLf = matchNumber(text, [
    /(?:total\s*)?eaves?\s*(?:\/\s*starter)?\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i,
    /eaves?\s*[:=]\s*([\d,]+(?:\.\d+)?)/i
  ]);
  out.rakeLf = matchNumber(text, [
    /(?:total\s*)?rakes?\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i,
    /rakes?\s*[:=]\s*([\d,]+(?:\.\d+)?)/i
  ]);
  out.stepFlashingLf = matchNumber(text, [
    /step\s*flashing\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i
  ]);
  out.wallFlashingLf = matchNumber(text, [
    /(?:wall|head\s*wall)\s*flashing\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i
  ]);
  out.dripEdgeLf = matchNumber(text, [
    /drip\s*edge\s*(?:length)?[^0-9\-]*([\d,]+(?:\.\d+)?)\s*(?:ft|lf|')/i
  ]);

  const pitch = text.match(/(?:predominant|primary)\s*pitch[^0-9]*([\d]{1,2}\s*\/\s*12)/i) ||
    text.match(/pitch\s*[:=]?\s*([\d]{1,2}\s*\/\s*12)/i);
  if (pitch) out.predominantPitch = pitch[1].replace(/\s/g, '');

  const stories = matchNumber(text, [/(?:number\s*of\s*)?stories\s*[:=]?\s*(\d+)/i]);
  if (stories) out.stories = stories;

  const facets = matchNumber(text, [/(?:total\s*)?facets?\s*[:=]?\s*(\d+)/i]);
  if (facets) out.facets = facets;

  const pens = matchNumber(text, [/penetrations?\s*[:=]?\s*(\d+)/i]);
  if (pens) out.penetrations = pens;

  return out;
}

// ---------------------------------------------------------
// Auto-generate a full replacement scope from measurements
// ---------------------------------------------------------

let idCounter = 0;
export function newLineItemId(): string {
  idCounter += 1;
  return `li-${Date.now().toString(36)}-${idCounter}`;
}

export function lineItemFromCatalog(
  entry: CatalogItem,
  quantity: number,
  groupName = 'Roof',
  note?: string
): SupplementLineItem {
  return {
    id: newLineItemId(),
    cat: entry.cat,
    sel: entry.sel,
    activity: /^remove/i.test(entry.description)
      ? 'remove'
      : /detach\s*&\s*reset/i.test(entry.description)
        ? 'detach_reset'
        : 'replace',
    description: entry.description,
    quantity: round2(quantity),
    unit: entry.unit,
    unitPrice: entry.unitPrice,
    depreciationPct: 0,
    nonDepreciable: !!entry.nonDepreciable,
    materialRatio: entry.materialRatio ?? 0,
    note,
    groupName
  };
}

function findCatalog(cat: string, sel: string): CatalogItem {
  const found = SUPPLEMENT_CATALOG.find((c) => c.cat === cat && c.sel === sel);
  if (!found) throw new Error(`Catalog item not found: ${cat} ${sel}`);
  return found;
}

function pitchRise(pitch?: string): number {
  if (!pitch) return 0;
  const m = pitch.match(/^(\d{1,2})\s*\/\s*12$/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Builds a standard full-replacement laminated shingle scope from roof
 * measurements, mirroring how a wind/hail supplement is typically written.
 */
export function generateScopeFromMeasurements(m: RoofMeasurements): SupplementLineItem[] {
  const items: SupplementLineItem[] = [];
  const area = m.totalRoofAreaSqFt ?? 0;
  if (area <= 0) return items;

  const squares = area / 100;
  const wasteMult = 1 + (m.wastePct ?? 10) / 100;
  const squaresWithWaste = squares * wasteMult;

  items.push(
    lineItemFromCatalog(findCatalog('RFG', '240'), squares, 'Roof', 'Tear off measured roof area (no waste on removal)')
  );
  items.push(
    lineItemFromCatalog(
      findCatalog('RFG', '240E'),
      squaresWithWaste,
      'Roof',
      `Measured ${squares.toFixed(2)} SQ + ${m.wastePct}% waste`
    )
  );
  items.push(lineItemFromCatalog(findCatalog('RFG', 'SYNFELT'), squaresWithWaste, 'Roof'));

  if (m.valleyLf && m.valleyLf > 0) {
    // Ice & water shield in valleys: 6 ft wide coverage per LF of valley
    items.push(
      lineItemFromCatalog(findCatalog('RFG', 'IWS'), m.valleyLf * 6, 'Roof', 'Valleys — code-required ice & water barrier, 3 ft each side of centerline')
    );
  }

  const ridgeHip = (m.ridgeLf ?? 0) + (m.hipLf ?? 0);
  if (ridgeHip > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'RIDGC'), ridgeHip, 'Roof', 'Ridges and hips'));
  }

  const eaveRake = (m.eaveLf ?? 0) + (m.rakeLf ?? 0);
  if (eaveRake > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'STRTR'), eaveRake, 'Roof', 'Starter course at eaves and rakes'));
    items.push(
      lineItemFromCatalog(findCatalog('RFG', 'DRIP'), m.dripEdgeLf && m.dripEdgeLf > 0 ? m.dripEdgeLf : eaveRake, 'Roof', 'Drip edge at eaves and rakes — IRC R905.2.8.5')
    );
  }

  if (m.stepFlashingLf && m.stepFlashingLf > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'STEP'), m.stepFlashingLf, 'Roof', 'Sidewall step flashing — not reusable once shingles are removed'));
  }
  if (m.wallFlashingLf && m.wallFlashingLf > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'FLASH'), m.wallFlashingLf, 'Roof', 'Headwall/apron flashing'));
  }
  if (m.valleyLf && m.valleyLf > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'VALMTL'), m.valleyLf, 'Roof', 'Valley metal'));
  }
  if (m.pipeJacks && m.pipeJacks > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'FLPIPE'), m.pipeJacks, 'Roof', 'Pipe jack flashings — replaced with roof system'));
  }
  if (m.turtleVents && m.turtleVents > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'VENTT'), m.turtleVents, 'Roof'));
  }
  if (m.ridgeVentLf && m.ridgeVentLf > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'VENTR'), m.ridgeVentLf, 'Roof'));
  }
  if (m.chimneys && m.chimneys > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'FLCH'), m.chimneys, 'Roof', 'Chimney flashing — replaced with roof system'));
  }
  if (m.skylights && m.skylights > 0) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'SKY'), m.skylights, 'Roof', 'Skylight flashing kits'));
  }

  const rise = pitchRise(m.predominantPitch);
  if (rise >= 10) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'STEEP+'), squares, 'Roof', `Steep charge — ${m.predominantPitch} pitch`));
  } else if (rise >= 7) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'STEEP'), squares, 'Roof', `Steep charge — ${m.predominantPitch} pitch`));
  }
  if ((m.stories ?? 1) >= 2) {
    items.push(lineItemFromCatalog(findCatalog('RFG', 'HIGH'), squares, 'Roof', `${m.stories}-story access`));
  }

  // Debris: ~1 dumpster load per 30 squares of tear-off, minimum 1
  items.push(
    lineItemFromCatalog(findCatalog('DBR', 'DUMP'), Math.max(1, Math.ceil(squares / 30)), 'Debris Removal')
  );

  return items;
}

// ---------------------------------------------------------
// Persistence — localStorage-backed store of saved estimates
// ---------------------------------------------------------

const STORAGE_KEY = 'tra-supplement-estimates-v1';

export function defaultClaimInfo(): ClaimInfo {
  return {
    insuredName: '',
    propertyAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZip: '',
    insuranceCarrier: '',
    claimNumber: '',
    policyNumber: '',
    dateOfLoss: '',
    typeOfLoss: 'Hail',
    adjusterName: '',
    adjusterPhone: '',
    adjusterEmail: '',
    estimatorName: '',
    priceListLabel: ''
  };
}

export function defaultMeasurements(): RoofMeasurements {
  return { wastePct: 10 };
}

export function defaultSettings(): EstimateSettings {
  return {
    salesTaxPct: 8.25,
    overheadPct: 10,
    profitPct: 10,
    applyOAndP: true,
    recoverableDepreciation: true,
    deductible: 0
  };
}

export function newEstimate(): SupplementEstimate {
  const now = new Date().toISOString();
  return {
    id: `est-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    title: 'New Supplement Estimate',
    createdAt: now,
    updatedAt: now,
    claim: defaultClaimInfo(),
    measurements: defaultMeasurements(),
    settings: defaultSettings(),
    lineItems: []
  };
}

export function loadEstimates(): SupplementEstimate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEstimates(estimates: SupplementEstimate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
}

export function upsertEstimate(estimate: SupplementEstimate): SupplementEstimate[] {
  const all = loadEstimates();
  const idx = all.findIndex((e) => e.id === estimate.id);
  const updated = { ...estimate, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = updated;
  else all.unshift(updated);
  saveEstimates(all);
  return all;
}

export function deleteEstimate(id: string): SupplementEstimate[] {
  const all = loadEstimates().filter((e) => e.id !== id);
  saveEstimates(all);
  return all;
}

export { catalogKey };
