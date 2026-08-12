import React from 'react';
import { Page, Document, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  SupplementEstimate,
  SupplementLineItem,
  EstimateTotals
} from '../../types/supplement_types';
import {
  calcLineItemTotals,
  calcEstimateTotals,
  LABOR_MINIMUM_SECTION,
  roomKey
} from '../../lib/supplement-utils';

// -----------------------------------------------------------------
// Diversity Roofing supplement estimate.
//
// Reproduces the layout of the estimates the company issues:
// claim header, Area > Room > group line items with per-line O&P,
// room and area totals, summary, and the three recap pages.
// -----------------------------------------------------------------

const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const moneyParen = (n: number) => `(${money(Math.abs(n))})`;

const qtyText = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const styles = StyleSheet.create({
  page: {
    fontSize: 7.5,
    paddingTop: 28,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    color: '#000000'
  },
  companyBar: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    letterSpacing: 0.5
  },
  draftNote: { fontSize: 7, marginBottom: 6, fontFamily: 'Helvetica-Oblique' },

  // Header block
  headerGrid: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', marginBottom: 1.5 },
  headerCell: { flexDirection: 'row', paddingRight: 10 },
  label: { fontFamily: 'Helvetica-Bold' },
  hr: { borderBottomWidth: 0.75, borderBottomColor: '#000000', marginVertical: 6 },

  estimateNameLine: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 6 },

  areaHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginTop: 10, marginBottom: 2 },
  roomHeader: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, marginTop: 6, marginBottom: 2 },
  continuedHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    marginTop: 4,
    marginBottom: 2
  },
  groupHeader: { fontFamily: 'Helvetica-Bold', fontSize: 8, marginTop: 5, marginBottom: 1 },

  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 0.75,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7
  },
  row: { flexDirection: 'row', paddingVertical: 1.5 },
  noteText: {
    fontSize: 6.8,
    color: '#1a1a1a',
    marginTop: 1,
    marginBottom: 3,
    lineHeight: 1.35,
    textAlign: 'justify'
  },

  totalsRow: {
    flexDirection: 'row',
    borderTopWidth: 0.75,
    borderTopColor: '#000000',
    marginTop: 3,
    paddingTop: 2,
    fontFamily: 'Helvetica-Bold'
  },
  grandTotalsRow: {
    flexDirection: 'row',
    borderTopWidth: 1.25,
    borderTopColor: '#000000',
    borderBottomWidth: 1.25,
    borderBottomColor: '#000000',
    marginTop: 6,
    paddingVertical: 3,
    fontFamily: 'Helvetica-Bold'
  },

  // Summary page
  pageTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  summaryRuled: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderTopWidth: 0.75,
    borderTopColor: '#000000'
  },
  summaryBox: { width: 300 },
  bold: { fontFamily: 'Helvetica-Bold' },
  signature: { marginTop: 40, fontSize: 8 },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7
  }
});

// Column widths with and without the O&P column.
const COLS_OP = {
  num: '4%',
  desc: '30%',
  qty: '11%',
  price: '10%',
  tax: '8%',
  op: '9%',
  rcv: '10%',
  dep: '8%',
  acv: '10%'
};
const COLS_NO_OP = {
  num: '4%',
  desc: '34%',
  qty: '12%',
  price: '11%',
  tax: '9%',
  op: '0%',
  rcv: '11%',
  dep: '9%',
  acv: '10%'
};

const right = { textAlign: 'right' as const };

interface Props {
  estimate: SupplementEstimate;
  companyName?: string;
}

interface RenderRoom {
  area: string;
  room: string;
  items: SupplementLineItem[];
}

/** Groups line items into ordered areas and rooms, preserving entry order. */
function buildStructure(lineItems: SupplementLineItem[]): {
  areas: string[];
  rooms: RenderRoom[];
  laborMinimums: SupplementLineItem[];
} {
  const areas: string[] = [];
  const rooms: RenderRoom[] = [];
  const seenRooms = new Map<string, RenderRoom>();
  const laborMinimums: SupplementLineItem[] = [];

  for (const item of lineItems) {
    if (item.laborMinimum) {
      laborMinimums.push(item);
      continue;
    }
    const area = item.area || 'Exterior';
    const room = item.room || 'Dwelling Roof';
    if (!areas.includes(area)) areas.push(area);
    const key = roomKey(area, room);
    let entry = seenRooms.get(key);
    if (!entry) {
      entry = { area, room, items: [] };
      seenRooms.set(key, entry);
      rooms.push(entry);
    }
    entry.items.push(item);
  }
  return { areas, rooms, laborMinimums };
}

export default function SupplementDocument({
  estimate,
  companyName = 'DIVERSITY ROOFING'
}: Props) {
  const { claim, settings, lineItems } = estimate;
  const totals: EstimateTotals = calcEstimateTotals(lineItems, settings);
  const showOP = settings.applyOAndP;
  const C = showOP ? COLS_OP : COLS_NO_OP;
  const estName = claim.estimateName || estimate.title.toUpperCase();
  const dateLabel = claim.dateEntered || new Date().toLocaleDateString('en-US');

  const { rooms, laborMinimums } = buildStructure(lineItems);

  // Continuous line numbering across the whole estimate.
  const numbers = new Map<string, number>();
  let n = 0;
  for (const item of lineItems) {
    n += 1;
    numbers.set(item.id, n);
  }

  const TableHead = () => (
    <View style={styles.tableHead}>
      <Text style={{ width: C.num }}> </Text>
      <Text style={{ width: C.desc }}>DESCRIPTION</Text>
      <Text style={[{ width: C.qty }, right]}>QUANTITY</Text>
      <Text style={[{ width: C.price }, right]}>UNIT PRICE</Text>
      <Text style={[{ width: C.tax }, right]}>TAX</Text>
      {showOP ? <Text style={[{ width: C.op }, right]}>O&P</Text> : null}
      <Text style={[{ width: C.rcv }, right]}>RCV</Text>
      <Text style={[{ width: C.dep }, right]}>DEPREC.</Text>
      <Text style={[{ width: C.acv }, right]}>ACV</Text>
    </View>
  );

  const LineRow = ({ item }: { item: SupplementLineItem }) => {
    const t = calcLineItemTotals(item, settings);
    if (item.bidItem) {
      return (
        <View style={styles.row} wrap={false}>
          <Text style={{ width: C.num }}>{numbers.get(item.id)}.</Text>
          <Text style={{ width: C.desc }}>{item.description}</Text>
          <Text style={[{ width: C.qty }, right]}>{qtyText(item.quantity)} {item.unit}</Text>
          <Text style={[{ width: C.price }, right]}>REVISED</Text>
          <Text style={[{ width: C.tax }, right]} />
          {showOP ? <Text style={[{ width: C.op }, right]} /> : null}
          <Text style={[{ width: C.rcv }, right]} />
          <Text style={[{ width: C.dep }, right]} />
          <Text style={[{ width: C.acv }, right]} />
        </View>
      );
    }
    return (
      <View wrap={false}>
        <View style={styles.row}>
          <Text style={{ width: C.num }}>{numbers.get(item.id)}.</Text>
          <Text style={{ width: C.desc }}>{item.description}</Text>
          <Text style={[{ width: C.qty }, right]}>
            {qtyText(item.quantity)} {item.unit}
          </Text>
          <Text style={[{ width: C.price }, right]}>{money(item.unitPrice)}</Text>
          <Text style={[{ width: C.tax }, right]}>{money(t.tax)}</Text>
          {showOP ? (
            <Text style={[{ width: C.op }, right]}>{money(t.oAndP)}</Text>
          ) : null}
          <Text style={[{ width: C.rcv }, right]}>{money(t.rcv)}</Text>
          <Text style={[{ width: C.dep }, right]}>{moneyParen(t.depreciation)}</Text>
          <Text style={[{ width: C.acv }, right]}>{money(t.acv)}</Text>
        </View>
        {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
      </View>
    );
  };

  const TotalsLine = ({
    label,
    tax,
    op,
    rcv,
    dep,
    acv,
    grand
  }: {
    label: string;
    tax: number;
    op: number;
    rcv: number;
    dep: number;
    acv: number;
    grand?: boolean;
  }) => (
    <View style={grand ? styles.grandTotalsRow : styles.totalsRow}>
      <Text style={{ width: `${parseFloat(C.num) + parseFloat(C.desc) + parseFloat(C.qty) + parseFloat(C.price)}%` }}>
        {label}
      </Text>
      <Text style={[{ width: C.tax }, right]}>{money(tax)}</Text>
      {showOP ? <Text style={[{ width: C.op }, right]}>{money(op)}</Text> : null}
      <Text style={[{ width: C.rcv }, right]}>{money(rcv)}</Text>
      <Text style={[{ width: C.dep }, right]}>{money(dep)}</Text>
      <Text style={[{ width: C.acv }, right]}>{money(acv)}</Text>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text>
        {estName}   {dateLabel}
      </Text>
      <Text render={({ pageNumber }) => `Page: ${pageNumber}`} />
    </View>
  );

  // Rooms grouped by area, in print order.
  const areasInOrder: string[] = [];
  for (const r of rooms) if (!areasInOrder.includes(r.area)) areasInOrder.push(r.area);

  return (
    <Document title={`Supplement Estimate - ${estName}`} author={companyName}>
      {/* ---------------- Page 1: claim header ---------------- */}
      <Page size="LETTER" style={styles.page}>
        {settings.coverPageNote ? (
          <Text style={styles.draftNote}>{settings.coverPageNote}</Text>
        ) : null}
        <Text style={styles.companyBar}>{companyName}</Text>

        <View style={styles.headerGrid}>
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '48%' }]}>
              <Text style={styles.label}>Insured: </Text>
              <Text>{claim.insuredName || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '26%' }]}>
              <Text style={styles.label}>Home: </Text>
              <Text>{claim.insuredHomePhone || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '26%' }]}>
              <Text style={styles.label}>Cellular: </Text>
              <Text>{claim.insuredCellPhone || '—'}</Text>
            </View>
          </View>

          {claim.mailingAddress ? (
            <View style={styles.headerRow}>
              <View style={[styles.headerCell, { width: '48%' }]}>
                <Text style={styles.label}>Home: </Text>
                <Text>
                  {claim.mailingAddress}
                  {claim.mailingCityStateZip ? `, ${claim.mailingCityStateZip}` : ''}
                </Text>
              </View>
              <View style={[styles.headerCell, { width: '52%' }]}>
                <Text style={styles.label}>E-mail: </Text>
                <Text>{claim.insuredEmail || '—'}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '100%' }]}>
              <Text style={styles.label}>Property: </Text>
              <Text>
                {claim.propertyAddress || '—'}
                {claim.propertyCityStateZip ? `, ${claim.propertyCityStateZip}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.hr} />

          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '48%' }]}>
              <Text style={styles.label}>Estimator: </Text>
              <Text>{claim.estimator || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '30%' }]}>
              <Text style={styles.label}>Business: </Text>
              <Text>{claim.businessPhone || '—'}</Text>
            </View>
            {claim.operator ? (
              <View style={[styles.headerCell, { width: '22%' }]}>
                <Text style={styles.label}>Operator: </Text>
                <Text>{claim.operator}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.hr} />

          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '36%' }]}>
              <Text style={styles.label}>Claim Number: </Text>
              <Text>{claim.claimNumber || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '32%' }]}>
              <Text style={styles.label}>Policy Number: </Text>
              <Text>{claim.policyNumber || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '32%' }]}>
              <Text style={styles.label}>Type of Loss: </Text>
              <Text>{claim.typeOfLoss || '—'}</Text>
            </View>
          </View>

          <View style={styles.hr} />

          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '50%' }]}>
              <Text style={styles.label}>Date Contacted: </Text>
              <Text>{claim.dateContacted || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '50%' }]}>
              <Text style={styles.label}>Date of Loss: </Text>
              <Text>{claim.dateOfLoss || '—'}</Text>
            </View>
          </View>
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '33%' }]}>
              <Text style={styles.label}>Date Received: </Text>
              <Text>{claim.dateReceived || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '33%' }]}>
              <Text style={styles.label}>Date Inspected: </Text>
              <Text>{claim.dateInspected || '—'}</Text>
            </View>
            <View style={[styles.headerCell, { width: '34%' }]}>
              <Text style={styles.label}>Date Entered: </Text>
              <Text>{claim.dateEntered || '—'}</Text>
            </View>
          </View>

          <View style={styles.hr} />

          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '50%' }]}>
              <Text style={styles.label}>Price List: </Text>
              <Text>{claim.priceList}</Text>
            </View>
            <View style={[styles.headerCell, { width: '50%' }]}>
              <Text>{claim.laborEfficiency}</Text>
            </View>
          </View>
          <View style={styles.headerRow}>
            <View style={[styles.headerCell, { width: '100%' }]}>
              <Text style={styles.label}>Estimate: </Text>
              <Text>{estName}</Text>
            </View>
          </View>
        </View>

        <Footer />
      </Page>

      {/* ---------------- Line item pages ---------------- */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.companyBar}>{companyName}</Text>
        <Text style={styles.estimateNameLine}>{estName}</Text>

        {areasInOrder.map((area) => {
          const areaRooms = rooms.filter((r) => r.area === area);
          const areaTotal = totals.areaTotals.get(area);
          return (
            <View key={area}>
              <Text style={styles.areaHeader}>{area}</Text>
              {areaRooms.map((r) => {
                const rt = totals.roomTotals.get(roomKey(r.area, r.room));
                // Track which group sub-headings have printed in this room.
                const printedGroups: string[] = [];
                return (
                  <View key={`${r.area}-${r.room}`}>
                    {r.room !== area ? <Text style={styles.roomHeader}>{r.room}</Text> : null}
                    <TableHead />
                    {r.items.map((item) => {
                      const showGroup =
                        !!item.group && !printedGroups.includes(item.group);
                      if (showGroup && item.group) printedGroups.push(item.group);
                      return (
                        <View key={item.id}>
                          {showGroup ? (
                            <Text style={styles.groupHeader}>{item.group}</Text>
                          ) : null}
                          <LineRow item={item} />
                        </View>
                      );
                    })}
                    {rt ? (
                      <TotalsLine
                        label={`Totals: ${r.room}`}
                        tax={rt.tax}
                        op={rt.oAndP}
                        rcv={rt.rcv}
                        dep={rt.depreciation}
                        acv={rt.acv}
                      />
                    ) : null}
                  </View>
                );
              })}
              {areaTotal && areaRooms.length > 1 ? (
                <TotalsLine
                  label={`Total: ${area}`}
                  tax={areaTotal.tax}
                  op={areaTotal.oAndP}
                  rcv={areaTotal.rcv}
                  dep={areaTotal.depreciation}
                  acv={areaTotal.acv}
                />
              ) : null}
            </View>
          );
        })}

        {laborMinimums.length > 0 ? (
          <View>
            <Text style={styles.areaHeader}>{LABOR_MINIMUM_SECTION}</Text>
            <TableHead />
            {laborMinimums.map((item) => (
              <LineRow key={item.id} item={item} />
            ))}
            {(() => {
              const lt = totals.roomTotals.get(
                roomKey(LABOR_MINIMUM_SECTION, LABOR_MINIMUM_SECTION)
              );
              return lt ? (
                <TotalsLine
                  label={`Totals: ${LABOR_MINIMUM_SECTION}`}
                  tax={lt.tax}
                  op={lt.oAndP}
                  rcv={lt.rcv}
                  dep={lt.depreciation}
                  acv={lt.acv}
                />
              ) : null;
            })()}
          </View>
        ) : null}

        <TotalsLine
          label={`Line Item Totals: ${estName}`}
          tax={totals.salesTax}
          op={round2(totals.overhead + totals.profit)}
          rcv={totals.rcv}
          dep={totals.totalDepreciation}
          acv={totals.acv}
          grand
        />

        <Footer />
      </Page>

      {/* ---------------- Summary ---------------- */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.companyBar}>{companyName}</Text>
        <Text style={styles.pageTitle}>Summary for Dwelling</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text>Line Item Total</Text>
            <Text>{money(totals.lineItemTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Material Sales Tax</Text>
            <Text>{money(totals.salesTax)}</Text>
          </View>
          {showOP ? (
            <>
              <View style={styles.summaryRuled}>
                <Text style={styles.bold}>Subtotal</Text>
                <Text style={styles.bold}>{money(totals.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Overhead</Text>
                <Text>{money(totals.overhead)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Profit</Text>
                <Text>{money(totals.profit)}</Text>
              </View>
            </>
          ) : null}
          <View style={styles.summaryRuled}>
            <Text style={styles.bold}>Replacement Cost Value</Text>
            <Text style={styles.bold}>${money(totals.rcv)}</Text>
          </View>
          {totals.totalDepreciation > 0 ? (
            <View style={styles.summaryRow}>
              <Text>
                Less Depreciation
                {settings.recoverableDepreciation ? ' (Recoverable)' : ''}
              </Text>
              <Text>{moneyParen(totals.totalDepreciation)}</Text>
            </View>
          ) : null}
          {totals.totalDepreciation > 0 ? (
            <View style={styles.summaryRuled}>
              <Text style={styles.bold}>Actual Cash Value</Text>
              <Text style={styles.bold}>${money(totals.acv)}</Text>
            </View>
          ) : null}
          {settings.deductible > 0 ? (
            <View style={styles.summaryRow}>
              <Text>Less Deductible</Text>
              <Text>{moneyParen(settings.deductible)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRuled}>
            <Text style={styles.bold}>Net Claim</Text>
            <Text style={styles.bold}>${money(totals.netClaim)}</Text>
          </View>
          {totals.totalDepreciation > 0 && settings.recoverableDepreciation ? (
            <>
              <View style={styles.summaryRow}>
                <Text>Total Recoverable Depreciation</Text>
                <Text>{money(totals.totalDepreciation)}</Text>
              </View>
              <View style={styles.summaryRuled}>
                <Text style={styles.bold}>Net Claim if Depreciation is Recovered</Text>
                <Text style={styles.bold}>${money(totals.netClaimIfRecovered)}</Text>
              </View>
            </>
          ) : null}
        </View>
        <Text style={styles.signature}>{claim.estimator || companyName}</Text>
        <Footer />
      </Page>

      {/* ---------------- Recap of taxes, overhead and profit ---------------- */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.companyBar}>{companyName}</Text>
        <Text style={styles.pageTitle}>
          {showOP ? 'Recap of Taxes, Overhead and Profit' : 'Recap of Taxes'}
        </Text>
        <View style={styles.tableHead}>
          <Text style={{ width: '28%' }} />
          {showOP ? (
            <>
              <Text style={[{ width: '18%' }, right]}>Overhead ({settings.overheadPct}%)</Text>
              <Text style={[{ width: '18%' }, right]}>Profit ({settings.profitPct}%)</Text>
            </>
          ) : null}
          <Text style={[{ width: showOP ? '18%' : '36%' }, right]}>
            Material Sales Tax ({settings.salesTaxPct}%)
          </Text>
          <Text style={[{ width: showOP ? '18%' : '36%' }, right]}>Storage Rental Tax</Text>
        </View>
        <View style={styles.row}>
          <Text style={{ width: '28%' }}>Line Items</Text>
          {showOP ? (
            <>
              <Text style={[{ width: '18%' }, right]}>{money(totals.overhead)}</Text>
              <Text style={[{ width: '18%' }, right]}>{money(totals.profit)}</Text>
            </>
          ) : null}
          <Text style={[{ width: showOP ? '18%' : '36%' }, right]}>{money(totals.salesTax)}</Text>
          <Text style={[{ width: showOP ? '18%' : '36%' }, right]}>0.00</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={{ width: '28%' }}>Total</Text>
          {showOP ? (
            <>
              <Text style={[{ width: '18%' }, right]}>{money(totals.overhead)}</Text>
              <Text style={[{ width: '18%' }, right]}>{money(totals.profit)}</Text>
            </>
          ) : null}
          <Text style={[{ width: showOP ? '18%' : '36%' }, right]}>{money(totals.salesTax)}</Text>
          <Text style={[{ width: showOP ? '18%' : '36%' }, right]}>0.00</Text>
        </View>
        <Footer />
      </Page>

      {/* ---------------- Recap by room ---------------- */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.companyBar}>{companyName}</Text>
        <Text style={styles.pageTitle}>Recap by Room</Text>
        <Text style={{ marginBottom: 6 }}>
          <Text style={styles.bold}>Estimate: </Text>
          {estName}
        </Text>
        {areasInOrder.map((area) => {
          const areaRows = totals.roomRecap.filter((r) => r.area === area);
          const at = totals.areaTotals.get(area);
          const areaPct =
            totals.lineItemTotal > 0 && at
              ? (at.itemTotal / totals.lineItemTotal) * 100
              : 0;
          return (
            <View key={area}>
              <Text style={[styles.bold, { marginTop: 6 }]}>Area: {area}</Text>
              {areaRows.map((r) => (
                <View key={`${r.area}-${r.room}`} style={styles.summaryRow}>
                  <Text style={{ paddingLeft: 12 }}>{r.room}</Text>
                  <Text>
                    {money(r.itemTotal)}   {r.pctOfTotal.toFixed(2)}%
                  </Text>
                </View>
              ))}
              {at ? (
                <View style={styles.summaryRuled}>
                  <Text style={styles.bold}>Area Subtotal: {area}</Text>
                  <Text style={styles.bold}>
                    {money(at.itemTotal)}   {areaPct.toFixed(2)}%
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
        {(() => {
          const lt = totals.areaTotals.get(LABOR_MINIMUM_SECTION);
          if (!lt) return null;
          const pct =
            totals.lineItemTotal > 0 ? (lt.itemTotal / totals.lineItemTotal) * 100 : 0;
          return (
            <View style={styles.summaryRow}>
              <Text>{LABOR_MINIMUM_SECTION}</Text>
              <Text>
                {money(lt.itemTotal)}   {pct.toFixed(2)}%
              </Text>
            </View>
          );
        })()}
        <View style={styles.summaryRuled}>
          <Text style={styles.bold}>Subtotal of Areas</Text>
          <Text style={styles.bold}>{money(totals.lineItemTotal)}   100.00%</Text>
        </View>
        <View style={styles.summaryRuled}>
          <Text style={styles.bold}>Total</Text>
          <Text style={styles.bold}>{money(totals.lineItemTotal)}   100.00%</Text>
        </View>
        <Footer />
      </Page>

      {/* ---------------- Recap by category ---------------- */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.companyBar}>{companyName}</Text>
        <Text style={styles.pageTitle}>Recap by Category</Text>
        <View style={styles.tableHead}>
          <Text style={{ width: '60%' }}>{showOP ? 'O&P Items' : 'Items'}</Text>
          <Text style={[{ width: '22%' }, right]}>Total</Text>
          <Text style={[{ width: '18%' }, right]}>%</Text>
        </View>
        {totals.categoryRecap.map((r) => (
          <View key={r.category} style={styles.row}>
            <Text style={{ width: '60%' }}>{r.category}</Text>
            <Text style={[{ width: '22%' }, right]}>{money(r.total)}</Text>
            <Text style={[{ width: '18%' }, right]}>{r.pctOfTotal.toFixed(2)}%</Text>
          </View>
        ))}
        <View style={styles.totalsRow}>
          <Text style={{ width: '60%' }}>{showOP ? 'O&P Items Subtotal' : 'Subtotal'}</Text>
          <Text style={[{ width: '22%' }, right]}>{money(totals.lineItemTotal)}</Text>
          <Text style={[{ width: '18%' }, right]}>
            {totals.rcv > 0 ? ((totals.lineItemTotal / totals.rcv) * 100).toFixed(2) : '0.00'}%
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={{ width: '60%' }}>Material Sales Tax</Text>
          <Text style={[{ width: '22%' }, right]}>{money(totals.salesTax)}</Text>
          <Text style={[{ width: '18%' }, right]}>
            {totals.rcv > 0 ? ((totals.salesTax / totals.rcv) * 100).toFixed(2) : '0.00'}%
          </Text>
        </View>
        {showOP ? (
          <>
            <View style={styles.row}>
              <Text style={{ width: '60%' }}>Overhead</Text>
              <Text style={[{ width: '22%' }, right]}>{money(totals.overhead)}</Text>
              <Text style={[{ width: '18%' }, right]}>
                {totals.rcv > 0 ? ((totals.overhead / totals.rcv) * 100).toFixed(2) : '0.00'}%
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={{ width: '60%' }}>Profit</Text>
              <Text style={[{ width: '22%' }, right]}>{money(totals.profit)}</Text>
              <Text style={[{ width: '18%' }, right]}>
                {totals.rcv > 0 ? ((totals.profit / totals.rcv) * 100).toFixed(2) : '0.00'}%
              </Text>
            </View>
          </>
        ) : null}
        <View style={styles.grandTotalsRow}>
          <Text style={{ width: '60%' }}>Total</Text>
          <Text style={[{ width: '22%' }, right]}>{money(totals.rcv)}</Text>
          <Text style={[{ width: '18%' }, right]}>100.00%</Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
