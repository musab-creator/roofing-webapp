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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  WandSparklesIcon
} from 'lucide-react';
import {
  SupplementEstimate,
  SupplementLineItem,
  RoofMeasurements,
  CatalogItem
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
  deleteEstimate
} from '../lib/supplement-utils';
import { searchCatalog, TRADE_NAMES } from '../data/supplement-catalog';
import SupplementDocument from '../components/pdf-render/supplement-doc';
import { formatMoneyValue } from '../lib/utils';

// ------------------------------------------------------------------
// Xactimate-style Supplement Estimate Creator
// ------------------------------------------------------------------

const money = (n: number) => formatMoneyValue(n);

function NumberField({
  label,
  value,
  onChange,
  step = 'any',
  suffix
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step?: string;
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
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="h-8"
      />
    </div>
  );
}

function TextField({
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
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
  const [pdfOpen, setPdfOpen] = React.useState(false);
  const [roofAgeYears, setRoofAgeYears] = React.useState<number | undefined>(undefined);

  const totals = React.useMemo(
    () => calcEstimateTotals(estimate.lineItems, estimate.settings),
    [estimate.lineItems, estimate.settings]
  );

  const catalogResults = React.useMemo(() => searchCatalog(catalogQuery), [catalogQuery]);

  // ---------- mutations ----------
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
    setEstimate((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((li) => li.id !== id)
    }));

  const addCatalogItem = (entry: CatalogItem) => {
    const item = lineItemFromCatalog(entry, 1, 'Roof');
    if (!item.nonDepreciable && roofAgeYears) {
      item.depreciationPct = ageBasedDepreciationPct(roofAgeYears, entry.lifeYears);
    }
    setEstimate((prev) => ({ ...prev, lineItems: [...prev.lineItems, item] }));
    toast({ title: `Added ${entry.cat} ${entry.sel}`, description: entry.description });
  };

  const handleSave = () => {
    const all = upsertEstimate(estimate);
    setEstimates(all);
    toast({ title: 'Estimate saved', description: estimate.title });
  };

  const handleNew = () => {
    const fresh = newEstimate();
    setEstimate(fresh);
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
      lineItems: estimate.lineItems.map((li) => ({ ...li, id: `${li.id}-c${Math.random().toString(36).slice(2, 6)}` }))
    };
    setEstimate(copy);
    toast({ title: 'Estimate duplicated', description: copy.title });
  };

  const handleParseReport = () => {
    const parsed = parseRoofReport(reportText);
    const found = Object.entries(parsed).filter(([, v]) => v !== undefined);
    if (found.length === 0) {
      toast({
        title: 'No measurements found',
        description: 'Could not read values from the pasted report. Enter them manually below.',
        variant: 'destructive'
      });
      return;
    }
    updateMeasurements(parsed);
    setReportDialogOpen(false);
    toast({
      title: `Imported ${found.length} measurement${found.length === 1 ? '' : 's'} from report`,
      description: 'Review the values, then use Generate Scope to build the line items.'
    });
  };

  const handleGenerateScope = () => {
    const generated = generateScopeFromMeasurements(estimate.measurements);
    if (generated.length === 0) {
      toast({
        title: 'Total roof area required',
        description: 'Enter at least the total roof area (sq ft) before generating a scope.',
        variant: 'destructive'
      });
      return;
    }
    if (roofAgeYears) {
      for (const item of generated) {
        if (!item.nonDepreciable) {
          const entry = searchCatalog(`${item.cat} ${item.sel}`).find(
            (c) => c.cat === item.cat && c.sel === item.sel
          );
          item.depreciationPct = ageBasedDepreciationPct(roofAgeYears, entry?.lifeYears);
        }
      }
    }
    setEstimate((prev) => ({ ...prev, lineItems: [...prev.lineItems, ...generated] }));
    toast({
      title: `Generated ${generated.length} line items`,
      description: 'Full replacement scope built from the roof measurements.'
    });
  };

  const applyAgeDepreciation = () => {
    if (!roofAgeYears) return;
    setEstimate((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((li) => {
        if (li.nonDepreciable) return li;
        const entry = searchCatalog(`${li.cat} ${li.sel}`).find(
          (c) => c.cat === li.cat && c.sel === li.sel
        );
        return { ...li, depreciationPct: ageBasedDepreciationPct(roofAgeYears, entry?.lifeYears) };
      })
    }));
    toast({ title: `Applied ${roofAgeYears}-year age depreciation to all depreciable items` });
  };

  const m = estimate.measurements;

  return (
    <div className="flex flex-col w-full gap-6 mb-6">
      <DefaultPageHeader
        title="Supplements"
        subheading="Build insurance supplement estimates in the industry-standard RCV / depreciation / ACV format."
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={estimate.id}
          onValueChange={(id) => {
            const found = estimates.find((e) => e.id === id);
            if (found) setEstimate(found);
          }}>
          <SelectTrigger className="w-[280px] h-9">
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
          <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Supplement Estimate PDF</DialogTitle>
              <DialogDescription>
                {estimate.title} — RCV {money(totals.rcv)}
              </DialogDescription>
            </DialogHeader>
            {pdfOpen && (
              <PDFViewer className="w-full flex-1 rounded-md border" showToolbar>
                <SupplementDocument estimate={estimate} companyName="Diversity Roofing" />
              </PDFViewer>
            )}
            <DialogFooter>
              <PDFDownloadLink
                document={<SupplementDocument estimate={estimate} companyName="Diversity Roofing" />}
                fileName={`Supplement_${(estimate.claim.insuredName || estimate.title).replace(/\s+/g, '_')}.pdf`}>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2/3: claim info, measurements, line items */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Claim information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <HardHatIcon className="w-4 h-4" /> Claim Information
              </CardTitle>
              <CardDescription>Header block printed at the top of the estimate.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <TextField
                label="Estimate Title"
                value={estimate.title}
                onChange={(v) => update({ title: v })}
              />
              <TextField
                label="Insured Name"
                value={estimate.claim.insuredName}
                onChange={(v) => updateClaim({ insuredName: v })}
              />
              <TextField
                label="Insurance Carrier"
                value={estimate.claim.insuranceCarrier}
                onChange={(v) => updateClaim({ insuranceCarrier: v })}
              />
              <TextField
                label="Claim #"
                value={estimate.claim.claimNumber}
                onChange={(v) => updateClaim({ claimNumber: v })}
              />
              <TextField
                label="Policy #"
                value={estimate.claim.policyNumber}
                onChange={(v) => updateClaim({ policyNumber: v })}
              />
              <TextField
                label="Date of Loss"
                value={estimate.claim.dateOfLoss}
                onChange={(v) => updateClaim({ dateOfLoss: v })}
                placeholder="MM/DD/YYYY"
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
                    {['Hail', 'Wind', 'Hurricane', 'Water', 'Fire', 'Fallen Tree', 'Other'].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <TextField
                label="Property Address"
                value={estimate.claim.propertyAddress}
                onChange={(v) => updateClaim({ propertyAddress: v })}
              />
              <TextField
                label="City"
                value={estimate.claim.propertyCity}
                onChange={(v) => updateClaim({ propertyCity: v })}
              />
              <TextField
                label="State"
                value={estimate.claim.propertyState}
                onChange={(v) => updateClaim({ propertyState: v })}
              />
              <TextField
                label="Zip"
                value={estimate.claim.propertyZip}
                onChange={(v) => updateClaim({ propertyZip: v })}
              />
              <TextField
                label="Adjuster Name"
                value={estimate.claim.adjusterName}
                onChange={(v) => updateClaim({ adjusterName: v })}
              />
              <TextField
                label="Adjuster Phone"
                value={estimate.claim.adjusterPhone}
                onChange={(v) => updateClaim({ adjusterPhone: v })}
              />
              <TextField
                label="Adjuster Email"
                value={estimate.claim.adjusterEmail}
                onChange={(v) => updateClaim({ adjusterEmail: v })}
              />
              <TextField
                label="Estimator"
                value={estimate.claim.estimatorName}
                onChange={(v) => updateClaim({ estimatorName: v })}
              />
              <TextField
                label="Price List Label"
                value={estimate.claim.priceListLabel}
                onChange={(v) => updateClaim({ priceListLabel: v })}
                placeholder="e.g. TXDA8X_AUG26"
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
                    Paste a roof report (EagleView / Hover style) or enter values, then generate the
                    full replacement scope automatically.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ClipboardPasteIcon className="w-4 h-4 mr-1" /> Paste Roof Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Paste Roof Report Text</DialogTitle>
                        <DialogDescription>
                          Copy the measurement summary text out of the roof report PDF and paste it
                          here. Totals like roof area, ridges, hips, valleys, eaves, rakes, step
                          flashing, pitch and stories are detected automatically.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        rows={12}
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder={
                          'Example:\nTotal Roof Area = 2,847 sq ft\nRidges = 68 ft\nHips = 42 ft\nValleys = 51 ft\nEaves = 172 ft\nRakes = 96 ft\nPredominant Pitch = 6/12\nNumber of Stories = 2'
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
              <NumberField
                label="Total Roof Area"
                suffix="sq ft"
                value={m.totalRoofAreaSqFt}
                onChange={(v) => updateMeasurements({ totalRoofAreaSqFt: v })}
              />
              <NumberField
                label="Ridges"
                suffix="LF"
                value={m.ridgeLf}
                onChange={(v) => updateMeasurements({ ridgeLf: v })}
              />
              <NumberField
                label="Hips"
                suffix="LF"
                value={m.hipLf}
                onChange={(v) => updateMeasurements({ hipLf: v })}
              />
              <NumberField
                label="Valleys"
                suffix="LF"
                value={m.valleyLf}
                onChange={(v) => updateMeasurements({ valleyLf: v })}
              />
              <NumberField
                label="Eaves"
                suffix="LF"
                value={m.eaveLf}
                onChange={(v) => updateMeasurements({ eaveLf: v })}
              />
              <NumberField
                label="Rakes"
                suffix="LF"
                value={m.rakeLf}
                onChange={(v) => updateMeasurements({ rakeLf: v })}
              />
              <NumberField
                label="Step Flashing"
                suffix="LF"
                value={m.stepFlashingLf}
                onChange={(v) => updateMeasurements({ stepFlashingLf: v })}
              />
              <NumberField
                label="Wall Flashing"
                suffix="LF"
                value={m.wallFlashingLf}
                onChange={(v) => updateMeasurements({ wallFlashingLf: v })}
              />
              <NumberField
                label="Drip Edge"
                suffix="LF"
                value={m.dripEdgeLf}
                onChange={(v) => updateMeasurements({ dripEdgeLf: v })}
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
              <NumberField
                label="Stories"
                value={m.stories}
                onChange={(v) => updateMeasurements({ stories: v })}
              />
              <NumberField
                label="Pipe Jacks"
                suffix="EA"
                value={m.pipeJacks}
                onChange={(v) => updateMeasurements({ pipeJacks: v })}
              />
              <NumberField
                label="Turtle Vents"
                suffix="EA"
                value={m.turtleVents}
                onChange={(v) => updateMeasurements({ turtleVents: v })}
              />
              <NumberField
                label="Ridge Vent"
                suffix="LF"
                value={m.ridgeVentLf}
                onChange={(v) => updateMeasurements({ ridgeVentLf: v })}
              />
              <NumberField
                label="Chimneys"
                suffix="EA"
                value={m.chimneys}
                onChange={(v) => updateMeasurements({ chimneys: v })}
              />
              <NumberField
                label="Skylights"
                suffix="EA"
                value={m.skylights}
                onChange={(v) => updateMeasurements({ skylights: v })}
              />
              <NumberField
                label="Waste Factor"
                suffix="%"
                value={m.wastePct}
                onChange={(v) => updateMeasurements({ wastePct: v ?? 10 })}
              />
              <div className="col-span-2 flex items-end gap-2">
                <NumberField
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
                    {estimate.lineItems.length} item{estimate.lineItems.length === 1 ? '' : 's'} —
                    every field is editable in place.
                  </CardDescription>
                </div>
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
                        Search by code, trade or keyword (e.g. “RFG 240”, “drip edge”, “steep”).
                        Prices are regional defaults — adjust them on the estimate to match your
                        price list.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                      <SearchIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="Search catalog..."
                        value={catalogQuery}
                        onChange={(e) => setCatalogQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[420px] overflow-y-auto border rounded-md divide-y">
                      {catalogResults.map((entry) => (
                        <div
                          key={`${entry.cat}-${entry.sel}`}
                          className="flex items-center gap-3 p-2 hover:bg-muted/50">
                          <Badge variant="secondary" className="font-mono shrink-0">
                            {entry.cat} {entry.sel}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {TRADE_NAMES[entry.cat] ?? entry.cat} — {money(entry.unitPrice)} /{' '}
                              {entry.unit}
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
            </CardHeader>
            <CardContent className="p-0">
              {estimate.lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground px-6 pb-6">
                  No line items yet. Paste a roof report and hit <b>Generate Scope</b>, or add items
                  from the catalog.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground [&>th]:px-2 [&>th]:py-2 [&>th]:text-left">
                        <th className="w-[110px]">Code</th>
                        <th className="min-w-[220px]">Description</th>
                        <th className="w-[90px]">Qty</th>
                        <th className="w-[60px]">Unit</th>
                        <th className="w-[100px]">Unit Price</th>
                        <th className="w-[80px]">Dep %</th>
                        <th className="w-[100px] text-right!">RCV</th>
                        <th className="w-[100px] text-right!">ACV</th>
                        <th className="w-[40px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimate.lineItems.map((li) => {
                        const t = calcLineItemTotals(li, estimate.settings);
                        return (
                          <tr key={li.id} className="border-b align-top hover:bg-muted/30">
                            <td className="px-2 py-2">
                              <Badge variant="outline" className="font-mono">
                                {li.cat} {li.sel}
                              </Badge>
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                className="h-8"
                                value={li.description}
                                onChange={(e) =>
                                  updateLineItem(li.id, { description: e.target.value })
                                }
                              />
                              <Input
                                className="h-7 mt-1 text-xs"
                                placeholder="Justification note (prints under the line)"
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
                                  updateLineItem(li.id, { quantity: Number(e.target.value) || 0 })
                                }
                              />
                            </td>
                            <td className="px-2 py-2 pt-3 text-xs text-muted-foreground">
                              {li.unit}
                            </td>
                            <td className="px-2 py-2">
                              <Input
                                className="h-8"
                                type="number"
                                step="0.01"
                                value={li.unitPrice}
                                onChange={(e) =>
                                  updateLineItem(li.id, { unitPrice: Number(e.target.value) || 0 })
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
                            <td className="px-2 py-2 pt-3 text-right font-medium whitespace-nowrap">
                              {money(t.rcv)}
                            </td>
                            <td className="px-2 py-2 pt-3 text-right whitespace-nowrap">
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

        {/* RIGHT 1/3: settings + totals */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estimate Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <NumberField
                label="Material Sales Tax"
                suffix="%"
                value={estimate.settings.salesTaxPct}
                onChange={(v) => updateSettings({ salesTaxPct: v ?? 0 })}
              />
              <div className="flex items-center justify-between">
                <Label className="text-sm">Apply Overhead & Profit</Label>
                <Switch
                  checked={estimate.settings.applyOAndP}
                  onCheckedChange={(v) => updateSettings({ applyOAndP: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Overhead"
                  suffix="%"
                  value={estimate.settings.overheadPct}
                  onChange={(v) => updateSettings({ overheadPct: v ?? 0 })}
                />
                <NumberField
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
              <NumberField
                label="Deductible"
                suffix="$"
                value={estimate.settings.deductible}
                onChange={(v) => updateSettings({ deductible: v ?? 0 })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estimate Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Line Item Total</span>
                <span>{money(totals.lineItemSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Material Sales Tax ({estimate.settings.salesTaxPct}%)
                </span>
                <span>{money(totals.salesTax)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>{money(totals.subtotalWithTax)}</span>
              </div>
              {estimate.settings.applyOAndP && (
                <>
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
                <span>RCV</span>
                <span>{money(totals.rcv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Depreciation{estimate.settings.recoverableDepreciation ? ' (recoverable)' : ''}
                </span>
                <span className="text-red-500">({money(totals.totalDepreciation)})</span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>ACV</span>
                <span>{money(totals.acv)}</span>
              </div>
              {estimate.settings.deductible > 0 && (
                <>
                  <Separator className="my-1" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductible</span>
                    <span className="text-red-500">({money(estimate.settings.deductible)})</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Net Claim (ACV)</span>
                    <span>{money(totals.netClaimAcv)}</span>
                  </div>
                  {estimate.settings.recoverableDepreciation && (
                    <div className="flex justify-between font-medium">
                      <span>Net w/ Recovered Dep.</span>
                      <span>{money(totals.netClaimIfRecoverable)}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {totals.tradeRecap.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recap by Trade</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                {totals.tradeRecap.map((r) => (
                  <div key={r.cat} className="flex justify-between">
                    <span className="text-muted-foreground">
                      <span className="font-mono text-xs mr-1">{r.cat}</span>
                      {r.trade}
                    </span>
                    <span>
                      {money(r.rcv)}{' '}
                      <span className="text-xs text-muted-foreground">({r.pctOfTotal.toFixed(1)}%)</span>
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground px-1">
            Unit prices are editable regional defaults, not a live price list. Verify pricing
            against the current published price list for your market before submitting to a
            carrier.
          </p>
        </div>
      </div>
    </div>
  );
}
