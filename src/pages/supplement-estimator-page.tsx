import React from 'react';
import DefaultPageHeader from '../components/ui/page-header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import {
  CalculatorIcon,
  ClipboardPasteIcon,
  CloudDownloadIcon,
  CopyIcon,
  FilePlusIcon,
  FileTextIcon,
  HardHatIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  WandSparklesIcon,
  ZapIcon,
  CheckCircle2Icon,
  AlertCircleIcon
} from 'lucide-react';
import {
  SupplementEstimate,
  SupplementLineItem,
  RoofMeasurements,
  CatalogItem,
  PriceListId
} from '../types/supplement_types';
import {
  calcEstimateTotals,
  calcLineItemTotals,
  ageBasedDepreciationPct,
  parseRoofReport,
  generateScopeFromMeasurements,
  lineItemFromCatalog,
  newEstimate,
  loadEstimates,
  upsertEstimate,
  deleteEstimate,
  toEstimateName,
  findCatalogItem,
  LABOR_MINIMUM_SECTION,
  buildEstimateFromReports,
  autoLaborMinimums
} from '../lib/supplement-utils';
import { searchCatalog, PRICE_LISTS, priceFor } from '../data/supplement-catalog';
import SupplementDocument from '../components/pdf-render/supplement-doc';

// ------------------------------------------------------------------
// Supplement estimate creator, in the format Diversity Roofing issues.
// ------------------------------------------------------------------

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function NumField({
  label,
  value,
  onChange,
  suffix
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">
        {label}
        {suffix ? ` (${suffix})` : ''}
      </Label>
      <Input
        type="number"
        step="any"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="h-8"
      />
    </div>
  );
}

function TxtField({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-8"
      />
    </div>
  );
}

export default function SupplementEstimatorPage() {
  const { toast } = useToast();
  const [estimates, setEstimates] = React.useState<SupplementEstimate[]>(() => loadEstimates());
  const [estimate, setEstimate] = React.useState<SupplementEstimate>(() => {
    const existing = loadEstimates();
    return existing.length > 0 ? existing[0] : newEstimate();
  });
  const [catalogQuery, setCatalogQuery] = React.useState('');
  const [reportText, setReportText] = React.useState('');
  const [reportOpen, setReportOpen] = React.useState(false);
  const [pdfOpen, setPdfOpen] = React.useState(false);
  const [roofAgeYears, setRoofAgeYears] = React.useState<number | undefined>(undefined);
  const [fullDeckMembrane, setFullDeckMembrane] = React.useState(false);
  const [targetArea, setTargetArea] = React.useState('Exterior');
  const [targetRoom, setTargetRoom] = React.useState('Dwelling Roof');
  const [autoRoofText, setAutoRoofText] = React.useState('');
  const [autoAdjusterText, setAutoAdjusterText] = React.useState('');
  const [autoResult, setAutoResult] = React.useState<{
    resolved: string[];
    needsAttention: string[];
  } | null>(null);

  const totals = React.useMemo(
    () => calcEstimateTotals(estimate.lineItems, estimate.settings),
    [estimate.lineItems, estimate.settings]
  );
  const catalogResults = React.useMemo(() => searchCatalog(catalogQuery), [catalogQuery]);

  const update = (patch: Partial<SupplementEstimate>) =>
    setEstimate((prev) => ({ ...prev, ...patch }));
  const updateClaim = (patch: Partial<SupplementEstimate['claim']>) =>
    setEstimate((prev) => ({ ...prev, claim: { ...prev.claim, ...patch } }));
  const updateSettings = (patch: Partial<SupplementEstimate['settings']>) =>
    setEstimate((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  const updateMeasurements = (patch: Partial<RoofMeasurements>) =>
    setEstimate((prev) => ({ ...prev, measurements: { ...prev.measurements, ...patch } }));
  const updateLineItem = (id: string, patch: Partial<SupplementLineItem>) =>
    setEstimate((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li))
    }));
  const removeLineItem = (id: string) =>
    setEstimate((prev) => ({ ...prev, lineItems: prev.lineItems.filter((li) => li.id !== id) }));

  /** Switching price list re-prices every line that came from the catalog. */
  const changePriceList = (id: PriceListId) => {
    const list = PRICE_LISTS.find((p) => p.id === id);
    setEstimate((prev) => ({
      ...prev,
      claim: { ...prev.claim, priceList: id },
      settings: {
        ...prev.settings,
        salesTaxPct: list?.defaultSalesTaxPct ?? prev.settings.salesTaxPct
      },
      lineItems: prev.lineItems.map((li) => {
        const entry = li.code ? findCatalogItem(li.code) : undefined;
        return entry ? { ...li, unitPrice: priceFor(entry, id) } : li;
      })
    }));
    toast({
      title: `Price list set to ${id}`,
      description: 'Catalog line items were re-priced to this list.'
    });
  };

  const addCatalogItem = (entry: CatalogItem) => {
    const item = lineItemFromCatalog(entry, 1, estimate.claim.priceList, {
      area: entry.laborMinimum ? LABOR_MINIMUM_SECTION : targetArea,
      room: entry.laborMinimum ? LABOR_MINIMUM_SECTION : targetRoom
    });
    if (!item.nonDepreciable && roofAgeYears) {
      item.depreciationPct = ageBasedDepreciationPct(roofAgeYears, entry.lifeYears);
    }
    setEstimate((prev) => ({ ...prev, lineItems: [...prev.lineItems, item] }));
    toast({ title: 'Line item added', description: entry.description });
  };

  /** One button: pasted reports in, complete estimate out. */
  const handleAutoBuild = () => {
    if (!autoRoofText.trim() && !autoAdjusterText.trim()) {
      toast({
        title: 'Paste a report first',
        description: 'Add a roof report, an adjuster report, or both.',
        variant: 'destructive'
      });
      return;
    }
    const result = buildEstimateFromReports(autoRoofText, autoAdjusterText || undefined);
    setEstimate(result.estimate);
    setAutoResult({ resolved: result.resolved, needsAttention: result.needsAttention });
    const totalsNow = calcEstimateTotals(result.estimate.lineItems, result.estimate.settings);
    toast({
      title: `Estimate built — RCV ${money(totalsNow.rcv)}`,
      description: `${result.estimate.lineItems.length} line items, ${result.resolved.length} details resolved automatically.`
    });
  };

  const handleApplyLaborMinimums = () => {
    const added = autoLaborMinimums(estimate.lineItems, estimate.claim.priceList);
    if (added.length === 0) {
      toast({ title: 'No labor minimums needed', description: 'Every trade is above its minimum.' });
      return;
    }
    setEstimate((prev) => ({ ...prev, lineItems: [...prev.lineItems, ...added] }));
    toast({ title: `Applied ${added.length} trade labor minimum(s)` });
  };

  const handleParseReport = () => {
    const parsed = parseRoofReport(reportText);
    const found = Object.entries(parsed).filter(([, v]) => v !== undefined);
    if (found.length === 0) {
      toast({
        title: 'No measurements found',
        description: 'Could not read values from that text. Enter them manually below.',
        variant: 'destructive'
      });
      return;
    }
    updateMeasurements(parsed);
    setReportOpen(false);
    toast({
      title: `Imported ${found.length} measurements`,
      description: 'Review the values, then use Generate Scope.'
    });
  };

  const handleGenerateScope = () => {
    const generated = generateScopeFromMeasurements(
      estimate.measurements,
      estimate.claim.priceList,
      { area: targetArea, room: targetRoom, fullDeckMembrane }
    );
    if (generated.length === 0) {
      toast({
        title: 'Total roof area required',
        description: 'Enter the total roof area before generating a scope.',
        variant: 'destructive'
      });
      return;
    }
    if (roofAgeYears) {
      for (const item of generated) {
        if (item.nonDepreciable) continue;
        const entry = item.code ? findCatalogItem(item.code) : undefined;
        item.depreciationPct = ageBasedDepreciationPct(roofAgeYears, entry?.lifeYears);
      }
    }
    setEstimate((prev) => ({ ...prev, lineItems: [...prev.lineItems, ...generated] }));
    toast({
      title: `Generated ${generated.length} line items`,
      description: `Roof replacement scope written into ${targetArea} › ${targetRoom}.`
    });
  };

  const applyAgeDepreciation = () => {
    if (!roofAgeYears) return;
    setEstimate((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((li) => {
        if (li.nonDepreciable) return li;
        const entry = li.code ? findCatalogItem(li.code) : undefined;
        return { ...li, depreciationPct: ageBasedDepreciationPct(roofAgeYears, entry?.lifeYears) };
      })
    }));
    toast({ title: `Applied ${roofAgeYears}-year depreciation to depreciable items` });
  };

  const handleSave = () => {
    setEstimates(upsertEstimate(estimate));
    toast({ title: 'Estimate saved', description: estimate.title });
  };
  const handleNew = () => {
    setEstimate(newEstimate());
    toast({ title: 'New estimate started' });
  };
  const handleDelete = (id: string) => {
    const all = deleteEstimate(id);
    setEstimates(all);
    if (estimate.id === id) setEstimate(all[0] ?? newEstimate());
    toast({ title: 'Estimate deleted' });
  };
  const handleDuplicate = () => {
    const copy: SupplementEstimate = {
      ...newEstimate(),
      title: `${estimate.title} (Copy)`,
      claim: { ...estimate.claim },
      measurements: { ...estimate.measurements },
      settings: { ...estimate.settings },
      lineItems: estimate.lineItems.map((li) => ({
        ...li,
        id: `${li.id}-c${Math.random().toString(36).slice(2, 6)}`
      }))
    };
    setEstimate(copy);
    toast({ title: 'Estimate duplicated' });
  };

  const m = estimate.measurements;
  const fileName = `Supplement Estimate - ${
    estimate.claim.propertyAddress || estimate.claim.estimateName || 'Estimate'
  }.pdf`;

  // Distinct area/room pairs already used, offered as quick targets.
  const placements = React.useMemo(() => {
    const set = new Set<string>();
    for (const li of estimate.lineItems) {
      if (!li.laborMinimum) set.add(`${li.area}||${li.room}`);
    }
    set.add('Exterior||Dwelling Roof');
    return Array.from(set).map((k) => {
      const [area, room] = k.split('||');
      return { area, room };
    });
  }, [estimate.lineItems]);

  return (
    <div className="flex flex-col w-full gap-6 mb-6">
      <DefaultPageHeader
        title="Supplements"
        subheading="Write supplement estimates in the Diversity Roofing format — per-line O&P, RCV / depreciation / ACV, and the full recap pages."
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={estimate.id}
          onValueChange={(id) => {
            const found = estimates.find((e) => e.id === id);
            if (found) setEstimate(found);
          }}>
          <SelectTrigger className="w-[260px] h-9">
            <SelectValue placeholder="Saved estimates" />
          </SelectTrigger>
          <SelectContent>
            {(estimates.some((e) => e.id === estimate.id)
              ? estimates
              : [estimate, ...estimates]
            ).map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleNew}>
          <FilePlusIcon className="w-4 h-4 mr-1" /> New
        </Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate}>
          <CopyIcon className="w-4 h-4 mr-1" /> Duplicate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(estimate.id)}
          disabled={!estimates.some((e) => e.id === estimate.id)}>
          <Trash2Icon className="w-4 h-4 mr-1" /> Delete
        </Button>
        <div className="flex-1" />
        <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={estimate.lineItems.length === 0}>
              <FileTextIcon className="w-4 h-4 mr-1" /> Preview PDF
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl h-[88vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Supplement Estimate</DialogTitle>
              <DialogDescription>
                {estimate.claim.estimateName || estimate.title} — RCV {money(totals.rcv)}
              </DialogDescription>
            </DialogHeader>
            {pdfOpen && (
              <PDFViewer className="w-full flex-1 rounded-md border" showToolbar>
                <SupplementDocument estimate={estimate} />
              </PDFViewer>
            )}
            <DialogFooter>
              <PDFDownloadLink
                document={<SupplementDocument estimate={estimate} />}
                fileName={fileName}>
                <Button>
                  <CloudDownloadIcon className="w-4 h-4 mr-1" /> Download PDF
                </Button>
              </PDFDownloadLink>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button size="sm" onClick={handleSave}>
          Save Estimate
        </Button>
      </div>

      {/* Auto-build: paste reports, get a finished estimate */}
      <Card className="border-blue-500/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ZapIcon className="w-4 h-4 text-blue-500" /> Build Estimate Automatically
          </CardTitle>
          <CardDescription>
            Paste the roof report and the adjuster report. Everything that can be derived is —
            measurements, claim details, price list and tax for the state, the code path for the
            secondary water barrier, waste factor from the report&apos;s own table, the full line-item
            scope with code citations, and trade labor minimums.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">
                Roof report text (Roofr / QuickMeasure / EagleView)
              </Label>
              <Textarea
                rows={7}
                value={autoRoofText}
                onChange={(e) => setAutoRoofText(e.target.value)}
                placeholder={
                  '1923 Sterling Lane, Fernandina Beach, FL 32034\nTotal roof area 2802 sqft\nPredominant pitch 6/12\nTotal eaves 188ft 7in\nTotal rakes 79ft 8in\nHips + ridges 150ft 3in\nTotal valleys 41ft 2in\nTotal step flashing 45ft 0in\nRecommended\nWaste % 0% 10% 12% 15% 17% 20% 22%'
                }
                className="text-xs font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">
                Adjuster report / loss notice (optional)
              </Label>
              <Textarea
                rows={7}
                value={autoAdjusterText}
                onChange={(e) => setAutoAdjusterText(e.target.value)}
                placeholder={
                  'Insured: Corrine Mulligan\nClaim Number: FL26-0109563-J926\nPolicy Number: 1504-2001-0576\nType of Loss: Wind Damage\nDate of Loss: 3/16/2026\nDate Inspected: 7/7/2026\nDeductible: $1,000.00'
                }
                className="text-xs font-mono"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleAutoBuild}>
              <ZapIcon className="w-4 h-4 mr-1" /> Build Complete Estimate
            </Button>
            <span className="text-xs text-muted-foreground">
              Replaces the current estimate. Everything stays editable afterwards.
            </span>
          </div>

          {autoResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="rounded-md border p-3">
                <p className="text-xs font-medium flex items-center gap-1 mb-2">
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-green-600" /> Resolved
                  automatically
                </p>
                <ul className="text-xs text-muted-foreground flex flex-col gap-1">
                  {autoResult.resolved.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs font-medium flex items-center gap-1 mb-2">
                  <AlertCircleIcon className="w-3.5 h-3.5 text-amber-500" /> Needs your input
                </p>
                {autoResult.needsAttention.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nothing outstanding — the estimate is ready to review.
                  </p>
                ) : (
                  <ul className="text-xs text-muted-foreground flex flex-col gap-1">
                    {autoResult.needsAttention.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Claim information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HardHatIcon className="w-4 h-4" /> Claim Information
              </CardTitle>
              <CardDescription>Prints as the header block on page 1.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <TxtField
                label="Estimate Title (internal)"
                value={estimate.title}
                onChange={(v) => update({ title: v })}
              />
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Insured Name</Label>
                <Input
                  className="h-8"
                  value={estimate.claim.insuredName}
                  onChange={(e) => {
                    const insuredName = e.target.value;
                    updateClaim({
                      insuredName,
                      estimateName: toEstimateName(insuredName)
                    });
                  }}
                />
              </div>
              <TxtField
                label="Estimate Name"
                value={estimate.claim.estimateName}
                onChange={(v) => updateClaim({ estimateName: toEstimateName(v) })}
                placeholder="CORRINE-MULLIGAN"
              />
              <TxtField
                label="Home Phone"
                value={estimate.claim.insuredHomePhone}
                onChange={(v) => updateClaim({ insuredHomePhone: v })}
              />
              <TxtField
                label="Cellular"
                value={estimate.claim.insuredCellPhone}
                onChange={(v) => updateClaim({ insuredCellPhone: v })}
              />
              <TxtField
                label="E-mail"
                value={estimate.claim.insuredEmail}
                onChange={(v) => updateClaim({ insuredEmail: v })}
              />
              <TxtField
                label="Property Address"
                value={estimate.claim.propertyAddress}
                onChange={(v) => updateClaim({ propertyAddress: v })}
                placeholder="1923 Sterling Ln"
              />
              <TxtField
                label="Property City, State ZIP"
                value={estimate.claim.propertyCityStateZip}
                onChange={(v) => updateClaim({ propertyCityStateZip: v })}
                placeholder="Fernandina Beach, FL 32034"
              />
              <TxtField
                label="Mailing Address (if different)"
                value={estimate.claim.mailingAddress}
                onChange={(v) => updateClaim({ mailingAddress: v })}
              />
              <TxtField
                label="Mailing City, State ZIP"
                value={estimate.claim.mailingCityStateZip}
                onChange={(v) => updateClaim({ mailingCityStateZip: v })}
              />
              <TxtField
                label="Claim Number"
                value={estimate.claim.claimNumber}
                onChange={(v) => updateClaim({ claimNumber: v })}
                placeholder="FL26-0109563-J926"
              />
              <TxtField
                label="Policy Number"
                value={estimate.claim.policyNumber}
                onChange={(v) => updateClaim({ policyNumber: v })}
              />
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Type of Loss</Label>
                <Select
                  value={estimate.claim.typeOfLoss}
                  onValueChange={(v) => updateClaim({ typeOfLoss: v })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Wind Damage',
                      'Hail Damage',
                      'Hail and Wind damage',
                      'Hurricane',
                      'Water Damage - Non Weather Related',
                      'Fallen Tree',
                      'Fire',
                      'Other'
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TxtField
                label="Date of Loss"
                value={estimate.claim.dateOfLoss}
                onChange={(v) => updateClaim({ dateOfLoss: v })}
                placeholder="3/16/2026"
              />
              <TxtField
                label="Date Contacted"
                value={estimate.claim.dateContacted}
                onChange={(v) => updateClaim({ dateContacted: v })}
              />
              <TxtField
                label="Date Received"
                value={estimate.claim.dateReceived}
                onChange={(v) => updateClaim({ dateReceived: v })}
              />
              <TxtField
                label="Date Inspected"
                value={estimate.claim.dateInspected}
                onChange={(v) => updateClaim({ dateInspected: v })}
              />
              <TxtField
                label="Date Entered"
                value={estimate.claim.dateEntered}
                onChange={(v) => updateClaim({ dateEntered: v })}
              />
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Price List</Label>
                <Select
                  value={estimate.claim.priceList}
                  onValueChange={(v) => changePriceList(v as PriceListId)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_LISTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label} — {p.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TxtField
                label="Estimator"
                value={estimate.claim.estimator}
                onChange={(v) => updateClaim({ estimator: v })}
              />
              <TxtField
                label="Business Phone"
                value={estimate.claim.businessPhone}
                onChange={(v) => updateClaim({ businessPhone: v })}
              />
              <TxtField
                label="Operator"
                value={estimate.claim.operator}
                onChange={(v) => updateClaim({ operator: v })}
                placeholder="HAYAT"
              />
              <TxtField
                label="Labor Efficiency"
                value={estimate.claim.laborEfficiency}
                onChange={(v) => updateClaim({ laborEfficiency: v })}
              />
            </CardContent>
          </Card>

          {/* Roof measurements */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalculatorIcon className="w-4 h-4" /> Roof Measurements
                  </CardTitle>
                  <CardDescription>
                    Paste a Roofr or QuickMeasure report, then generate the replacement scope.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ClipboardPasteIcon className="w-4 h-4 mr-1" /> Paste Roof Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Paste Roof Report Text</DialogTitle>
                        <DialogDescription>
                          Works with Roofr (&ldquo;Total eaves 188ft 7in&rdquo;) and QuickMeasure
                          (&ldquo;Eaves 184 ft&rdquo;) style reports, including the combined
                          &ldquo;Hips + ridges&rdquo; and &ldquo;Eaves + rakes&rdquo; figures.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        rows={12}
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder={
                          'Total roof area 2802 sqft\nPredominant pitch 6/12\nTotal eaves 188ft 7in\nTotal rakes 79ft 8in\nTotal hips 98ft 0in\nTotal ridges 52ft 3in\nTotal valleys 41ft 2in\nTotal wall flashing 17ft 0in\nTotal step flashing 45ft 0in\nHips + ridges 150ft 3in\nEaves + rakes 268ft 3in'
                        }
                      />
                      <DialogFooter>
                        <Button onClick={handleParseReport}>
                          <WandSparklesIcon className="w-4 h-4 mr-1" /> Extract Measurements
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" onClick={handleGenerateScope}>
                    <WandSparklesIcon className="w-4 h-4 mr-1" /> Generate Scope
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NumField
                label="Total Roof Area"
                suffix="sq ft"
                value={m.totalRoofAreaSqFt}
                onChange={(v) => updateMeasurements({ totalRoofAreaSqFt: v })}
              />
              <NumField
                label="Eaves"
                suffix="LF"
                value={m.eaveLf}
                onChange={(v) => updateMeasurements({ eaveLf: v })}
              />
              <NumField
                label="Rakes"
                suffix="LF"
                value={m.rakeLf}
                onChange={(v) => updateMeasurements({ rakeLf: v })}
              />
              <NumField
                label="Eaves + Rakes"
                suffix="LF"
                value={m.starterLf}
                onChange={(v) => updateMeasurements({ starterLf: v, dripEdgeLf: v })}
              />
              <NumField
                label="Ridges"
                suffix="LF"
                value={m.ridgeLf}
                onChange={(v) => updateMeasurements({ ridgeLf: v })}
              />
              <NumField
                label="Hips"
                suffix="LF"
                value={m.hipLf}
                onChange={(v) => updateMeasurements({ hipLf: v })}
              />
              <NumField
                label="Hips + Ridges"
                suffix="LF"
                value={m.ridgeCapLf}
                onChange={(v) => updateMeasurements({ ridgeCapLf: v })}
              />
              <NumField
                label="Valleys"
                suffix="LF"
                value={m.valleyLf}
                onChange={(v) => updateMeasurements({ valleyLf: v })}
              />
              <NumField
                label="Wall Flashing"
                suffix="LF"
                value={m.wallFlashingLf}
                onChange={(v) => updateMeasurements({ wallFlashingLf: v })}
              />
              <NumField
                label="Step Flashing"
                suffix="LF"
                value={m.stepFlashingLf}
                onChange={(v) => updateMeasurements({ stepFlashingLf: v })}
              />
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Predominant Pitch</Label>
                <Select
                  value={m.predominantPitch ?? ''}
                  onValueChange={(v) => updateMeasurements({ predominantPitch: v })}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="x/12" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => `${i + 1}/12`).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <NumField
                label="Stories"
                value={m.stories}
                onChange={(v) => updateMeasurements({ stories: v })}
              />
              <NumField
                label="Pipe Jacks"
                suffix="EA"
                value={m.pipeJacks}
                onChange={(v) => updateMeasurements({ pipeJacks: v })}
              />
              <NumField
                label="Off-Ridge Vents"
                suffix="EA"
                value={m.offRidgeVents}
                onChange={(v) => updateMeasurements({ offRidgeVents: v })}
              />
              <NumField
                label="Exhaust Caps"
                suffix="EA"
                value={m.exhaustCaps}
                onChange={(v) => updateMeasurements({ exhaustCaps: v })}
              />
              <NumField
                label="Ridge Vent"
                suffix="LF"
                value={m.ridgeVentLf}
                onChange={(v) => updateMeasurements({ ridgeVentLf: v })}
              />
              <NumField
                label="Chimneys"
                suffix="EA"
                value={m.chimneys}
                onChange={(v) => updateMeasurements({ chimneys: v })}
              />
              <NumField
                label="Skylights"
                suffix="EA"
                value={m.skylights}
                onChange={(v) => updateMeasurements({ skylights: v })}
              />
              <NumField
                label="Satellite Dishes"
                suffix="EA"
                value={m.satelliteDishes}
                onChange={(v) => updateMeasurements({ satelliteDishes: v })}
              />
              <div className="flex flex-col gap-1">
                <NumField
                  label="Waste Factor"
                  suffix="%"
                  value={m.wastePct}
                  onChange={(v) => updateMeasurements({ wastePct: v ?? 15 })}
                />
                {m.wasteOptions?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {m.wasteOptions.map((o) => (
                      <Badge
                        key={o}
                        variant={o === m.wastePct ? 'default' : 'outline'}
                        className="text-[10px] cursor-pointer"
                        onClick={() => updateMeasurements({ wastePct: o })}>
                        {o}%
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="col-span-2 md:col-span-4">
                <Separator className="my-1" />
              </div>

              <div className="col-span-2 md:col-span-2 flex items-center justify-between gap-2">
                <div>
                  <Label className="text-sm">Full-deck membrane</Label>
                  <p className="text-xs text-muted-foreground">
                    On: water barrier over entire surface. Off: 4&quot; seam tape.
                  </p>
                </div>
                <Switch checked={fullDeckMembrane} onCheckedChange={setFullDeckMembrane} />
              </div>
              <TxtField label="Write into Area" value={targetArea} onChange={setTargetArea} />
              <TxtField label="Write into Room" value={targetRoom} onChange={setTargetRoom} />

              <div className="col-span-2 flex items-end gap-2">
                <NumField
                  label="Roof Age (for depreciation)"
                  suffix="yrs"
                  value={roofAgeYears}
                  onChange={setRoofAgeYears}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={applyAgeDepreciation}
                  disabled={!roofAgeYears || estimate.lineItems.length === 0}>
                  Apply to items
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-base">Line Items</CardTitle>
                  <CardDescription>
                    {estimate.lineItems.length} item
                    {estimate.lineItems.length === 1 ? '' : 's'} — all fields editable in place.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={`${targetArea}||${targetRoom}`}
                    onValueChange={(v) => {
                      const [a, r] = v.split('||');
                      setTargetArea(a);
                      setTargetRoom(r);
                    }}>
                    <SelectTrigger className="h-9 w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {placements.map((p) => (
                        <SelectItem key={`${p.area}||${p.room}`} value={`${p.area}||${p.room}`}>
                          {p.area} › {p.room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Line Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Line Item Catalog</DialogTitle>
                        <DialogDescription>
                          Priced from {estimate.claim.priceList}. Items carry their standard
                          code-citation note, which you can edit per claim. Adding to{' '}
                          <b>
                            {targetArea} › {targetRoom}
                          </b>
                          .
                        </DialogDescription>
                      </DialogHeader>
                      <div className="relative">
                        <SearchIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                        <Input
                          className="pl-8"
                          placeholder="Search by description, trade or keyword..."
                          value={catalogQuery}
                          onChange={(e) => setCatalogQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-[420px] overflow-y-auto border rounded-md divide-y">
                        {catalogResults.map((entry) => (
                          <div
                            key={entry.code}
                            className="flex items-center gap-3 p-2 hover:bg-muted/50">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{entry.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.category} —{' '}
                                {money(priceFor(entry, estimate.claim.priceList))} / {entry.unit}
                                {entry.defaultNote ? ' — includes code citation' : ''}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => addCatalogItem(entry)}>
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {catalogResults.length === 0 && (
                          <p className="p-4 text-sm text-muted-foreground">No matches.</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {estimate.lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground px-6 pb-6">
                  No line items yet. Paste a roof report and hit <b>Generate Scope</b>, or add
                  items from the catalog.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground [&>th]:px-2 [&>th]:py-2 [&>th]:text-left">
                        <th className="min-w-[240px]">Description</th>
                        <th className="w-[90px]">Qty</th>
                        <th className="w-[56px]">Unit</th>
                        <th className="w-[96px]">Unit Price</th>
                        <th className="w-[76px]">Dep %</th>
                        <th className="w-[90px]">O&amp;P</th>
                        <th className="w-[100px]">RCV</th>
                        <th className="w-[100px]">ACV</th>
                        <th className="w-[40px]" />
                      </tr>
                    </thead>
                    <tbody>
                      {estimate.lineItems.map((li) => {
                        const t = calcLineItemTotals(li, estimate.settings);
                        return (
                          <tr key={li.id} className="border-b align-top hover:bg-muted/30">
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-1 mb-1">
                                <Badge variant="secondary" className="text-[10px]">
                                  {li.laborMinimum
                                    ? LABOR_MINIMUM_SECTION
                                    : `${li.area} › ${li.room}`}
                                </Badge>
                                {li.group ? (
                                  <Badge variant="outline" className="text-[10px]">
                                    {li.group}
                                  </Badge>
                                ) : null}
                              </div>
                              <Input
                                className="h-8"
                                value={li.description}
                                onChange={(e) =>
                                  updateLineItem(li.id, { description: e.target.value })
                                }
                              />
                              <Textarea
                                rows={2}
                                className="mt-1 text-xs"
                                placeholder="Justification / code citation (prints under the line)"
                                value={li.note ?? ''}
                                onChange={(e) => updateLineItem(li.id, { note: e.target.value })}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                className="h-8"
                                type="number"
                                step="any"
                                value={li.quantity}
                                onChange={(e) =>
                                  updateLineItem(li.id, {
                                    quantity: Number(e.target.value) || 0
                                  })
                                }
                              />
                            </td>
                            <td className="px-2 py-2 pt-4 text-xs text-muted-foreground">
                              {li.unit}
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                className="h-8"
                                type="number"
                                step="0.01"
                                value={li.unitPrice}
                                onChange={(e) =>
                                  updateLineItem(li.id, {
                                    unitPrice: Number(e.target.value) || 0
                                  })
                                }
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                className="h-8"
                                type="number"
                                step="0.1"
                                disabled={li.nonDepreciable}
                                value={li.nonDepreciable ? 0 : li.depreciationPct}
                                onChange={(e) =>
                                  updateLineItem(li.id, {
                                    depreciationPct: Number(e.target.value) || 0
                                  })
                                }
                              />
                            </td>
                            <td className="px-2 py-2 pt-4 text-right text-xs whitespace-nowrap">
                              {money(t.oAndP)}
                            </td>
                            <td className="px-2 py-2 pt-4 text-right font-medium whitespace-nowrap">
                              {money(t.rcv)}
                            </td>
                            <td className="px-2 py-2 pt-4 text-right whitespace-nowrap">
                              {money(t.acv)}
                            </td>
                            <td className="px-2 py-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeLineItem(li.id)}>
                                <Trash2Icon className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estimate Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <NumField
                label="Material Sales Tax"
                suffix="%"
                value={estimate.settings.salesTaxPct}
                onChange={(v) => updateSettings({ salesTaxPct: v ?? 0 })}
              />
              <div className="flex items-center justify-between">
                <Label className="text-sm">Apply Overhead &amp; Profit</Label>
                <Switch
                  checked={estimate.settings.applyOAndP}
                  onCheckedChange={(v) => updateSettings({ applyOAndP: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumField
                  label="Overhead"
                  suffix="%"
                  value={estimate.settings.overheadPct}
                  onChange={(v) => updateSettings({ overheadPct: v ?? 0 })}
                />
                <NumField
                  label="Profit"
                  suffix="%"
                  value={estimate.settings.profitPct}
                  onChange={(v) => updateSettings({ profitPct: v ?? 0 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Depreciation Recoverable</Label>
                <Switch
                  checked={estimate.settings.recoverableDepreciation}
                  onCheckedChange={(v) => updateSettings({ recoverableDepreciation: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="text-sm">Auto trade labor minimums</Label>
                  <p className="text-xs text-muted-foreground">
                    Adds a labor minimum for any trade under its minimum charge.
                  </p>
                </div>
                <Switch
                  checked={estimate.settings.autoLaborMinimums}
                  onCheckedChange={(v) => updateSettings({ autoLaborMinimums: v })}
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleApplyLaborMinimums}>
                Apply labor minimums now
              </Button>
              <NumField
                label="Deductible"
                suffix="$"
                value={estimate.settings.deductible}
                onChange={(v) => updateSettings({ deductible: v ?? 0 })}
              />
              <TxtField
                label="Cover note (optional)"
                value={estimate.settings.coverPageNote ?? ''}
                onChange={(v) => updateSettings({ coverPageNote: v })}
                placeholder="Final Draft with/without Removal Depreciation"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Summary for Dwelling</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Line Item Total</span>
                <span>{money(totals.lineItemTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material Sales Tax</span>
                <span>{money(totals.salesTax)}</span>
              </div>
              {estimate.settings.applyOAndP && (
                <>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>{money(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Overhead ({estimate.settings.overheadPct}%)
                    </span>
                    <span>{money(totals.overhead)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Profit ({estimate.settings.profitPct}%)
                    </span>
                    <span>{money(totals.profit)}</span>
                  </div>
                </>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold text-base">
                <span>Replacement Cost Value</span>
                <span>{money(totals.rcv)}</span>
              </div>
              {totals.totalDepreciation > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Less Depreciation
                      {estimate.settings.recoverableDepreciation ? ' (recoverable)' : ''}
                    </span>
                    <span className="text-red-500">({money(totals.totalDepreciation)})</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Actual Cash Value</span>
                    <span>{money(totals.acv)}</span>
                  </div>
                </>
              )}
              {estimate.settings.deductible > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Less Deductible</span>
                  <span className="text-red-500">({money(estimate.settings.deductible)})</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold text-base">
                <span>Net Claim</span>
                <span>{money(totals.netClaim)}</span>
              </div>
              {totals.totalDepreciation > 0 && estimate.settings.recoverableDepreciation && (
                <div className="flex justify-between font-medium">
                  <span>Net if Dep. Recovered</span>
                  <span>{money(totals.netClaimIfRecovered)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {totals.categoryRecap.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recap by Category</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                {totals.categoryRecap.map((r) => (
                  <div key={r.category} className="flex justify-between gap-2">
                    <span className="text-muted-foreground text-xs">{r.category}</span>
                    <span className="whitespace-nowrap">
                      {money(r.total)}{' '}
                      <span className="text-xs text-muted-foreground">
                        ({r.pctOfTotal.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground px-1">
            Unit prices default to the selected price list and stay editable per line. Verify
            against the current published list before submitting to a carrier.
          </p>
        </div>
      </div>
    </div>
  );
}
