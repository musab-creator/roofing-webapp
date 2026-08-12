import {
  SupplementEstimate,
  SupplementLineItem,
  EstimateSettings,
  LineItemTotals,
  EstimateTotals,
  GroupTotals,
  RoofMeasurements,
  ClaimInfo,
  CatalogItem,
  CategoryCode,
  PriceListId,
  CategoryRecapRow,
  RoomRecapRow
} from '../types/supplement_types';
import {
  SUPPLEMENT_CATALOG,
  DEFAULT_PRICE_LIST,
  PRICE_LISTS,
  findCatalogItem,
  priceFor
} from '../data/supplement-catalog';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// ---------------------------------------------------------
// Line-level math.
//
// Matches how the issued estimates compute:
//   itemTotal = qty x unitPrice
//   tax       = itemTotal x materialRatio x taxRate
//   O&P       = (itemTotal + tax) x (overhead% + profit%)
//   RCV       = itemTotal + tax + O&P
// ---------------------------------------------------------

export function calcLineItemTotals(
  item: SupplementLineItem,
  settings: EstimateSettings
): LineItemTotals {
  if (item.bidItem) {
    return { itemTotal: 0, tax: 0, oAndP: 0, rcv: 0, depreciation: 0, acv: 0 };
  }
  const itemTotal = round2(item.quantity * item.unitPrice);
  const tax = round2(itemTotal * (item.materialRatio ?? 0) * (settings.salesTaxPct / 100));
  const opRate = settings.applyOAndP
    ? (settings.overheadPct + settings.profitPct) / 100
    : 0;
  const oAndP = round2((itemTotal + tax) * opRate);
  const rcv = round2(itemTotal + tax + oAndP);
  const depreciation = item.nonDepreciable
    ? 0
    : round2(rcv * (Math.min(Math.max(item.depreciationPct, 0), 100) / 100));
  const acv = round2(rcv - depreciation);
  return { itemTotal, tax, oAndP, rcv, depreciation, acv };
}

function emptyGroupTotals(name: string): GroupTotals {
  return { name, tax: 0, oAndP: 0, rcv: 0, depreciation: 0, acv: 0, itemTotal: 0 };
}

function addToGroup(group: GroupTotals, t: LineItemTotals): void {
  group.itemTotal = round2(group.itemTotal + t.itemTotal);
  group.tax = round2(group.tax + t.tax);
  group.oAndP = round2(group.oAndP + t.oAndP);
  group.rcv = round2(group.rcv + t.rcv);
  group.depreciation = round2(group.depreciation + t.depreciation);
  group.acv = round2(group.acv + t.acv);
}

export const LABOR_MINIMUM_SECTION = 'Labor Minimums Applied';

export function roomKey(area: string, room: string): string {
  return `${area}||${room}`;
}

export function calcEstimateTotals(
  lineItems: SupplementLineItem[],
  settings: EstimateSettings
): EstimateTotals {
  let lineItemTotal = 0;
  let salesTax = 0;
  let overhead = 0;
  let profit = 0;
  let totalDepreciation = 0;

  const roomTotals = new Map<string, GroupTotals>();
  const areaTotals = new Map<string, GroupTotals>();
  const categoryTotals = new Map<string, number>();

  const opSplit =
    settings.overheadPct + settings.profitPct > 0
      ? settings.overheadPct / (settings.overheadPct + settings.profitPct)
      : 0.5;

  for (const item of lineItems) {
    const t = calcLineItemTotals(item, settings);
    lineItemTotal = round2(lineItemTotal + t.itemTotal);
    salesTax = round2(salesTax + t.tax);
    overhead = round2(overhead + t.oAndP * opSplit);
    profit = round2(profit + t.oAndP * (1 - opSplit));
    totalDepreciation = round2(totalDepreciation + t.depreciation);

    const area = item.laborMinimum ? LABOR_MINIMUM_SECTION : item.area || 'Exterior';
    const room = item.laborMinimum ? LABOR_MINIMUM_SECTION : item.room || 'Dwelling Roof';

    const rKey = roomKey(area, room);
    if (!roomTotals.has(rKey)) roomTotals.set(rKey, emptyGroupTotals(room));
    addToGroup(roomTotals.get(rKey)!, t);

    if (!areaTotals.has(area)) areaTotals.set(area, emptyGroupTotals(area));
    addToGroup(areaTotals.get(area)!, t);

    // Recap by category: R&R lines split their removal share into demolition.
    if (t.itemTotal > 0) {
      if (item.allDemo) {
        const key: CategoryCode = 'GENERAL DEMOLITION';
        categoryTotals.set(key, round2((categoryTotals.get(key) ?? 0) + t.itemTotal));
      } else {
        const demoShare = round2(t.itemTotal * (item.demoRatio ?? 0));
        const ownShare = round2(t.itemTotal - demoShare);
        categoryTotals.set(
          item.category,
          round2((categoryTotals.get(item.category) ?? 0) + ownShare)
        );
        if (demoShare > 0) {
          categoryTotals.set(
            'GENERAL DEMOLITION',
            round2((categoryTotals.get('GENERAL DEMOLITION') ?? 0) + demoShare)
          );
        }
      }
    }
  }

  const subtotal = round2(lineItemTotal + salesTax);
  const rcv = round2(subtotal + overhead + profit);

  // Depreciation on the O&P attached to depreciable lines is already
  // included, because depreciation is taken on each line's full RCV.
  const acv = round2(rcv - totalDepreciation);

  const categoryRecap: CategoryRecapRow[] = Array.from(categoryTotals.entries())
    .map(([category, total]) => ({
      category,
      total,
      pctOfTotal: rcv > 0 ? round2((total / rcv) * 100) : 0
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const roomRecap: RoomRecapRow[] = Array.from(roomTotals.entries())
    .map(([key, group]) => {
      const [area, room] = key.split('||');
      return {
        area,
        room,
        itemTotal: group.itemTotal,
        pctOfTotal: lineItemTotal > 0 ? round2((group.itemTotal / lineItemTotal) * 100) : 0
      };
    })
    .filter((r) => r.itemTotal !== 0);

  return {
    lineItemTotal,
    salesTax,
    subtotal,
    overhead,
    profit,
    rcv,
    totalDepreciation,
    acv,
    deductible: settings.deductible,
    netClaim: round2(acv - settings.deductible),
    netClaimIfRecovered: round2(rcv - settings.deductible),
    categoryRecap,
    roomRecap,
    roomTotals,
    areaTotals
  };
}

// ---------------------------------------------------------
// Depreciation helper: age / useful life, capped.
// ---------------------------------------------------------

export function ageBasedDepreciationPct(
  ageYears: number,
  lifeYears?: number,
  capPct = 80
): number {
  if (!lifeYears || lifeYears <= 0 || ageYears <= 0) return 0;
  return round2(Math.min((ageYears / lifeYears) * 100, capPct));
}

// ---------------------------------------------------------
// Roof report parsing.
//
// Handles both report styles in use:
//  - Roofr: "Total eaves 188ft 7in", "Hips + ridges 150ft 3in"
//  - QuickMeasure: "Eaves 184 ft", "Ridges/Hips 144 ft"
// ---------------------------------------------------------

/** Parses "188ft 7in", "188' 7\"", "188.5", "184 ft" into feet. */
function parseFeet(raw: string): number | undefined {
  const s = raw.trim();
  const ftIn = s.match(/(-?[\d,]+(?:\.\d+)?)\s*(?:ft|')\s*(?:([\d.]+)\s*(?:in|"))?/i);
  if (ftIn) {
    const feet = parseFloat(ftIn[1].replace(/,/g, ''));
    const inches = ftIn[2] ? parseFloat(ftIn[2]) : 0;
    if (!Number.isNaN(feet)) return round2(feet + inches / 12);
  }
  const plain = s.match(/(-?[\d,]+(?:\.\d+)?)/);
  if (plain) {
    const v = parseFloat(plain[1].replace(/,/g, ''));
    if (!Number.isNaN(v)) return v;
  }
  return undefined;
}

/**
 * Finds a labelled measurement. The label may be followed by a colon,
 * equals sign, or just whitespace, and the value may carry ft/in units.
 */
function findMeasure(text: string, labels: string[]): number | undefined {
  for (const label of labels) {
    const re = new RegExp(
      `${label}\\s*[:=]?\\s*((?:[\\d,]+(?:\\.\\d+)?)\\s*(?:ft|')?\\s*(?:[\\d.]+\\s*(?:in|")?)?)`,
      'i'
    );
    const m = text.match(re);
    if (m && m[1]) {
      const val = parseFeet(m[1]);
      if (val !== undefined) return val;
    }
  }
  return undefined;
}

function findCount(text: string, labels: string[]): number | undefined {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:=]?\\s*([\\d,]+)`, 'i');
    const m = text.match(re);
    if (m && m[1]) {
      const v = parseInt(m[1].replace(/,/g, ''), 10);
      if (!Number.isNaN(v)) return v;
    }
  }
  return undefined;
}

export function parseRoofReport(raw: string): Partial<RoofMeasurements> {
  const text = raw.replace(/\r/g, '');
  const out: Partial<RoofMeasurements> = {};

  out.totalRoofAreaSqFt = findMeasure(text, [
    'total roof area',
    'roof area',
    'total area'
  ]);
  out.pitchedAreaSqFt = findMeasure(text, [
    'total pitched area',
    'pitched roof area',
    'pitched area'
  ]);
  out.flatAreaSqFt = findMeasure(text, ['total flat area', 'flat roof area', 'flat area']);

  out.eaveLf = findMeasure(text, ['total eaves', 'eaves']);
  out.rakeLf = findMeasure(text, ['total rakes', 'rakes']);
  out.ridgeLf = findMeasure(text, ['total ridges', 'ridges']);
  out.hipLf = findMeasure(text, ['total hips', 'hips']);
  out.valleyLf = findMeasure(text, ['total valleys', 'valleys']);
  out.wallFlashingLf = findMeasure(text, [
    'total wall flashing',
    'wall flashing',
    'flashing'
  ]);
  out.stepFlashingLf = findMeasure(text, ['total step flashing', 'step flashing', 'step']);
  out.transitionsLf = findMeasure(text, ['total transitions', 'transitions']);
  out.dripEdgeLf = findMeasure(text, ['drip edge']);
  out.starterLf = findMeasure(text, ['starter']);
  out.ridgeCapLf = findMeasure(text, ['ridge cap']);

  // Combined figures the reports print directly; prefer them when present.
  const hipsPlusRidges = findMeasure(text, ['hips \\+ ridges', 'ridges/hips', 'ridges / hips']);
  if (hipsPlusRidges !== undefined) out.ridgeCapLf = hipsPlusRidges;
  const eavesPlusRakes = findMeasure(text, ['eaves \\+ rakes']);
  if (eavesPlusRakes !== undefined) {
    out.starterLf = eavesPlusRakes;
    if (out.dripEdgeLf === undefined) out.dripEdgeLf = eavesPlusRakes;
  }

  out.facets = findCount(text, ['total roof facets', 'roof facets', 'facets']);
  out.stories = findCount(text, ['number of stories', 'stories']);

  const pitch =
    text.match(/predominant\s*pitch[^0-9]*(\d{1,2}\s*\/\s*12)/i) ||
    text.match(/predominant\s*pitch[^0-9]*(\d{1,2})\b/i) ||
    text.match(/pitch\s*[:=]?\s*(\d{1,2}\s*\/\s*12)/i);
  if (pitch) {
    const p = pitch[1].replace(/\s/g, '');
    out.predominantPitch = p.includes('/') ? p : `${p}/12`;
  }

  if (/roofr/i.test(text)) out.reportSource = 'Roofr Roof Report';
  else if (/quickmeasure/i.test(text)) out.reportSource = 'Source - QuickMeasure Roof Report';
  else if (/eagleview/i.test(text)) out.reportSource = 'EagleView Roof Report';

  // Derive missing combined values from their parts.
  if (out.ridgeCapLf === undefined && (out.ridgeLf || out.hipLf)) {
    out.ridgeCapLf = round2((out.ridgeLf ?? 0) + (out.hipLf ?? 0));
  }
  if (out.starterLf === undefined && (out.eaveLf || out.rakeLf)) {
    out.starterLf = round2((out.eaveLf ?? 0) + (out.rakeLf ?? 0));
  }
  if (out.dripEdgeLf === undefined && out.starterLf !== undefined) {
    out.dripEdgeLf = out.starterLf;
  }
  if (
    out.totalRoofAreaSqFt === undefined &&
    (out.pitchedAreaSqFt !== undefined || out.flatAreaSqFt !== undefined)
  ) {
    out.totalRoofAreaSqFt = round2((out.pitchedAreaSqFt ?? 0) + (out.flatAreaSqFt ?? 0));
  }

  // Drop obvious mis-reads.
  for (const key of Object.keys(out) as Array<keyof RoofMeasurements>) {
    const v = out[key];
    if (typeof v === 'number' && (Number.isNaN(v) || v < 0)) delete out[key];
  }
  return out;
}

// ---------------------------------------------------------
// Line item construction.
// ---------------------------------------------------------

let idCounter = 0;
export function newLineItemId(): string {
  idCounter += 1;
  return `li-${Date.now().toString(36)}-${idCounter}`;
}

export function lineItemFromCatalog(
  entry: CatalogItem,
  quantity: number,
  priceList: PriceListId,
  placement?: { area?: string; room?: string; group?: string },
  noteOverride?: string
): SupplementLineItem {
  return {
    id: newLineItemId(),
    code: entry.code,
    category: entry.category,
    description: entry.description,
    quantity: round2(quantity),
    unit: entry.unit,
    unitPrice: priceFor(entry, priceList),
    materialRatio: entry.materialRatio,
    demoRatio: entry.demoRatio ?? 0,
    allDemo: !!entry.allDemo,
    depreciationPct: 0,
    nonDepreciable: !!entry.nonDepreciable,
    note: noteOverride ?? entry.defaultNote,
    area: placement?.area ?? 'Exterior',
    room: placement?.room ?? 'Dwelling Roof',
    group: placement?.group ?? entry.group,
    laborMinimum: entry.laborMinimum
  };
}

function pitchRise(pitch?: string): number {
  if (!pitch) return 0;
  const m = pitch.match(/^(\d{1,2})\s*\/\s*12$/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Builds the standard roof replacement scope from measurements,
 * following the quantity rules used on the issued estimates:
 *
 *  - tear off / re-nail / underlayment: measured area, no waste
 *  - shingles: measured area plus the waste factor
 *  - starter and drip edge: eaves + rakes
 *  - ridge cap: hips + ridges
 *  - ice & water: 3 ft of coverage per LF of valley
 *  - sealant: same run as the drip edge
 */
export function generateScopeFromMeasurements(
  m: RoofMeasurements,
  priceList: PriceListId = DEFAULT_PRICE_LIST,
  options?: { area?: string; room?: string; fullDeckMembrane?: boolean }
): SupplementLineItem[] {
  const items: SupplementLineItem[] = [];
  const area = m.totalRoofAreaSqFt ?? 0;
  if (area <= 0) return items;

  const place = {
    area: options?.area ?? 'Exterior',
    room: options?.room ?? 'Dwelling Roof'
  };
  const squares = area / 100;
  const wastedSquares = squares * (1 + (m.wastePct ?? 10) / 100);

  const add = (code: string, qty: number, note?: string) => {
    const entry = findCatalogItem(code);
    if (!entry || !(qty > 0)) return;
    items.push(lineItemFromCatalog(entry, qty, priceList, place, note));
  };

  add('RFG_TEAROFF_LAM', squares);
  add('RFG_RENAIL', area);
  add('RFG_FELT_30', squares);
  if (options?.fullDeckMembrane) {
    add('RFG_WATER_BARRIER_FULL', area);
  } else {
    add('RFG_SEAM_TAPE', area);
  }

  const starter = m.starterLf ?? round2((m.eaveLf ?? 0) + (m.rakeLf ?? 0));
  add('RFG_STARTER', starter);

  if (m.valleyLf && m.valleyLf > 0) {
    add('RFG_ICE_WATER', round2(m.valleyLf * 3));
  }

  add(
    'RFG_SHINGLE_LAM',
    wastedSquares,
    `${m.wastePct}% wastage included per roof report due to roof size and complexity.`
  );

  const ridgeCap = m.ridgeCapLf ?? round2((m.ridgeLf ?? 0) + (m.hipLf ?? 0));
  add('RFG_RIDGE_CAP', ridgeCap);

  const dripEdge = m.dripEdgeLf ?? starter;
  add('RFG_DRIP_EDGE', dripEdge);
  add('RFG_SEALANT_LF', dripEdge);

  if (m.pipeJacks) add('RFG_PIPE_JACK', m.pipeJacks);
  if (m.pipeJacks) add('PNT_ROOF_JACK', m.pipeJacks);
  if (m.chimneys) add('RFG_CHIMNEY_FLASHING', m.chimneys);
  if (m.offRidgeVents) add('RFG_VENT_OFF_RIDGE_4', m.offRidgeVents);
  if (m.ridgeVentLf) add('RFG_RIDGE_VENT', m.ridgeVentLf);
  if (m.exhaustCaps) add('RFG_EXHAUST_CAP_4', m.exhaustCaps);
  if (m.exhaustCaps || m.offRidgeVents) {
    add('PNT_ROOF_VENT', (m.exhaustCaps ?? 0) + (m.offRidgeVents ?? 0));
  }
  if (m.pipeJacks) add('RFG_MASTIC_VENT', m.pipeJacks);
  if (m.wallFlashingLf) add('RFG_SIDEWALL_FLASHING', m.wallFlashingLf);
  if (m.stepFlashingLf) add('RFG_STEP_FLASHING', m.stepFlashingLf);
  if (m.skylights) add('RFG_SKYLIGHT_FIXED', m.skylights);
  if (m.satelliteDishes) add('RFG_SATELLITE_DR', m.satelliteDishes);

  const rise = pitchRise(m.predominantPitch);
  if (rise >= 10) add('RFG_STEEP_10_12', squares, `Steep charge — ${m.predominantPitch} pitch`);
  else if (rise >= 7) add('RFG_STEEP_7_9', squares, `Steep charge — ${m.predominantPitch} pitch`);
  if ((m.stories ?? 1) >= 2) {
    add('RFG_HIGH_ROOF', squares, `${m.stories}-story access`);
  }

  add('DBR_HAUL_TRUCK', Math.max(1, Math.ceil(squares / 30)));

  return items;
}

// ---------------------------------------------------------
// Estimate name slug, e.g. "Corrine Mulligan" -> CORRINE-MULLIGAN
// ---------------------------------------------------------

export function toEstimateName(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ---------------------------------------------------------
// Defaults and persistence.
// ---------------------------------------------------------

const STORAGE_KEY = 'tra-supplement-estimates-v2';

export function defaultClaimInfo(): ClaimInfo {
  return {
    insuredName: '',
    insuredHomePhone: '',
    insuredCellPhone: '',
    insuredEmail: '',
    mailingAddress: '',
    mailingCityStateZip: '',
    propertyAddress: '',
    propertyCityStateZip: '',
    claimNumber: '',
    policyNumber: '',
    typeOfLoss: 'Wind Damage',
    dateOfLoss: '',
    dateContacted: '',
    dateReceived: '',
    dateInspected: '',
    dateEntered: '',
    priceList: DEFAULT_PRICE_LIST,
    laborEfficiency: 'Restoration/Service/Remodel',
    estimator: 'Diversity Roofing',
    businessPhone: '(904) 979-0556',
    operator: '',
    estimateName: ''
  };
}

export function defaultMeasurements(): RoofMeasurements {
  return { wastePct: 15 };
}

export function defaultSettings(): EstimateSettings {
  const list = PRICE_LISTS.find((p) => p.id === DEFAULT_PRICE_LIST);
  return {
    salesTaxPct: list?.defaultSalesTaxPct ?? 7,
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

export { SUPPLEMENT_CATALOG, priceFor, findCatalogItem };
