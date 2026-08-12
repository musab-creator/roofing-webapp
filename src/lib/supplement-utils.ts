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
  RoomRecapRow,
  AutoBuildResult
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

  const penetrations = findCount(text, ['total penetrations', 'penetrations']);
  if (penetrations !== undefined) out.penetrations = penetrations;

  // The report's own suggested/recommended waste table.
  const waste = parseWasteTable(text);
  if (waste) {
    out.wasteOptions = waste.options;
    out.wastePct = waste.recommended;
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

/**
 * Reads the suggested/recommended waste table a roof report prints and
 * returns the options plus the one to use.
 *
 * Both report styles present a row of percentages ordered from 0% up.
 * The middle option is the figure our issued estimates have used
 * (Roofr 0/10/12/15/17/20/22 -> 15%, QuickMeasure 0/6/9/11/13/16/21 -> 11%).
 */
export function parseWasteTable(
  raw: string
): { options: number[]; recommended: number } | undefined {
  const m = raw.match(
    /(?:suggested|recommended)\s*\n?\s*waste\s*%?\s*((?:\d{1,2}\s*%\s*){3,})/i
  );
  if (!m) return undefined;
  const options = Array.from(m[1].matchAll(/(\d{1,2})\s*%/g))
    .map((x) => parseInt(x[1], 10))
    .filter((n) => !Number.isNaN(n));
  if (options.length < 3) return undefined;
  const recommended = options[Math.floor(options.length / 2)];
  return { options, recommended };
}

/**
 * Shingles are ordered and billed in whole bundles, three to the square,
 * so the quantity rounds up to the next third of a square. This reproduces
 * the shingle quantity on every estimate checked.
 */
export function shingleSquares(areaSqFt: number, wastePct: number): number {
  const withWaste = (areaSqFt * (1 + wastePct / 100)) / 100;
  return round2(Math.ceil(withWaste * 3) / 3);
}

// ---------------------------------------------------------
// Regional code rules.
//
// The two states we estimate in require different secondary water
// barrier assemblies, and the Georgia estimates carry a 5% waste
// allowance on underlayment and perimeter metal that Florida does not.
// ---------------------------------------------------------

export interface RegionalRules {
  underlaymentWastePct: number;
  starterWastePct: number;
  dripEdgeWastePct: number;
  secondaryBarrier: 'seam_tape' | 'full_surface';
  valleyIceWater: boolean;
  renailNote: string;
  barrierNote: string;
}

export const REGIONAL_RULES: Record<PriceListId, RegionalRules> = {
  FLJA8X_JUN26: {
    underlaymentWastePct: 0,
    starterWastePct: 0,
    dripEdgeWastePct: 0,
    secondaryBarrier: 'seam_tape',
    valleyIceWater: true,
    renailNote: 'FL',
    barrierNote: 'FL'
  },
  GABR8X_FEB26: {
    underlaymentWastePct: 5,
    starterWastePct: 5,
    dripEdgeWastePct: 5,
    secondaryBarrier: 'full_surface',
    valleyIceWater: false,
    renailNote: 'GA',
    barrierNote: 'GA'
  }
};

const RENAIL_NOTE_GA =
  'Roof sheathing must be completely re-nailed per Georgia State Amendments to the IRC (R602.3 / R803.2) to meet current fastening requirements. Existing fasteners are disturbed and compromised during tear-off and reroof operations; therefore, full re-nailing of all roof deck panels is required to restore structural integrity, ensure proper uplift resistance, and achieve code compliance.';

/** Maps a two-letter state to the price list we estimate that state with. */
export function priceListForState(state: string): PriceListId | undefined {
  const s = state.trim().toUpperCase();
  if (s === 'FL') return 'FLJA8X_JUN26';
  if (s === 'GA') return 'GABR8X_FEB26';
  return undefined;
}

/** Pulls "1923 Sterling Lane, Fernandina Beach, FL 32034" out of report text. */
export function parsePropertyInfo(raw: string): {
  address?: string;
  cityStateZip?: string;
  state?: string;
} {
  const m = raw.match(
    /(\d+[^,\n]{2,60}?),\s*([A-Za-z .'-]{2,40}),\s*([A-Z]{2})\s*(\d{5})/
  );
  if (!m) return {};
  return {
    address: m[1].trim(),
    cityStateZip: `${m[2].trim()}, ${m[3]} ${m[4]}`,
    state: m[3]
  };
}

// ---------------------------------------------------------
// Adjuster report / claim summary parsing.
// ---------------------------------------------------------

function grabText(raw: string, labels: string[], stop = '\\n'): string | undefined {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:#]?\\s*([^${stop}]{2,80})`, 'i');
    const m = raw.match(re);
    if (m && m[1]) {
      const v = m[1].trim().replace(/\s{2,}/g, ' ');
      if (v && !/^[:#-]/.test(v)) return v;
    }
  }
  return undefined;
}

function grabMoney(raw: string, labels: string[]): number | undefined {
  for (const label of labels) {
    const re = new RegExp(`${label}[^0-9$]{0,20}\\$?\\s*([\\d,]+(?:\\.\\d{2})?)`, 'i');
    const m = raw.match(re);
    if (m && m[1]) {
      const v = parseFloat(m[1].replace(/,/g, ''));
      if (!Number.isNaN(v)) return v;
    }
  }
  return undefined;
}

function grabDate(raw: string, labels: string[]): string | undefined {
  for (const label of labels) {
    const re = new RegExp(
      `${label}\\s*[:]?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|[A-Z][a-z]+\\s+\\d{1,2},?\\s+\\d{4})`,
      'i'
    );
    const m = raw.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return undefined;
}

/**
 * Extracts claim facts from a pasted adjuster report, loss notice or
 * carrier estimate. Only fields actually found are returned, so nothing
 * is invented.
 */
export function parseAdjusterReport(raw: string): {
  claim: Partial<ClaimInfo>;
  deductible?: number;
} {
  const text = raw.replace(/\r/g, '');
  const claim: Partial<ClaimInfo> = {};

  const claimNumber = grabText(text, ['claim\\s*(?:number|no\\.?|#)', 'claim']);
  if (claimNumber && /[\d]/.test(claimNumber)) claim.claimNumber = claimNumber.split(/\s{2,}/)[0];

  const policyNumber = grabText(text, ['policy\\s*(?:number|no\\.?|#)', 'policy']);
  if (policyNumber && /[\d]/.test(policyNumber))
    claim.policyNumber = policyNumber.split(/\s{2,}/)[0];

  const insured = grabText(text, ['insured\\s*name', 'insured', 'policyholder', 'homeowner']);
  if (insured) {
    // Trim trailing phone numbers that share the header line.
    claim.insuredName = insured.replace(/\s*(?:home|cell(?:ular)?|phone).*$/i, '').trim();
    claim.estimateName = toEstimateName(claim.insuredName);
  }

  const lossType = grabText(text, ['type\\s*of\\s*loss', 'loss\\s*type', 'cause\\s*of\\s*loss']);
  if (lossType) claim.typeOfLoss = lossType;

  const dol = grabDate(text, ['date\\s*of\\s*loss', 'loss\\s*date', 'dol']);
  if (dol) claim.dateOfLoss = dol;
  const contacted = grabDate(text, ['date\\s*contacted']);
  if (contacted) claim.dateContacted = contacted;
  const received = grabDate(text, ['date\\s*received']);
  if (received) claim.dateReceived = received;
  const inspected = grabDate(text, ['date\\s*inspected', 'inspection\\s*date']);
  if (inspected) claim.dateInspected = inspected;

  const phone = text.match(/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/);
  if (phone) claim.insuredHomePhone = phone[0].trim();
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/);
  if (email && !/diversity-roofing/i.test(email[0])) claim.insuredEmail = email[0];

  const property = parsePropertyInfo(text);
  if (property.address) {
    claim.propertyAddress = property.address;
    claim.propertyCityStateZip = property.cityStateZip;
    const list = property.state ? priceListForState(property.state) : undefined;
    if (list) claim.priceList = list;
  }

  const deductible = grabMoney(text, ['deductible']);

  return { claim, deductible };
}

// ---------------------------------------------------------
// Automatic trade labor minimums.
//
// A trade whose work falls below its minimum charge gets a labor
// minimum line, the way the issued estimates carry them.
// ---------------------------------------------------------

export function autoLaborMinimums(
  items: SupplementLineItem[],
  priceList: PriceListId
): SupplementLineItem[] {
  const byCategory = new Map<string, number>();
  for (const item of items) {
    if (item.laborMinimum || item.bidItem) continue;
    byCategory.set(
      item.category,
      round2((byCategory.get(item.category) ?? 0) + item.quantity * item.unitPrice)
    );
  }

  const added: SupplementLineItem[] = [];
  for (const entry of SUPPLEMENT_CATALOG) {
    if (!entry.laborMinimum) continue;
    const tradeTotal = byCategory.get(entry.category);
    if (tradeTotal === undefined) continue; // trade not in the estimate
    const minimum = priceFor(entry, priceList);
    if (tradeTotal >= minimum) continue; // trade already above its minimum
    const alreadyPresent = items.some((i) => i.code === entry.code);
    if (alreadyPresent) continue;
    added.push(
      lineItemFromCatalog(entry, 1, priceList, {
        area: LABOR_MINIMUM_SECTION,
        room: LABOR_MINIMUM_SECTION
      })
    );
  }
  return added;
}

// ---------------------------------------------------------
// Date helpers matching the estimate header format.
// ---------------------------------------------------------

export function formatEstimateDateTime(d: Date = new Date()): string {
  const date = d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `${date} ${time}`;
}

export function formatEstimateDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
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
  const rules = REGIONAL_RULES[priceList] ?? REGIONAL_RULES[DEFAULT_PRICE_LIST];
  const squares = round2(area / 100);
  const wastePct = m.wastePct ?? 15;

  const add = (code: string, qty: number, note?: string) => {
    const entry = findCatalogItem(code);
    if (!entry || !(qty > 0)) return;
    items.push(lineItemFromCatalog(entry, qty, priceList, place, note));
  };

  add('RFG_TEAROFF_LAM', squares);

  const renail = findCatalogItem('RFG_RENAIL');
  if (renail) {
    items.push(
      lineItemFromCatalog(
        renail,
        area,
        priceList,
        place,
        rules.renailNote === 'GA' ? RENAIL_NOTE_GA : renail.defaultNote
      )
    );
  }

  add('RFG_FELT_30', round2(squares * (1 + rules.underlaymentWastePct / 100)));

  // Secondary water barrier assembly follows the state's code path.
  const useFullSurface =
    options?.fullDeckMembrane ?? rules.secondaryBarrier === 'full_surface';
  if (useFullSurface) {
    add('RFG_WATER_BARRIER_FULL', area);
  } else {
    add('RFG_SEAM_TAPE', area);
  }

  const starterBase = m.starterLf ?? round2((m.eaveLf ?? 0) + (m.rakeLf ?? 0));
  add('RFG_STARTER', round2(starterBase * (1 + rules.starterWastePct / 100)));

  if (rules.valleyIceWater && m.valleyLf && m.valleyLf > 0) {
    add('RFG_ICE_WATER', round2(m.valleyLf * 3));
  }

  const wasteJustification = m.wasteOptions?.length
    ? `${wastePct}% wastage included per roof report (report suggested ${m.wasteOptions
        .map((o) => `${o}%`)
        .join(' / ')}) due to roof size and complexity. Quantity rounded up to whole bundles.`
    : `${wastePct}% wastage included per roof report due to roof size and complexity. Quantity rounded up to whole bundles.`;
  add('RFG_SHINGLE_LAM', shingleSquares(area, wastePct), wasteJustification);

  const ridgeCap = m.ridgeCapLf ?? round2((m.ridgeLf ?? 0) + (m.hipLf ?? 0));
  add('RFG_RIDGE_CAP', ridgeCap);

  const dripEdgeBase = m.dripEdgeLf ?? starterBase;
  add('RFG_DRIP_EDGE', round2(dripEdgeBase * (1 + rules.dripEdgeWastePct / 100)));
  add('RFG_SEALANT_LF', dripEdgeBase);

  // Penetration count from the report seeds the pipe-jack quantity.
  const pipeJacks = m.pipeJacks ?? m.penetrations;
  if (pipeJacks) add('RFG_PIPE_JACK', pipeJacks);
  if (pipeJacks) add('PNT_ROOF_JACK', pipeJacks);
  if (m.chimneys) add('RFG_CHIMNEY_FLASHING', m.chimneys);
  if (m.offRidgeVents) add('RFG_VENT_OFF_RIDGE_4', m.offRidgeVents);
  if (m.ridgeVentLf) add('RFG_RIDGE_VENT', m.ridgeVentLf);
  if (m.exhaustCaps) add('RFG_EXHAUST_CAP_4', m.exhaustCaps);
  if (m.exhaustCaps || m.offRidgeVents) {
    add('PNT_ROOF_VENT', (m.exhaustCaps ?? 0) + (m.offRidgeVents ?? 0));
  }
  if (pipeJacks) add('RFG_MASTIC_VENT', pipeJacks);
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
// One-shot build: pasted reports in, complete estimate out.
// ---------------------------------------------------------

/**
 * Builds a complete, submittable estimate from a roof report and an
 * optional adjuster report, resolving everything that can be derived:
 * measurements, property and claim details, price list and tax rate for
 * the state, the code path for the secondary water barrier, the waste
 * factor from the report's own table, the full line-item scope with
 * justifications, and trade labor minimums.
 *
 * Returns what was resolved and what still needs a person, so nothing
 * is silently assumed.
 */
export function buildEstimateFromReports(
  roofReportText: string,
  adjusterReportText?: string,
  base?: SupplementEstimate
): AutoBuildResult {
  const resolved: string[] = [];
  const needsAttention: string[] = [];
  const estimate: SupplementEstimate = base ? { ...base } : newEstimate();
  estimate.claim = { ...estimate.claim };
  estimate.settings = { ...estimate.settings };

  // 1. Roof report -> measurements.
  const measurements = parseRoofReport(roofReportText);
  const measurementCount = Object.values(measurements).filter((v) => v !== undefined).length;
  estimate.measurements = { ...defaultMeasurements(), ...measurements };
  if (measurementCount > 0) {
    resolved.push(`${measurementCount} roof measurements read from the report`);
  } else {
    needsAttention.push('No measurements could be read — enter them by hand');
  }
  if (measurements.wasteOptions?.length) {
    resolved.push(
      `Waste set to ${estimate.measurements.wastePct}% from the report's suggested table (${measurements.wasteOptions
        .map((o) => `${o}%`)
        .join('/')})`
    );
  }

  // 2. Property location, from the adjuster report first, else the roof report.
  const adjuster = adjusterReportText ? parseAdjusterReport(adjusterReportText) : undefined;
  if (adjuster) {
    const claimFields = Object.entries(adjuster.claim).filter(([, v]) => v);
    estimate.claim = { ...estimate.claim, ...adjuster.claim };
    if (claimFields.length > 0) {
      resolved.push(
        `${claimFields.length} claim fields read from the adjuster report (${claimFields
          .map(([k]) => k.replace(/([A-Z])/g, ' $1').toLowerCase().trim())
          .join(', ')})`
      );
    }
    if (adjuster.deductible !== undefined) {
      estimate.settings.deductible = adjuster.deductible;
      resolved.push(`Deductible set to $${adjuster.deductible.toLocaleString('en-US')}`);
    }
  }
  if (!estimate.claim.propertyAddress) {
    const fromRoof = parsePropertyInfo(roofReportText);
    if (fromRoof.address) {
      estimate.claim.propertyAddress = fromRoof.address;
      estimate.claim.propertyCityStateZip = fromRoof.cityStateZip ?? '';
      resolved.push(`Property address read from the roof report`);
      const list = fromRoof.state ? priceListForState(fromRoof.state) : undefined;
      if (list) estimate.claim.priceList = list;
    }
  }

  // 3. Price list and tax rate follow the property's state.
  const stateMatch = (estimate.claim.propertyCityStateZip || '').match(/\b([A-Z]{2})\b/);
  const listForState = stateMatch ? priceListForState(stateMatch[1]) : undefined;
  if (listForState) {
    estimate.claim.priceList = listForState;
    const info = PRICE_LISTS.find((p) => p.id === listForState);
    if (info) {
      estimate.settings.salesTaxPct = info.defaultSalesTaxPct;
      resolved.push(
        `Price list ${listForState} and ${info.defaultSalesTaxPct}% material tax selected for ${stateMatch![1]}`
      );
    }
    const rules = REGIONAL_RULES[listForState];
    resolved.push(
      rules.secondaryBarrier === 'full_surface'
        ? 'Secondary water barrier written as full-surface membrane (Georgia AU408.1)'
        : 'Secondary water barrier written as 4" seam tape (Florida R905.1.1.1)'
    );
  } else if (!estimate.claim.propertyAddress) {
    needsAttention.push('Property address not found — price list left at its default');
  }

  // 4. Dates: only the entry timestamp can be known automatically.
  estimate.claim.dateEntered = formatEstimateDateTime();
  resolved.push('Date entered stamped');
  if (!estimate.claim.dateOfLoss) {
    needsAttention.push('Date of loss — supply from the claim');
  }
  if (!estimate.claim.claimNumber) {
    needsAttention.push('Claim number — supply from the claim');
  }

  // 5. Estimate naming.
  if (estimate.claim.insuredName && !estimate.claim.estimateName) {
    estimate.claim.estimateName = toEstimateName(estimate.claim.insuredName);
  }
  if (!estimate.claim.estimateName && estimate.claim.propertyAddress) {
    estimate.claim.estimateName = toEstimateName(estimate.claim.propertyAddress);
  }
  estimate.title = estimate.claim.propertyAddress
    ? `Supplement Estimate - ${estimate.claim.propertyAddress}`
    : estimate.title;
  if (!estimate.claim.insuredName) {
    needsAttention.push('Insured name — supply from the claim');
  }

  // 6. Scope.
  const scope = generateScopeFromMeasurements(
    estimate.measurements,
    estimate.claim.priceList
  );
  estimate.lineItems = scope;
  if (scope.length > 0) {
    resolved.push(`${scope.length} line items written with code-citation justifications`);
  }

  // 7. Trade labor minimums.
  if (estimate.settings.autoLaborMinimums) {
    const minimums = autoLaborMinimums(estimate.lineItems, estimate.claim.priceList);
    if (minimums.length > 0) {
      estimate.lineItems = [...estimate.lineItems, ...minimums];
      resolved.push(
        `${minimums.length} trade labor minimum${minimums.length === 1 ? '' : 's'} applied`
      );
    }
  }

  estimate.updatedAt = new Date().toISOString();
  return { estimate, resolved, needsAttention };
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
    deductible: 0,
    autoLaborMinimums: true
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
