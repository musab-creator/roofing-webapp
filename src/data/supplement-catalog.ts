import { CatalogItem, PriceListId, PriceListInfo } from '../types/supplement_types';

// ---------------------------------------------------------------
// Line-item catalog built from Diversity Roofing's issued estimates.
//
// Descriptions match the wording that prints on the estimate.
// Unit prices come from the price lists referenced on those
// estimates and remain editable per line. Material ratios are
// derived from the sales tax actually charged, so the tax column
// reproduces the same figures.
//
// Default notes are the code-citation justifications used to
// support each item to the carrier — edit per claim as needed.
// ---------------------------------------------------------------

export const PRICE_LISTS: PriceListInfo[] = [
  {
    id: 'FLJA8X_JUN26',
    label: 'FLJA8X_JUN26',
    region: 'Florida — Jacksonville',
    defaultSalesTaxPct: 7
  },
  {
    id: 'GABR8X_FEB26',
    label: 'GABR8X_FEB26',
    region: 'Georgia — Brunswick',
    defaultSalesTaxPct: 7
  }
];

export const DEFAULT_PRICE_LIST: PriceListId = 'FLJA8X_JUN26';

/** Sub-headings used within a room, in print order. */
export const GROUP_ORDER = [
  'Roof Covering',
  'Roofing',
  'Flashing',
  'Flashing/Vents',
  'Roof Vents',
  'Miscellaneous'
];

const NOTE_RENAIL_FL =
  'Renailing of roof decking is required to meet current uplift fastening standards during reroofing per the Florida Building Code. Existing fastening does not comply, so supplemental nailing is necessary to achieve code-compliant attachment for the new roofing system.';

const NOTE_RENAIL_GA =
  'Roof sheathing must be completely re-nailed per Georgia State Amendments to the IRC (R602.3 / R803.2) to meet current fastening requirements. Existing fasteners are disturbed and compromised during tear-off and reroof operations; therefore, full re-nailing of all roof deck panels is required to restore structural integrity, ensure proper uplift resistance, and achieve code compliance.';

const NOTE_FELT =
  'Per IRC R905.1.1, underlayment is required beneath asphalt shingles in accordance with manufacturer installation instructions. Per IRC R904.1, roofing materials must provide a weather-resistant roof system; therefore, 30 lb felt underlayment is required as the minimum code-compliant felt underlayment for proper roof protection.';

const NOTE_SEAM_TAPE =
  'Per Florida Residential Code R905.1.1.1(1), the entire roof deck shall be covered with an ASTM D1970 self-adhering polymer-modified bitumen underlayment installed in accordance with both the underlayment and roof-covering manufacturer’s installation instructions. Full-deck membrane provides a continuous secondary water barrier and superior protection against wind-driven rain and water intrusion.';

const NOTE_WATER_BARRIER_GA =
  'Secondary water barrier is required per Georgia State Amendments to the IRC (AU408.1), which mandate a multi-layer roof underlayment system including self-adhering membrane/tape over roof deck joints. All roof deck seams must be sealed and covered with compliant underlayment to meet current Georgia residential roofing code and provide required secondary water protection during reroof.';

const NOTE_STARTER =
  'Starter course required for eaves per FBC R905.2.8.5 (2023) and manufacturer installation guidelines – starter shingles must be installed along the whole perimeter to provide proper wind resistance and sealant adhesion for shingle roof systems.';

const NOTE_ICE_WATER =
  'Per IRC R905.2.8.2, self-adhering modified bitumen underlayment (Ice & Water Shield) is an approved valley lining material. Due to Florida’s high wind events and wind-driven rain exposure, valleys require enhanced waterproofing beyond standard underlayment to maintain code-compliant water shedding performance and prevent leakage at shingle joints and fastener penetrations.';

const NOTE_SEALANT =
  'This line item covers the hand application of roofing mastic to properly seal the drip edge, as required by the Florida Building Code. FBC §R905.2 requires asphalt shingle roofs to be installed in a manner that provides a weather-resistant and wind-resistant roof system.';

const NOTE_TEAROFF =
  'Shingles are scatteredly damaged across multiple roof slopes. Due to the widespread and non-uniform distribution of damage, isolated or spot repairs are not feasible or code-compliant. Partial repairs would result in mismatched materials, improper sealing, and compromised system integrity. Therefore, complete roof replacement is required to restore a continuous, weather-resistant roofing system in accordance with IRC R905.1 and R903.1 and manufacturer installation standards.';

export const SUPPLEMENT_CATALOG: CatalogItem[] = [
  // ----------------------------- Roofing -----------------------------
  {
    code: 'RFG_TEAROFF_LAM',
    category: 'GENERAL DEMOLITION',
    description: 'Tear off, haul and dispose of comp. shingles - Laminated',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 80.64, GABR8X_FEB26: 79.64 },
    materialRatio: 0,
    allDemo: true,
    nonDepreciable: true,
    group: 'Roofing',
    defaultNote: NOTE_TEAROFF,
    tags: ['tear off', 'removal', 'demo', 'shingle']
  },
  {
    code: 'RFG_TEAROFF_3TAB',
    category: 'GENERAL DEMOLITION',
    description: 'Tear off, haul and dispose of comp. shingles - 3 tab',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 74.32, GABR8X_FEB26: 73.45 },
    materialRatio: 0,
    allDemo: true,
    nonDepreciable: true,
    group: 'Roofing',
    tags: ['tear off', '3 tab', 'removal']
  },
  {
    code: 'RFG_ADDL_LAYER',
    category: 'GENERAL DEMOLITION',
    description: 'Remove Additional layer of comp. shingles',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 41.62, GABR8X_FEB26: 41.06 },
    materialRatio: 0,
    allDemo: true,
    nonDepreciable: true,
    group: 'Roofing',
    tags: ['second layer', 'double layer', 'removal']
  },
  {
    code: 'RFG_RENAIL',
    category: 'ROOFING',
    description: 'Re-nailing of roof sheathing - complete re-nail',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 0.3, GABR8X_FEB26: 0.24 },
    materialRatio: 0.0333,
    lifeYears: 100,
    group: 'Roofing',
    defaultNote: NOTE_RENAIL_FL,
    tags: ['re-nail', 'renail', 'decking', 'sheathing', 'uplift', 'code']
  },
  {
    code: 'RFG_FELT_30',
    category: 'ROOFING',
    description: 'Roofing felt - 30 lb.',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 49.16, GABR8X_FEB26: 52.2 },
    materialRatio: 0.341,
    lifeYears: 30,
    group: 'Roofing',
    defaultNote: NOTE_FELT,
    tags: ['felt', 'underlayment', '30 lb']
  },
  {
    code: 'RFG_FELT_15',
    category: 'ROOFING',
    description: 'Roofing felt - 15 lb.',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 38.42, GABR8X_FEB26: 40.15 },
    materialRatio: 0.33,
    lifeYears: 30,
    group: 'Roofing',
    tags: ['felt', 'underlayment', '15 lb']
  },
  {
    code: 'RFG_SYNTHETIC',
    category: 'ROOFING',
    description: 'Synthetic underlayment',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 54.28, GABR8X_FEB26: 56.1 },
    materialRatio: 0.36,
    lifeYears: 30,
    group: 'Roofing',
    tags: ['synthetic', 'underlayment', 'deck armor', 'tiger paw']
  },
  {
    code: 'RFG_SEAM_TAPE',
    category: 'ROOFING',
    description: 'Water barrier joint taping - Mod. bitumen - 4" seam tape',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 0.37 },
    materialRatio: 0.27,
    lifeYears: 30,
    group: 'Roofing',
    defaultNote: NOTE_SEAM_TAPE,
    tags: ['seam tape', 'joint taping', 'secondary water barrier', 'swr', 'code']
  },
  {
    code: 'RFG_WATER_BARRIER_FULL',
    category: 'ROOFING',
    description: 'Water barrier membrane - Mod. bitumen - entire surface',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 0.98, GABR8X_FEB26: 0.93 },
    materialRatio: 0.58,
    lifeYears: 30,
    group: 'Roofing',
    defaultNote: NOTE_WATER_BARRIER_GA,
    tags: ['water barrier', 'peel and stick', 'full deck', 'secondary water barrier']
  },
  {
    code: 'RFG_STARTER',
    category: 'ROOFING',
    description: 'Asphalt starter - universal starter course',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 2.1, GABR8X_FEB26: 2.24 },
    materialRatio: 0.281,
    lifeYears: 30,
    group: 'Roofing',
    defaultNote: NOTE_STARTER,
    tags: ['starter', 'eaves', 'rakes']
  },
  {
    code: 'RFG_ICE_WATER',
    category: 'ROOFING',
    description: 'Ice & water barrier',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 2.06, GABR8X_FEB26: 1.98 },
    materialRatio: 0.291,
    lifeYears: 30,
    group: 'Roofing',
    defaultNote: NOTE_ICE_WATER,
    tags: ['ice and water', 'valley', 'leak barrier', 'shield']
  },
  {
    code: 'RFG_SHINGLE_LAM',
    category: 'ROOFING',
    description: 'Laminated - comp. shingle rfg. - w/out felt',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 298.55, GABR8X_FEB26: 316.65 },
    materialRatio: 0.483,
    lifeYears: 30,
    group: 'Roofing',
    tags: ['shingle', 'laminated', 'architectural', 'dimensional']
  },
  {
    code: 'RFG_SHINGLE_3TAB',
    category: 'ROOFING',
    description: '3 tab - 25 yr. - comp. shingle roofing - w/out felt',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 264.18, GABR8X_FEB26: 271.4 },
    materialRatio: 0.46,
    lifeYears: 25,
    group: 'Roofing',
    tags: ['shingle', '3 tab']
  },
  {
    code: 'RFG_RIDGE_CAP',
    category: 'ROOFING',
    description: 'R&R Hip / Ridge cap - Standard profile - composition shingles',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 10.93, GABR8X_FEB26: 11.25 },
    materialRatio: 0.274,
    demoRatio: 0.18,
    lifeYears: 30,
    group: 'Roofing',
    defaultNote: 'Ridge caps need to be replaced as well during re-roofing.',
    tags: ['ridge cap', 'hip cap']
  },
  {
    code: 'RFG_RIDGE_CAP_HIGH',
    category: 'ROOFING',
    description: 'R&R Hip / Ridge cap - High profile - composition shingles',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 13.42, GABR8X_FEB26: 13.86 },
    materialRatio: 0.28,
    demoRatio: 0.18,
    lifeYears: 30,
    group: 'Roofing',
    tags: ['ridge cap', 'high profile']
  },

  // ----------------------------- Flashing / Vents -----------------------------
  {
    code: 'RFG_DRIP_EDGE',
    category: 'ROOFING',
    description: 'R&R Drip edge',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 3.82, GABR8X_FEB26: 3.98 },
    materialRatio: 0.34,
    demoRatio: 0.18,
    lifeYears: 35,
    group: 'Flashing/Vents',
    defaultNote: 'Drip edge over the entire roof perimeter needs to be replaced.',
    tags: ['drip edge', 'perimeter']
  },
  {
    code: 'RFG_SEALANT_LF',
    category: 'ROOFING',
    description: 'Apply roofing sealant/cement - per LF',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 0.85, GABR8X_FEB26: 0.89 },
    materialRatio: 0.377,
    lifeYears: 15,
    group: 'Flashing/Vents',
    defaultNote: NOTE_SEALANT,
    tags: ['sealant', 'mastic', 'cement', 'drip edge']
  },
  {
    code: 'RFG_VALLEY_METAL',
    category: 'ROOFING',
    description: 'R&R Valley metal',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 8.62, GABR8X_FEB26: 8.33 },
    materialRatio: 0.304,
    demoRatio: 0.18,
    lifeYears: 35,
    group: 'Flashing/Vents',
    defaultNote:
      'Valley metal to be removed and replaced to prevent moisture penetration at such critical areas.',
    tags: ['valley metal', 'valley']
  },
  {
    code: 'RFG_PIPE_JACK',
    category: 'ROOFING',
    description: 'R&R Flashing - pipe jack',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 71.24, GABR8X_FEB26: 74.88 },
    materialRatio: 0.285,
    demoRatio: 0.18,
    lifeYears: 30,
    group: 'Flashing/Vents',
    defaultNote: 'Flashing for the pipe jacks must be replaced to ensure water proofing.',
    tags: ['pipe jack', 'boot', 'penetration']
  },
  {
    code: 'RFG_PIPE_JACK_LEAD',
    category: 'ROOFING',
    description: 'R&R Flashing - pipe jack - lead',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 104.1 },
    materialRatio: 0.511,
    demoRatio: 0.18,
    lifeYears: 35,
    group: 'Flashing/Vents',
    tags: ['pipe jack', 'lead']
  },
  {
    code: 'RFG_STEP_FLASHING',
    category: 'ROOFING',
    description: 'Step flashing',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 12.55, GABR8X_FEB26: 13.52 },
    materialRatio: 0.179,
    lifeYears: 35,
    group: 'Flashing/Vents',
    defaultNote:
      'Step flashing needs to be replaced along the sloped intersections where roof meets the walls at slope.',
    tags: ['step flashing', 'sidewall']
  },
  {
    code: 'RFG_SIDEWALL_FLASHING',
    category: 'ROOFING',
    description: 'R&R Aluminum sidewall/endwall flashing - color finish',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 10.23, GABR8X_FEB26: 10.63 },
    materialRatio: 0.493,
    demoRatio: 0.18,
    lifeYears: 35,
    group: 'Flashing/Vents',
    defaultNote:
      'End wall flashing needs to be replaced along the horizontal intersections where roof meets the wall horizontally.',
    tags: ['endwall', 'sidewall', 'headwall', 'flashing']
  },
  {
    code: 'RFG_CHIMNEY_FLASHING',
    category: 'ROOFING',
    description: 'R&R Chimney flashing - average (32" x 36")',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 541.69, GABR8X_FEB26: 476.51 },
    materialRatio: 0.215,
    demoRatio: 0.18,
    lifeYears: 35,
    group: 'Flashing/Vents',
    tags: ['chimney', 'flashing']
  },
  {
    code: 'RFG_VENT_OFF_RIDGE_4',
    category: 'ROOFING',
    description: "R&R Roof vent - off ridge type - 4'",
    unit: 'EA',
    prices: { FLJA8X_JUN26: 158.92, GABR8X_FEB26: 151.81 },
    materialRatio: 0.328,
    demoRatio: 0.18,
    lifeYears: 25,
    group: 'Flashing/Vents',
    tags: ['off ridge vent', 'roof vent']
  },
  {
    code: 'RFG_VENT_OFF_RIDGE_6',
    category: 'ROOFING',
    description: "R&R Roof vent - off ridge type - 6'",
    unit: 'EA',
    prices: { FLJA8X_JUN26: 241.84 },
    materialRatio: 0.328,
    demoRatio: 0.18,
    lifeYears: 25,
    group: 'Flashing/Vents',
    tags: ['off ridge vent', 'roof vent']
  },
  {
    code: 'RFG_RIDGE_VENT',
    category: 'ROOFING',
    description: 'R&R Continuous ridge vent - shingle-over style',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 12.59, GABR8X_FEB26: 12.02 },
    materialRatio: 0.364,
    demoRatio: 0.18,
    lifeYears: 25,
    group: 'Flashing/Vents',
    tags: ['ridge vent', 'continuous', 'shingle over']
  },
  {
    code: 'RFG_EXHAUST_CAP_4',
    category: 'ROOFING',
    description: 'R&R Exhaust cap - through roof - up to 4"',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 108.64, GABR8X_FEB26: 102.52 },
    materialRatio: 0.388,
    demoRatio: 0.18,
    lifeYears: 25,
    group: 'Flashing/Vents',
    tags: ['exhaust cap', 'vent']
  },
  {
    code: 'RFG_EXHAUST_CAP_6',
    category: 'ROOFING',
    description: 'R&R Exhaust cap - through roof - 6" to 8"',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 131.64 },
    materialRatio: 0.406,
    demoRatio: 0.18,
    lifeYears: 25,
    group: 'Flashing/Vents',
    tags: ['exhaust cap', 'vent']
  },
  {
    code: 'RFG_MASTIC_VENT',
    category: 'ROOFING',
    description: 'Apply mastic around vent pipes to repair leakage',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 33.6, GABR8X_FEB26: 26.45 },
    materialRatio: 0.03,
    lifeYears: 15,
    group: 'Flashing/Vents',
    defaultNote:
      'Need to apply mastic around vent pipes to prevent water penetration into the house.',
    tags: ['mastic', 'vent pipe', 'leak']
  },
  {
    code: 'PNT_ROOF_VENT',
    category: 'PAINTING',
    description: 'Prime & paint roof vent',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 40.1 },
    materialRatio: 0.197,
    lifeYears: 15,
    group: 'Flashing/Vents',
    tags: ['paint', 'roof vent']
  },
  {
    code: 'PNT_ROOF_JACK',
    category: 'PAINTING',
    description: 'Prime & paint roof jack',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 40.1 },
    materialRatio: 0.197,
    lifeYears: 15,
    group: 'Flashing/Vents',
    tags: ['paint', 'roof jack', 'pipe']
  },

  // ----------------------------- Miscellaneous roof -----------------------------
  {
    code: 'RFG_SKYLIGHT_FIXED',
    category: 'WINDOWS - SKYLIGHTS',
    description: 'R&R Skylight - fixed, 7.1 - 9 sf',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 981.15 },
    materialRatio: 0.789,
    demoRatio: 0.066,
    lifeYears: 25,
    group: 'Miscellaneous',
    tags: ['skylight']
  },
  {
    code: 'RFG_SATELLITE_DR',
    category: 'ROOFING',
    description: 'Digital satellite system - Detach & reset',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 56.24, GABR8X_FEB26: 54.18 },
    materialRatio: 0,
    nonDepreciable: true,
    group: 'Miscellaneous',
    tags: ['satellite', 'dish', 'detach and reset']
  },
  {
    code: 'RFG_STEEP_7_9',
    category: 'ROOFING',
    description: 'Additional charge for steep roof - 7/12 to 9/12 slope',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 46.82, GABR8X_FEB26: 45.51 },
    materialRatio: 0,
    nonDepreciable: true,
    group: 'Roofing',
    tags: ['steep', 'slope', 'charge']
  },
  {
    code: 'RFG_STEEP_10_12',
    category: 'ROOFING',
    description: 'Additional charge for steep roof - 10/12 - 12/12 slope',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 73.18, GABR8X_FEB26: 71.36 },
    materialRatio: 0,
    nonDepreciable: true,
    group: 'Roofing',
    tags: ['steep', 'slope', 'charge']
  },
  {
    code: 'RFG_HIGH_ROOF',
    category: 'ROOFING',
    description: 'Additional charge for high roof (2 stories or greater)',
    unit: 'SQ',
    prices: { FLJA8X_JUN26: 20.86, GABR8X_FEB26: 20.03 },
    materialRatio: 0,
    nonDepreciable: true,
    group: 'Roofing',
    tags: ['high roof', 'two story', 'charge']
  },
  {
    code: 'RFG_SHEATHING_OSB',
    category: 'ROOFING',
    description: 'Sheathing - OSB - 7/16"',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 2.41, GABR8X_FEB26: 2.32 },
    materialRatio: 0.5,
    lifeYears: 100,
    group: 'Roofing',
    tags: ['sheathing', 'osb', 'decking', 'plywood']
  },

  // ----------------------------- Debris -----------------------------
  {
    code: 'DBR_HAUL_TRUCK',
    category: 'GENERAL DEMOLITION',
    description: 'Haul debris - per pickup truck load - including dump fees',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 194.76, GABR8X_FEB26: 188.42 },
    materialRatio: 0,
    allDemo: true,
    nonDepreciable: true,
    tags: ['haul', 'debris', 'dump']
  },
  {
    code: 'DBR_DUMPSTER_12',
    category: 'GENERAL DEMOLITION',
    description: 'Dumpster load - Approx. 12 yards, 1-3 tons of debris',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 418.65, GABR8X_FEB26: 405.01 },
    materialRatio: 0,
    allDemo: true,
    nonDepreciable: true,
    tags: ['dumpster', 'debris', '12 yard']
  },
  {
    code: 'DBR_DUMPSTER_30',
    category: 'GENERAL DEMOLITION',
    description: 'Dumpster load - Approx. 30 yards, 5-7 tons of debris',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 651.28, GABR8X_FEB26: 632.42 },
    materialRatio: 0,
    allDemo: true,
    nonDepreciable: true,
    tags: ['dumpster', 'debris', '30 yard']
  },

  // ----------------------------- Interior: drywall / insulation -----------------------------
  {
    code: 'DRY_58',
    category: 'DRYWALL',
    description: 'R&R 5/8" drywall - hung, taped, ready for texture',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 3.51 },
    materialRatio: 0.28,
    demoRatio: 0.18,
    lifeYears: 100,
    tags: ['drywall', 'sheetrock', 'ceiling']
  },
  {
    code: 'DRY_12',
    category: 'DRYWALL',
    description: 'R&R 1/2" drywall - hung, taped, ready for texture',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 3.24 },
    materialRatio: 0.28,
    demoRatio: 0.18,
    lifeYears: 100,
    tags: ['drywall', 'sheetrock']
  },
  {
    code: 'DRY_ACOUSTIC_TEXTURE',
    category: 'DRYWALL',
    description: 'R&R Acoustic ceiling (popcorn) texture',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 2.03 },
    materialRatio: 0.16,
    demoRatio: 0.18,
    lifeYears: 100,
    tags: ['popcorn', 'acoustic', 'texture', 'ceiling']
  },
  {
    code: 'INS_BATT_R30',
    category: 'INSULATION',
    description: 'R&R Batt insulation - 10" - R30 - unfaced batt',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 2.47 },
    materialRatio: 0.41,
    demoRatio: 0.18,
    lifeYears: 100,
    tags: ['insulation', 'batt', 'r30']
  },
  {
    code: 'INS_BATT_R19',
    category: 'INSULATION',
    description: 'R&R Batt insulation - 6" - R19 - unfaced batt',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 1.86 },
    materialRatio: 0.41,
    demoRatio: 0.18,
    lifeYears: 100,
    tags: ['insulation', 'batt', 'r19']
  },

  // ----------------------------- Interior: painting -----------------------------
  {
    code: 'PNT_MASK_PREP_LF',
    category: 'PAINTING',
    description: 'Mask and prep for paint - plastic, paper, tape (per LF)',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 1.59 },
    materialRatio: 0.34,
    lifeYears: 15,
    tags: ['mask', 'prep', 'paint']
  },
  {
    code: 'PNT_SEAL_PAINT_1_1',
    category: 'PAINTING',
    description: 'Seal/prime (1 coat) then paint (1 coat) the surface area',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 1.14 },
    materialRatio: 0.26,
    lifeYears: 15,
    tags: ['paint', 'seal', 'prime', 'ceiling', 'wall']
  },
  {
    code: 'PNT_PAINT_TWO_COATS',
    category: 'PAINTING',
    description: 'Paint the surface area - two coats',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 1.2 },
    materialRatio: 0.2,
    lifeYears: 15,
    tags: ['paint', 'two coats']
  },
  {
    code: 'PNT_SEAL_LATEX_TWO',
    category: 'PAINTING',
    description: 'Seal the surface area w/latex based stain blocker - two coats',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 0.94 },
    materialRatio: 0.14,
    lifeYears: 15,
    tags: ['seal', 'stain blocker', 'latex']
  },
  {
    code: 'PNT_SPOT_SEAL_OIL',
    category: 'PAINTING',
    description: 'Spot seal w/oil based/hybrid stain blocker',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 29.91 },
    materialRatio: 0.09,
    lifeYears: 15,
    tags: ['spot seal', 'stain blocker', 'water stain']
  },
  {
    code: 'PNT_FLOOR_PROT_FILM',
    category: 'PAINTING',
    description: 'Floor protection - self-adhesive plastic film',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 0.73 },
    materialRatio: 0.14,
    nonDepreciable: true,
    tags: ['floor protection', 'film']
  },
  {
    code: 'PNT_FLOOR_PROT_10MIL',
    category: 'PAINTING',
    description: 'Floor protection - plastic and tape - 10 mil',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 0.37 },
    materialRatio: 0.24,
    nonDepreciable: true,
    tags: ['floor protection', 'plastic']
  },

  // ----------------------------- Cleaning / contents -----------------------------
  {
    code: 'CLN_FINAL_RESIDENTIAL',
    category: 'CLEANING',
    description: 'Final cleaning - construction - Residential',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 0.4 },
    materialRatio: 0,
    nonDepreciable: true,
    tags: ['final cleaning', 'construction clean']
  },
  {
    code: 'CON_MOVE_RESET_SMALL',
    category: 'CONTENT MANIPULATION',
    description: 'Contents - move out then reset - Small room',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 66.83 },
    materialRatio: 0,
    nonDepreciable: true,
    tags: ['contents', 'move out', 'reset', 'small room']
  },
  {
    code: 'CON_MOVE_RESET',
    category: 'CONTENT MANIPULATION',
    description: 'Contents - move out then reset',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 89.05 },
    materialRatio: 0,
    nonDepreciable: true,
    tags: ['contents', 'move out', 'reset']
  },

  // ----------------------------- Labor minimums -----------------------------
  {
    code: 'LAB_MIN_DRYWALL',
    category: 'DRYWALL',
    description: 'Drywall labor minimum',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 419.63 },
    materialRatio: 0,
    nonDepreciable: true,
    laborMinimum: true,
    tags: ['labor minimum', 'drywall']
  },
  {
    code: 'LAB_MIN_INSULATION',
    category: 'INSULATION',
    description: 'Insulation labor minimum',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 156.66 },
    materialRatio: 0,
    nonDepreciable: true,
    laborMinimum: true,
    tags: ['labor minimum', 'insulation']
  },
  {
    code: 'LAB_MIN_SKYLIGHT',
    category: 'WINDOWS - SKYLIGHTS',
    description: 'Skylight labor minimum',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 12.43 },
    materialRatio: 0,
    nonDepreciable: true,
    laborMinimum: true,
    tags: ['labor minimum', 'skylight']
  },
  {
    code: 'LAB_MIN_CLEANING',
    category: 'CLEANING',
    description: 'Cleaning labor minimum',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 7.44 },
    materialRatio: 0,
    nonDepreciable: true,
    laborMinimum: true,
    tags: ['labor minimum', 'cleaning']
  },
  {
    code: 'LAB_MIN_PAINTING',
    category: 'PAINTING',
    description: 'Painting labor minimum',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 231.85 },
    materialRatio: 0,
    nonDepreciable: true,
    laborMinimum: true,
    tags: ['labor minimum', 'painting']
  },
  {
    code: 'LAB_MIN_ROOFING',
    category: 'ROOFING',
    description: 'Roofing labor minimum',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 486.12 },
    materialRatio: 0,
    nonDepreciable: true,
    laborMinimum: true,
    tags: ['labor minimum', 'roofing']
  },

  // ----------------------------- Gutters / siding / soffit -----------------------------
  {
    code: 'SFG_GUTTER_5',
    category: 'SOFFIT, FASCIA & GUTTER',
    description: 'R&R Gutter / downspout - aluminum - up to 5"',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 10.16, GABR8X_FEB26: 9.6 },
    materialRatio: 0.42,
    demoRatio: 0.18,
    lifeYears: 25,
    tags: ['gutter', 'downspout']
  },
  {
    code: 'SFG_GUTTER_6',
    category: 'SOFFIT, FASCIA & GUTTER',
    description: 'R&R Gutter / downspout - aluminum - 6"',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 12.34, GABR8X_FEB26: 11.72 },
    materialRatio: 0.42,
    demoRatio: 0.18,
    lifeYears: 25,
    tags: ['gutter', '6 inch']
  },
  {
    code: 'SFG_FASCIA_METAL',
    category: 'SOFFIT, FASCIA & GUTTER',
    description: 'R&R Fascia - metal - 6"',
    unit: 'LF',
    prices: { FLJA8X_JUN26: 6.42, GABR8X_FEB26: 6.11 },
    materialRatio: 0.38,
    demoRatio: 0.18,
    lifeYears: 35,
    tags: ['fascia', 'metal wrap']
  },
  {
    code: 'SFG_SOFFIT_VINYL',
    category: 'SOFFIT, FASCIA & GUTTER',
    description: 'R&R Soffit - vinyl',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 6.68, GABR8X_FEB26: 6.4 },
    materialRatio: 0.42,
    demoRatio: 0.18,
    lifeYears: 30,
    tags: ['soffit', 'vinyl']
  },
  {
    code: 'SDG_VINYL',
    category: 'SIDING',
    description: 'R&R Siding - vinyl',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 5.52, GABR8X_FEB26: 5.28 },
    materialRatio: 0.46,
    demoRatio: 0.18,
    lifeYears: 35,
    tags: ['siding', 'vinyl']
  },

  // ----------------------------- HVAC / temporary -----------------------------
  {
    code: 'HVC_COMB_FINS',
    category: 'HEAT, VENT & AIR CONDITIONING',
    description: 'Comb A/C condenser fins - w/out trip charge',
    unit: 'EA',
    prices: { FLJA8X_JUN26: 56.18, GABR8X_FEB26: 54.94 },
    materialRatio: 0,
    nonDepreciable: true,
    tags: ['ac', 'condenser', 'fins', 'hail']
  },
  {
    code: 'TMP_TARP',
    category: 'TEMPORARY REPAIRS',
    description: 'Tarp - all-purpose poly - per sq ft (labor and material)',
    unit: 'SF',
    prices: { FLJA8X_JUN26: 1.22, GABR8X_FEB26: 1.16 },
    materialRatio: 0.4,
    nonDepreciable: true,
    tags: ['tarp', 'emergency', 'temporary']
  }
];

export function priceFor(item: CatalogItem, priceList: PriceListId): number {
  const direct = item.prices[priceList];
  if (typeof direct === 'number') return direct;
  // Fall back to any published price so the item stays usable.
  const first = Object.values(item.prices)[0];
  return typeof first === 'number' ? first : 0;
}

export function findCatalogItem(code: string): CatalogItem | undefined {
  return SUPPLEMENT_CATALOG.find((c) => c.code === code);
}

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUPPLEMENT_CATALOG;
  const terms = q.split(/\s+/);
  return SUPPLEMENT_CATALOG.filter((item) => {
    const haystack = `${item.description} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
