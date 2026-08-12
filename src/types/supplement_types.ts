// ---------------------------------------------------------
// Types for the Diversity Roofing supplement estimate creator.
//
// The data model mirrors the structure of the estimates the
// company actually issues: an Area > Room > group hierarchy of
// line items, per-line O&P, and a summary that resolves to
// RCV / depreciation / ACV / net claim.
// ---------------------------------------------------------

export type EstimateUnit =
  | 'SQ'
  | 'LF'
  | 'SF'
  | 'EA'
  | 'HR'
  | 'DA'
  | 'WK'
  | 'MO'
  | 'SY'
  | 'CF'
  | 'RM';

/** Recap-by-category buckets, spelled as they print on the estimate. */
export type CategoryCode =
  | 'ROOFING'
  | 'GENERAL DEMOLITION'
  | 'PAINTING'
  | 'DRYWALL'
  | 'INSULATION'
  | 'CLEANING'
  | 'CONTENT MANIPULATION'
  | 'WINDOWS - SKYLIGHTS'
  | 'SIDING'
  | 'SOFFIT, FASCIA & GUTTER'
  | 'FRAMING & ROUGH CARPENTRY'
  | 'HEAT, VENT & AIR CONDITIONING'
  | 'ELECTRICAL'
  | 'TEMPORARY REPAIRS'
  | 'WATER EXTRACTION & REMEDIATION';

/** Published price lists the company estimates against. */
export type PriceListId = 'FLJA8X_JUN26' | 'GABR8X_FEB26';

export interface PriceListInfo {
  id: PriceListId;
  label: string;
  region: string;
  defaultSalesTaxPct: number;
}

export interface CatalogItem {
  /** Stable internal key (not printed). */
  code: string;
  category: CategoryCode;
  /** Exact wording as it appears on the estimate. */
  description: string;
  unit: EstimateUnit;
  /** Unit price per price list. */
  prices: Partial<Record<PriceListId, number>>;
  /**
   * Share of the line total that is taxable material (0-1).
   * Derived from the tax actually charged on issued estimates.
   */
  materialRatio: number;
  /**
   * For R&R (remove & replace) items, the share of the line total
   * attributed to GENERAL DEMOLITION in the recap by category.
   */
  demoRatio?: number;
  /** Whether this item is a demolition/removal line in its entirety. */
  allDemo?: boolean;
  /** Default justification paragraph printed under the line. */
  defaultNote?: string;
  /** Sub-heading the item files under inside a room, e.g. "Flashing/Vents". */
  group?: string;
  /** Labor minimums print in their own trailing section. */
  laborMinimum?: boolean;
  /** Typical useful life in years, for age-based depreciation. */
  lifeYears?: number;
  /** Items that never depreciate (labor, demolition, D&R). */
  nonDepreciable?: boolean;
  tags?: string[];
}

export interface SupplementLineItem {
  id: string;
  /** Catalog code this line came from, when applicable. */
  code?: string;
  category: CategoryCode;
  description: string;
  quantity: number;
  unit: EstimateUnit;
  unitPrice: number;
  materialRatio: number;
  demoRatio: number;
  allDemo: boolean;
  /** Percentage 0-100 of this line's RCV held as depreciation. */
  depreciationPct: number;
  nonDepreciable: boolean;
  /** Justification text printed beneath the line. */
  note?: string;
  /** Area the line belongs to, e.g. "Exterior", "Level 1". */
  area: string;
  /** Room within the area, e.g. "Dwelling Roof", "Bathroom". */
  room: string;
  /** Optional sub-heading within the room, e.g. "Roofing". */
  group?: string;
  /** Bid items print with no pricing and a REVISED marker. */
  bidItem?: boolean;
  /** Labor minimums are collected into their own section. */
  laborMinimum?: boolean;
}

/**
 * Roof measurements, covering the fields reported by both
 * Roofr and QuickMeasure style reports.
 */
export interface RoofMeasurements {
  totalRoofAreaSqFt?: number;
  pitchedAreaSqFt?: number;
  flatAreaSqFt?: number;
  facets?: number;
  predominantPitch?: string;
  stories?: number;
  eaveLf?: number;
  rakeLf?: number;
  ridgeLf?: number;
  hipLf?: number;
  valleyLf?: number;
  wallFlashingLf?: number;
  stepFlashingLf?: number;
  transitionsLf?: number;
  dripEdgeLf?: number;
  starterLf?: number;
  ridgeCapLf?: number;
  /** Counted from the inspection, not the report. */
  pipeJacks?: number;
  turtleVents?: number;
  offRidgeVents?: number;
  exhaustCaps?: number;
  ridgeVentLf?: number;
  chimneys?: number;
  skylights?: number;
  satelliteDishes?: number;
  /** Waste percentage applied to the shingle line. */
  wastePct: number;
  /** Report source label printed as the area name on the estimate. */
  reportSource?: string;
}

export interface ClaimInfo {
  insuredName: string;
  insuredHomePhone: string;
  insuredCellPhone: string;
  insuredEmail: string;
  /** The insured's mailing address, which may differ from the loss location. */
  mailingAddress: string;
  mailingCityStateZip: string;
  propertyAddress: string;
  propertyCityStateZip: string;
  claimNumber: string;
  policyNumber: string;
  typeOfLoss: string;
  dateOfLoss: string;
  dateContacted: string;
  dateReceived: string;
  dateInspected: string;
  dateEntered: string;
  priceList: PriceListId;
  laborEfficiency: string;
  estimator: string;
  businessPhone: string;
  /** Operator who wrote the estimate, e.g. HAYAT. */
  operator: string;
  /** Estimate name slug, e.g. CORRINE-MULLIGAN. */
  estimateName: string;
}

export interface EstimateSettings {
  salesTaxPct: number;
  overheadPct: number;
  profitPct: number;
  applyOAndP: boolean;
  recoverableDepreciation: boolean;
  deductible: number;
  /** Optional note printed above the summary, e.g. draft status. */
  coverPageNote?: string;
}

export interface SupplementEstimate {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  claim: ClaimInfo;
  measurements: RoofMeasurements;
  settings: EstimateSettings;
  lineItems: SupplementLineItem[];
}

export interface LineItemTotals {
  /** quantity x unitPrice */
  itemTotal: number;
  tax: number;
  oAndP: number;
  rcv: number;
  depreciation: number;
  acv: number;
}

export interface GroupTotals {
  name: string;
  tax: number;
  oAndP: number;
  rcv: number;
  depreciation: number;
  acv: number;
  /** Pre-tax, pre-O&P total, which is what the recap by room reports. */
  itemTotal: number;
}

export interface CategoryRecapRow {
  category: string;
  total: number;
  pctOfTotal: number;
}

export interface RoomRecapRow {
  area: string;
  room: string;
  itemTotal: number;
  pctOfTotal: number;
}

export interface EstimateTotals {
  lineItemTotal: number;
  salesTax: number;
  subtotal: number;
  overhead: number;
  profit: number;
  rcv: number;
  totalDepreciation: number;
  acv: number;
  deductible: number;
  netClaim: number;
  /** Net claim once recoverable depreciation is released. */
  netClaimIfRecovered: number;
  categoryRecap: CategoryRecapRow[];
  roomRecap: RoomRecapRow[];
  /** Room-level totals keyed "area||room". */
  roomTotals: Map<string, GroupTotals>;
  areaTotals: Map<string, GroupTotals>;
}
