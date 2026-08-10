// ---------------------------------------------------------
// Types for the Xactimate-style Supplement Estimate Creator
// ---------------------------------------------------------

export type EstimateUnit = 'SQ' | 'LF' | 'SF' | 'EA' | 'HR' | 'DA' | 'RM' | 'WK' | 'MO' | 'CF' | 'SY';

export interface CatalogItem {
  /** Category code, e.g. RFG, DRY, PNT */
  cat: string;
  /** Selector code within the category, e.g. 240, 300E */
  sel: string;
  /** Full trade-language description */
  description: string;
  unit: EstimateUnit;
  /** Regional default — always editable on the estimate */
  unitPrice: number;
  /** Typical useful life in years, used for age-based depreciation */
  lifeYears?: number;
  /** Portion of the price that is material (0-1), used for sales tax */
  materialRatio?: number;
  /** Items like labor minimums / detach & reset that never depreciate */
  nonDepreciable?: boolean;
  /** Search keywords */
  tags?: string[];
}

export type LineItemActivity = 'replace' | 'remove' | 'detach_reset' | 'repair' | 'install';

export interface SupplementLineItem {
  id: string;
  cat: string;
  sel: string;
  activity: LineItemActivity;
  description: string;
  quantity: number;
  unit: EstimateUnit;
  unitPrice: number;
  /** Percentage 0-100 applied to this line's RCV */
  depreciationPct: number;
  nonDepreciable: boolean;
  materialRatio: number;
  /** Free-form justification shown on the PDF under the line */
  note?: string;
  /** Grouping header on the printout, e.g. "Roof", "Dwelling Roof" */
  groupName: string;
}

export interface RoofMeasurements {
  totalRoofAreaSqFt?: number;
  ridgeLf?: number;
  hipLf?: number;
  valleyLf?: number;
  eaveLf?: number;
  rakeLf?: number;
  stepFlashingLf?: number;
  wallFlashingLf?: number;
  dripEdgeLf?: number;
  predominantPitch?: string;
  stories?: number;
  facets?: number;
  penetrations?: number;
  pipeJacks?: number;
  turtleVents?: number;
  ridgeVentLf?: number;
  chimneys?: number;
  skylights?: number;
  wastePct: number;
}

export interface ClaimInfo {
  insuredName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  insuranceCarrier: string;
  claimNumber: string;
  policyNumber: string;
  dateOfLoss: string;
  typeOfLoss: string;
  adjusterName: string;
  adjusterPhone: string;
  adjusterEmail: string;
  estimatorName: string;
  priceListLabel: string;
}

export interface EstimateSettings {
  /** Sales tax percent applied to the material portion of each line */
  salesTaxPct: number;
  /** Overhead percent (e.g. 10) */
  overheadPct: number;
  /** Profit percent (e.g. 10) */
  profitPct: number;
  applyOAndP: boolean;
  /** Whether depreciation is recoverable (shown as such on the summary) */
  recoverableDepreciation: boolean;
  deductible: number;
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
  itemTotal: number; // qty * unitPrice
  tax: number;
  rcv: number; // itemTotal + tax
  depreciation: number;
  acv: number;
}

export interface EstimateTotals {
  lineItemSubtotal: number;
  salesTax: number;
  subtotalWithTax: number;
  overhead: number;
  profit: number;
  rcv: number;
  totalDepreciation: number;
  acv: number;
  deductible: number;
  netClaimIfRecoverable: number; // RCV - deductible
  netClaimAcv: number; // ACV - deductible
  tradeRecap: Array<{ trade: string; cat: string; rcv: number; pctOfTotal: number }>;
}
