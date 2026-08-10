import { CatalogItem } from '../types/supplement_types';

// ---------------------------------------------------------------
// Supplement line-item catalog (Xactimate-style CAT/SEL code format)
//
// Codes follow the category/selector convention used across the
// insurance restoration industry. Descriptions are written in
// standard trade language. Unit prices are EDITABLE regional
// defaults — always verify against the current published price
// list for your area before submitting.
// ---------------------------------------------------------------

export const TRADE_NAMES: Record<string, string> = {
  RFG: 'Roofing',
  DRY: 'Drywall',
  PNT: 'Painting',
  SFG: 'Soffit, Fascia & Gutter',
  SDG: 'Siding',
  WDR: 'Windows - Reglazing & Repair',
  ELE: 'Electrical',
  HVC: 'Heat, Vent & Air Conditioning',
  DMO: 'General Demolition',
  DBR: 'Debris Removal',
  LAB: 'Labor Only',
  SCF: 'Scaffolding',
  TMP: 'Temporary Repairs',
  WTR: 'Water Extraction & Remediation',
  FRM: 'Framing & Rough Carpentry',
  INS: 'Insulation',
  STU: 'Stucco & Exterior Plaster',
  FEN: 'Fencing',
  AWN: 'Awnings & Patio Covers',
  CNC: 'Concrete & Asphalt'
};

export const SUPPLEMENT_CATALOG: CatalogItem[] = [
  // ---------------- ROOFING (RFG) ----------------
  { cat: 'RFG', sel: '220', description: 'Remove 3 tab - 20 yr. - composition shingle roofing (incl. felt)', unit: 'SQ', unitPrice: 62.18, nonDepreciable: true, materialRatio: 0, tags: ['tear off', 'shingle', 'removal'] },
  { cat: 'RFG', sel: '220E', description: '3 tab - 20 yr. - composition shingle roofing (incl. felt)', unit: 'SQ', unitPrice: 251.42, lifeYears: 20, materialRatio: 0.55, tags: ['shingle', '3-tab'] },
  { cat: 'RFG', sel: '240', description: 'Remove Laminated - comp. shingle rfg. - w/out felt', unit: 'SQ', unitPrice: 64.35, nonDepreciable: true, materialRatio: 0, tags: ['tear off', 'laminated', 'architectural', 'removal'] },
  { cat: 'RFG', sel: '240E', description: 'Laminated - comp. shingle rfg. - w/out felt', unit: 'SQ', unitPrice: 268.71, lifeYears: 30, materialRatio: 0.58, tags: ['laminated', 'architectural', 'dimensional', 'shingle'] },
  { cat: 'RFG', sel: '300', description: 'Remove Built-up 3 ply roofing - in. gravel/rock ballast', unit: 'SQ', unitPrice: 96.44, nonDepreciable: true, materialRatio: 0, tags: ['flat roof', 'built up', 'removal'] },
  { cat: 'RFG', sel: '300E', description: 'Built-up 3 ply roofing - incl. gravel/rock ballast', unit: 'SQ', unitPrice: 486.2, lifeYears: 20, materialRatio: 0.5, tags: ['flat roof', 'built up'] },
  { cat: 'RFG', sel: 'MOD', description: 'Modified bitumen roof', unit: 'SQ', unitPrice: 412.77, lifeYears: 20, materialRatio: 0.5, tags: ['flat roof', 'modified', 'torch down'] },
  { cat: 'RFG', sel: 'MODR', description: 'Remove Modified bitumen roof', unit: 'SQ', unitPrice: 82.62, nonDepreciable: true, materialRatio: 0, tags: ['flat roof', 'removal'] },
  { cat: 'RFG', sel: 'FELT15', description: 'Roofing felt - 15 lb.', unit: 'SQ', unitPrice: 32.85, lifeYears: 30, materialRatio: 0.5, tags: ['underlayment', 'felt', 'paper'] },
  { cat: 'RFG', sel: 'FELT30', description: 'Roofing felt - 30 lb.', unit: 'SQ', unitPrice: 41.6, lifeYears: 30, materialRatio: 0.5, tags: ['underlayment', 'felt', 'paper'] },
  { cat: 'RFG', sel: 'SYNFELT', description: 'Roofing felt - synthetic underlayment', unit: 'SQ', unitPrice: 46.62, lifeYears: 30, materialRatio: 0.55, tags: ['underlayment', 'synthetic'] },
  { cat: 'RFG', sel: 'IWS', description: 'Ice & water barrier', unit: 'SF', unitPrice: 1.63, lifeYears: 30, materialRatio: 0.55, tags: ['ice and water', 'shield', 'barrier', 'valley'] },
  { cat: 'RFG', sel: 'RIDGC', description: 'Ridge cap - composition shingles', unit: 'LF', unitPrice: 8.44, lifeYears: 30, materialRatio: 0.5, tags: ['ridge', 'cap', 'hip'] },
  { cat: 'RFG', sel: 'RIDGCH', description: 'Ridge cap - High profile - composition shingles', unit: 'LF', unitPrice: 10.71, lifeYears: 30, materialRatio: 0.5, tags: ['ridge', 'cap', 'high profile'] },
  { cat: 'RFG', sel: 'STRTR', description: 'Asphalt starter - universal starter course', unit: 'LF', unitPrice: 2.44, lifeYears: 30, materialRatio: 0.5, tags: ['starter', 'strip', 'eave', 'rake'] },
  { cat: 'RFG', sel: 'PSTRTR', description: 'Asphalt starter - peel and stick', unit: 'LF', unitPrice: 2.86, lifeYears: 30, materialRatio: 0.55, tags: ['starter', 'peel and stick'] },
  { cat: 'RFG', sel: 'DRIP', description: 'Drip edge', unit: 'LF', unitPrice: 3.42, lifeYears: 35, materialRatio: 0.45, tags: ['drip edge', 'metal', 'eave'] },
  { cat: 'RFG', sel: 'GRDRIP', description: 'Drip edge/gutter apron', unit: 'LF', unitPrice: 3.71, lifeYears: 35, materialRatio: 0.45, tags: ['gutter apron', 'drip edge'] },
  { cat: 'RFG', sel: 'FLPIPE', description: 'Flashing - pipe jack', unit: 'EA', unitPrice: 51.61, lifeYears: 30, materialRatio: 0.4, tags: ['pipe jack', 'flashing', 'boot', 'penetration'] },
  { cat: 'RFG', sel: 'FLPIPEL', description: 'Flashing - pipe jack - lead', unit: 'EA', unitPrice: 82.85, lifeYears: 35, materialRatio: 0.45, tags: ['pipe jack', 'lead', 'flashing'] },
  { cat: 'RFG', sel: 'FLCH', description: 'Chimney flashing - average (32" x 36")', unit: 'EA', unitPrice: 476.51, lifeYears: 35, materialRatio: 0.35, tags: ['chimney', 'flashing'] },
  { cat: 'RFG', sel: 'STEP', description: 'Step flashing', unit: 'LF', unitPrice: 10.22, lifeYears: 35, materialRatio: 0.35, tags: ['step flashing', 'wall'] },
  { cat: 'RFG', sel: 'FLASH', description: 'Flashing - L flashing - galvanized', unit: 'LF', unitPrice: 6.98, lifeYears: 35, materialRatio: 0.35, tags: ['flashing', 'headwall', 'apron'] },
  { cat: 'RFG', sel: 'VENTT', description: 'Roof vent - turtle type - metal', unit: 'EA', unitPrice: 88.83, lifeYears: 25, materialRatio: 0.45, tags: ['turtle vent', 'box vent', 'roof vent'] },
  { cat: 'RFG', sel: 'VENTR', description: 'Ridge vent - shingle-over style', unit: 'LF', unitPrice: 12.02, lifeYears: 25, materialRatio: 0.5, tags: ['ridge vent'] },
  { cat: 'RFG', sel: 'VENTB', description: 'Power attic vent cover only - metal', unit: 'EA', unitPrice: 156.83, lifeYears: 20, materialRatio: 0.55, tags: ['power vent', 'attic'] },
  { cat: 'RFG', sel: 'VENTE', description: 'Exhaust cap - through roof - 6" to 8"', unit: 'EA', unitPrice: 111.68, lifeYears: 25, materialRatio: 0.45, tags: ['exhaust cap', 'vent'] },
  { cat: 'RFG', sel: 'SKY', description: 'Skylight - flashing kit - dome type', unit: 'EA', unitPrice: 264.87, lifeYears: 25, materialRatio: 0.55, tags: ['skylight', 'flashing kit'] },
  { cat: 'RFG', sel: 'SATD', description: 'Satellite dish - Detach & reset', unit: 'EA', unitPrice: 42.55, nonDepreciable: true, materialRatio: 0, tags: ['satellite', 'detach', 'reset'] },
  { cat: 'RFG', sel: 'HIGH', description: 'Additional charge for high roof (2 stories or greater)', unit: 'SQ', unitPrice: 20.03, nonDepreciable: true, materialRatio: 0, tags: ['high charge', 'two story', 'steep'] },
  { cat: 'RFG', sel: 'STEEP', description: 'Additional charge for steep roof - 7/12 to 9/12 slope', unit: 'SQ', unitPrice: 45.51, nonDepreciable: true, materialRatio: 0, tags: ['steep charge', 'pitch', 'slope'] },
  { cat: 'RFG', sel: 'STEEP+', description: 'Additional charge for steep roof - 10/12 - 12/12 slope', unit: 'SQ', unitPrice: 71.36, nonDepreciable: true, materialRatio: 0, tags: ['steep charge', 'very steep'] },
  { cat: 'RFG', sel: 'SHTG', description: 'Sheathing - OSB - 7/16"', unit: 'SF', unitPrice: 2.32, lifeYears: 150, materialRatio: 0.5, tags: ['decking', 'osb', 'sheathing', 'plywood'] },
  { cat: 'RFG', sel: 'SHTGP', description: 'Sheathing - plywood - 1/2" CDX', unit: 'SF', unitPrice: 2.71, lifeYears: 150, materialRatio: 0.5, tags: ['decking', 'plywood', 'cdx'] },
  { cat: 'RFG', sel: 'ARMV', description: 'Remove Additional layer of comp. shingles (no haul off)', unit: 'SQ', unitPrice: 41.06, nonDepreciable: true, materialRatio: 0, tags: ['second layer', 'removal'] },
  { cat: 'RFG', sel: 'TILERC', description: 'Tile roofing - concrete - "S" or flat tile', unit: 'SQ', unitPrice: 792.4, lifeYears: 50, materialRatio: 0.55, tags: ['tile', 'concrete'] },
  { cat: 'RFG', sel: 'TILERCR', description: 'Remove Tile roofing - concrete', unit: 'SQ', unitPrice: 145.88, nonDepreciable: true, materialRatio: 0, tags: ['tile', 'removal'] },
  { cat: 'RFG', sel: 'MTL', description: 'Metal roofing - standing seam', unit: 'SQ', unitPrice: 1128.66, lifeYears: 50, materialRatio: 0.6, tags: ['metal', 'standing seam'] },
  { cat: 'RFG', sel: 'MTLR', description: 'Remove Metal roofing - standing seam', unit: 'SQ', unitPrice: 116.51, nonDepreciable: true, materialRatio: 0, tags: ['metal', 'removal'] },
  { cat: 'RFG', sel: 'VALMTL', description: 'Valley metal - (W) profile - painted', unit: 'LF', unitPrice: 8.94, lifeYears: 35, materialRatio: 0.45, tags: ['valley', 'metal', 'w valley'] },

  // ---------------- SOFFIT, FASCIA & GUTTER (SFG) ----------------
  { cat: 'SFG', sel: 'GUT5', description: 'Gutter / downspout - aluminum - up to 5"', unit: 'LF', unitPrice: 9.6, lifeYears: 25, materialRatio: 0.45, tags: ['gutter', 'aluminum', 'downspout'] },
  { cat: 'SFG', sel: 'GUT6', description: 'Gutter / downspout - aluminum - 6"', unit: 'LF', unitPrice: 11.72, lifeYears: 25, materialRatio: 0.45, tags: ['gutter', '6 inch'] },
  { cat: 'SFG', sel: 'GUTR', description: 'Remove Gutter / downspout - aluminum', unit: 'LF', unitPrice: 1.72, nonDepreciable: true, materialRatio: 0, tags: ['gutter', 'removal'] },
  { cat: 'SFG', sel: 'GUARD', description: 'Gutter guard/screen', unit: 'LF', unitPrice: 8.13, lifeYears: 20, materialRatio: 0.55, tags: ['gutter guard', 'screen', 'leaf'] },
  { cat: 'SFG', sel: 'FASCM', description: 'Fascia - metal - 6"', unit: 'LF', unitPrice: 6.11, lifeYears: 35, materialRatio: 0.4, tags: ['fascia', 'metal wrap'] },
  { cat: 'SFG', sel: 'FASCW', description: 'Fascia - 1" x 6" - #2 pine', unit: 'LF', unitPrice: 7.53, lifeYears: 60, materialRatio: 0.4, tags: ['fascia', 'wood'] },
  { cat: 'SFG', sel: 'SOFM', description: 'Soffit - metal', unit: 'SF', unitPrice: 8.31, lifeYears: 35, materialRatio: 0.45, tags: ['soffit', 'metal'] },
  { cat: 'SFG', sel: 'SOFV', description: 'Soffit - vinyl', unit: 'SF', unitPrice: 6.4, lifeYears: 30, materialRatio: 0.45, tags: ['soffit', 'vinyl'] },

  // ---------------- SIDING (SDG) ----------------
  { cat: 'SDG', sel: 'VNYL', description: 'Siding - vinyl', unit: 'SF', unitPrice: 5.28, lifeYears: 35, materialRatio: 0.5, tags: ['vinyl siding'] },
  { cat: 'SDG', sel: 'VNYLR', description: 'Remove Siding - vinyl', unit: 'SF', unitPrice: 0.68, nonDepreciable: true, materialRatio: 0, tags: ['vinyl', 'removal'] },
  { cat: 'SDG', sel: 'ALUM', description: 'Siding - aluminum (.024 thickness)', unit: 'SF', unitPrice: 6.41, lifeYears: 40, materialRatio: 0.5, tags: ['aluminum siding'] },
  { cat: 'SDG', sel: 'WRAP', description: 'House wrap (air/moisture barrier)', unit: 'SF', unitPrice: 0.51, lifeYears: 35, materialRatio: 0.5, tags: ['house wrap', 'tyvek style barrier'] },
  { cat: 'SDG', sel: 'FCLAP', description: 'Siding - fiber cement lap siding', unit: 'SF', unitPrice: 7.62, lifeYears: 50, materialRatio: 0.45, tags: ['fiber cement', 'hardie style lap'] },

  // ---------------- WINDOWS (WDR) ----------------
  { cat: 'WDR', sel: 'GLAZ', description: 'Reglaze window - 10 - 16 sf', unit: 'EA', unitPrice: 156.72, nonDepreciable: true, materialRatio: 0.35, tags: ['window', 'glass', 'reglaze'] },
  { cat: 'WDR', sel: 'SCRN', description: 'Window screen - up to 9 SF', unit: 'EA', unitPrice: 44.44, lifeYears: 15, materialRatio: 0.5, tags: ['screen', 'window'] },
  { cat: 'WDR', sel: 'WRAPW', description: 'Wrap wood window frame & trim with aluminum (PER LF)', unit: 'LF', unitPrice: 12.63, lifeYears: 35, materialRatio: 0.35, tags: ['window wrap', 'aluminum', 'cladding'] },

  // ---------------- DRYWALL (DRY) ----------------
  { cat: 'DRY', sel: '1/2', description: '1/2" drywall - hung, taped, floated, ready for paint', unit: 'SF', unitPrice: 2.68, lifeYears: 150, materialRatio: 0.3, tags: ['drywall', 'sheetrock', 'ceiling', 'wall'] },
  { cat: 'DRY', sel: '5/8', description: '5/8" drywall - hung, taped, floated, ready for paint', unit: 'SF', unitPrice: 2.89, lifeYears: 150, materialRatio: 0.3, tags: ['drywall', 'ceiling'] },
  { cat: 'DRY', sel: 'PATCH', description: 'Drywall patch / small repair, ready for paint', unit: 'EA', unitPrice: 82.71, nonDepreciable: true, materialRatio: 0.2, tags: ['patch', 'repair', 'water stain'] },
  { cat: 'DRY', sel: 'TEXSP', description: 'Texture drywall - machine - knockdown', unit: 'SF', unitPrice: 0.62, lifeYears: 150, materialRatio: 0.25, tags: ['texture', 'knockdown'] },

  // ---------------- PAINTING (PNT) ----------------
  { cat: 'PNT', sel: 'SP', description: 'Seal/prime then paint the surface area (2 coats)', unit: 'SF', unitPrice: 1.24, lifeYears: 15, materialRatio: 0.25, tags: ['paint', 'seal', 'prime', 'ceiling', 'wall'] },
  { cat: 'PNT', sel: 'ST', description: 'Stain & finish wood (2 coats)', unit: 'SF', unitPrice: 1.94, lifeYears: 15, materialRatio: 0.25, tags: ['stain', 'wood'] },
  { cat: 'PNT', sel: 'FAC', description: 'Paint fascia - wood - 4"- 6" wide', unit: 'LF', unitPrice: 1.55, lifeYears: 15, materialRatio: 0.2, tags: ['paint', 'fascia'] },
  { cat: 'PNT', sel: 'X1', description: 'Paint door or window opening - 1 coat (per side)', unit: 'EA', unitPrice: 32.83, lifeYears: 15, materialRatio: 0.2, tags: ['paint', 'door', 'window'] },

  // ---------------- GENERAL DEMOLITION / DEBRIS (DMO/DBR) ----------------
  { cat: 'DBR', sel: 'DUMP', description: 'Dumpster load - approx. 30 yards, 5-7 tons of debris', unit: 'EA', unitPrice: 632.42, nonDepreciable: true, materialRatio: 0, tags: ['dumpster', 'debris', 'haul'] },
  { cat: 'DBR', sel: 'HAUL', description: 'Haul debris - per pickup truck load - including dump fees', unit: 'EA', unitPrice: 148.94, nonDepreciable: true, materialRatio: 0, tags: ['haul', 'debris'] },

  // ---------------- TEMPORARY REPAIRS (TMP) ----------------
  { cat: 'TMP', sel: 'TARP', description: 'R&R Tarp - all-purpose poly - per sq ft (labor and material)', unit: 'SF', unitPrice: 1.16, nonDepreciable: true, materialRatio: 0.4, tags: ['tarp', 'emergency', 'temporary'] },
  { cat: 'TMP', sel: 'BOARD', description: 'Board up window or opening with plywood', unit: 'SF', unitPrice: 4.32, nonDepreciable: true, materialRatio: 0.4, tags: ['board up', 'emergency'] },

  // ---------------- LABOR / EQUIPMENT (LAB/SCF) ----------------
  { cat: 'LAB', sel: 'RFG', description: 'Roofing labor - per hour', unit: 'HR', unitPrice: 86.41, nonDepreciable: true, materialRatio: 0, tags: ['labor', 'hourly'] },
  { cat: 'LAB', sel: 'SUPV', description: 'On-site supervision / project management - per hour', unit: 'HR', unitPrice: 71.51, nonDepreciable: true, materialRatio: 0, tags: ['supervision', 'pm'] },
  { cat: 'SCF', sel: 'SETUP', description: 'Scaffold - per section (per week)', unit: 'EA', unitPrice: 46.28, nonDepreciable: true, materialRatio: 0, tags: ['scaffold'] },

  // ---------------- HVAC / ELECTRICAL ----------------
  { cat: 'HVC', sel: 'COMBFIN', description: 'Comb A/C condenser fins - w/out trip charge', unit: 'EA', unitPrice: 54.94, nonDepreciable: true, materialRatio: 0, tags: ['ac', 'condenser', 'fins', 'hail'] },
  { cat: 'HVC', sel: 'CONDCVR', description: 'A/C condenser cover/hail guard', unit: 'EA', unitPrice: 197.71, lifeYears: 20, materialRatio: 0.6, tags: ['condenser', 'hail guard'] },
  { cat: 'ELE', sel: 'FIXT', description: 'Exterior light fixture - Detach & reset', unit: 'EA', unitPrice: 46.94, nonDepreciable: true, materialRatio: 0, tags: ['light', 'fixture', 'detach'] },

  // ---------------- FRAMING / INSULATION ----------------
  { cat: 'FRM', sel: '2X4', description: '2" x 4" lumber (per LF)', unit: 'LF', unitPrice: 3.21, lifeYears: 150, materialRatio: 0.5, tags: ['lumber', 'framing'] },
  { cat: 'INS', sel: 'BATR19', description: 'Batt insulation - 6" - R19', unit: 'SF', unitPrice: 1.31, lifeYears: 100, materialRatio: 0.55, tags: ['insulation', 'batt'] },
  { cat: 'INS', sel: 'BLOW', description: 'Blown-in insulation - 12" depth - R30', unit: 'SF', unitPrice: 1.62, lifeYears: 100, materialRatio: 0.5, tags: ['insulation', 'blown'] },

  // ---------------- FENCE / AWNING / CONCRETE ----------------
  { cat: 'FEN', sel: 'WD6', description: 'Wood fence 5 ft to 6 ft high - material grade cedar', unit: 'LF', unitPrice: 34.83, lifeYears: 25, materialRatio: 0.5, tags: ['fence', 'wood', 'cedar'] },
  { cat: 'AWN', sel: 'ALUM', description: 'Awning - aluminum - patio cover style (per SF)', unit: 'SF', unitPrice: 15.87, lifeYears: 30, materialRatio: 0.55, tags: ['awning', 'patio cover'] },
  { cat: 'CNC', sel: 'FLAT', description: 'Concrete flatwork - 4" slab (incl. finish)', unit: 'SF', unitPrice: 7.79, lifeYears: 100, materialRatio: 0.45, tags: ['concrete', 'driveway', 'slab'] }
];

export function catalogKey(item: Pick<CatalogItem, 'cat' | 'sel'>): string {
  return `${item.cat} ${item.sel}`;
}

export function searchCatalog(query: string): CatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUPPLEMENT_CATALOG;
  const terms = q.split(/\s+/);
  return SUPPLEMENT_CATALOG.filter((item) => {
    const haystack = `${item.cat} ${item.sel} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
