import React from 'react';
import { Page, Document, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  SupplementEstimate,
  SupplementLineItem,
  EstimateTotals
} from '../../types/supplement_types';
import { calcLineItemTotals, calcEstimateTotals } from '../../lib/supplement-utils';
import { TRADE_NAMES } from '../../data/supplement-catalog';

// -----------------------------------------------------------------
// Insurance-estimate style PDF: claim header block, grouped line-item
// table (QTY / UNIT PRICE / TAX / RCV / DEPREC. / ACV), trade recap,
// and an RCV → depreciation → ACV → net claim summary.
// -----------------------------------------------------------------

const money = (n: number) =>
  n < 0
    ? `(${Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})`
    : n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const qty = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const styles = StyleSheet.create({
  page: {
    fontSize: 8,
    paddingTop: 30,
    paddingLeft: 36,
    paddingRight: 36,
    paddingBottom: 42,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    color: '#111111'
  },
  companyName: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  headerRule: { borderBottomWidth: 1.5, borderBottomColor: '#111111', marginTop: 6, marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoCol: { width: '32%' },
  infoLine: { flexDirection: 'row', marginBottom: 1.5 },
  infoLabel: { width: 62, fontFamily: 'Helvetica-Bold' },
  infoValue: { flex: 1 },
  estimateTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 4, marginBottom: 2 },
  groupHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    backgroundColor: '#e8e8e8',
    paddingVertical: 3,
    paddingHorizontal: 4,
    marginTop: 8,
    borderTopWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: '#555555'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.75,
    borderBottomColor: '#555555',
    paddingVertical: 2,
    fontFamily: 'Helvetica-Bold'
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dddddd',
    paddingVertical: 2.5
  },
  colNum: { width: '4%' },
  colDesc: { width: '34%', paddingRight: 4 },
  colQty: { width: '10%', textAlign: 'right' },
  colPrice: { width: '11%', textAlign: 'right' },
  colTax: { width: '9%', textAlign: 'right' },
  colRcv: { width: '11%', textAlign: 'right' },
  colDep: { width: '10%', textAlign: 'right' },
  colAcv: { width: '11%', textAlign: 'right' },
  itemCode: { fontFamily: 'Helvetica-Bold' },
  itemNote: { color: '#444444', fontSize: 7, marginTop: 1 },
  groupTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: '#555555'
  },
  summaryBox: { marginTop: 14, alignSelf: 'flex-end', width: 260 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dddddd'
  },
  summaryLabel: { fontFamily: 'Helvetica' },
  summaryStrong: { fontFamily: 'Helvetica-Bold' },
  recapHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginTop: 16,
    marginBottom: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: '#555555',
    paddingBottom: 2
  },
  recapRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dddddd'
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#555555',
    borderTopWidth: 0.5,
    borderTopColor: '#aaaaaa',
    paddingTop: 4
  },
  disclaimer: { marginTop: 18, fontSize: 7, color: '#555555', lineHeight: 1.4 }
});

interface Props {
  estimate: SupplementEstimate;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export default function SupplementDocument({
  estimate,
  companyName = 'The Roofing App',
  companyAddress,
  companyPhone,
  companyEmail
}: Props) {
  const { claim, settings, lineItems } = estimate;
  const totals: EstimateTotals = calcEstimateTotals(lineItems, settings);

  const groups = new Map<string, SupplementLineItem[]>();
  for (const item of lineItems) {
    const key = item.groupName || 'General';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  let lineNumber = 0;

  return (
    <Document
      title={`Supplement Estimate - ${claim.insuredName || estimate.title}`}
      author={companyName}
    >
      <Page size="LETTER" style={styles.page}>
        {/* Company header */}
        <Text style={styles.companyName}>{companyName}</Text>
        {companyAddress ? <Text>{companyAddress}</Text> : null}
        <Text>
          {[companyPhone, companyEmail].filter(Boolean).join('   •   ')}
        </Text>
        <View style={styles.headerRule} />

        {/* Claim information block */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Insured:</Text>
              <Text style={styles.infoValue}>{claim.insuredName || '—'}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Property:</Text>
              <Text style={styles.infoValue}>
                {[claim.propertyAddress, claim.propertyCity, claim.propertyState, claim.propertyZip]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Estimator:</Text>
              <Text style={styles.infoValue}>{claim.estimatorName || '—'}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Carrier:</Text>
              <Text style={styles.infoValue}>{claim.insuranceCarrier || '—'}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Claim #:</Text>
              <Text style={styles.infoValue}>{claim.claimNumber || '—'}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Policy #:</Text>
              <Text style={styles.infoValue}>{claim.policyNumber || '—'}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Type of Loss:</Text>
              <Text style={styles.infoValue}>{claim.typeOfLoss || '—'}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Date of Loss:</Text>
              <Text style={styles.infoValue}>{claim.dateOfLoss || '—'}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Adjuster:</Text>
              <Text style={styles.infoValue}>{claim.adjusterName || '—'}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{claim.adjusterPhone || '—'}</Text>
            </View>
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Price List:</Text>
              <Text style={styles.infoValue}>{claim.priceListLabel || '—'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.estimateTitle}>{estimate.title.toUpperCase()}</Text>

        {/* Line item groups */}
        {Array.from(groups.entries()).map(([groupName, items]) => {
          const groupRcv = items.reduce(
            (sum, item) => sum + calcLineItemTotals(item, settings).rcv,
            0
          );
          return (
            <View key={groupName}>
              <Text style={styles.groupHeader}>{groupName}</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.colNum}>#</Text>
                <Text style={styles.colDesc}>DESCRIPTION</Text>
                <Text style={styles.colQty}>QTY</Text>
                <Text style={styles.colPrice}>UNIT PRICE</Text>
                <Text style={styles.colTax}>TAX</Text>
                <Text style={styles.colRcv}>RCV</Text>
                <Text style={styles.colDep}>DEPREC.</Text>
                <Text style={styles.colAcv}>ACV</Text>
              </View>
              {items.map((item) => {
                lineNumber += 1;
                const t = calcLineItemTotals(item, settings);
                return (
                  <View key={item.id} style={styles.row} wrap={false}>
                    <Text style={styles.colNum}>{lineNumber}.</Text>
                    <View style={styles.colDesc}>
                      <Text>
                        <Text style={styles.itemCode}>
                          {item.cat} {item.sel}
                        </Text>
                        {'  '}
                        {item.description}
                      </Text>
                      {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                    </View>
                    <Text style={styles.colQty}>
                      {qty(item.quantity)} {item.unit}
                    </Text>
                    <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
                    <Text style={styles.colTax}>{money(t.tax)}</Text>
                    <Text style={styles.colRcv}>{money(t.rcv)}</Text>
                    <Text style={styles.colDep}>
                      {t.depreciation > 0 ? `(${money(t.depreciation)})` : money(0)}
                    </Text>
                    <Text style={styles.colAcv}>{money(t.acv)}</Text>
                  </View>
                );
              })}
              <View style={styles.groupTotalRow}>
                <Text style={styles.summaryStrong}>
                  Total: {groupName}   {money(groupRcv)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Summary */}
        <View style={styles.summaryBox} wrap={false}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Line Item Total</Text>
            <Text>{money(totals.lineItemSubtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Material Sales Tax ({settings.salesTaxPct}%)</Text>
            <Text>{money(totals.salesTax)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryStrong}>Subtotal</Text>
            <Text style={styles.summaryStrong}>{money(totals.subtotalWithTax)}</Text>
          </View>
          {settings.applyOAndP ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Overhead ({settings.overheadPct}%)</Text>
                <Text>{money(totals.overhead)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Profit ({settings.profitPct}%)</Text>
                <Text>{money(totals.profit)}</Text>
              </View>
            </>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryStrong}>Replacement Cost Value (RCV)</Text>
            <Text style={styles.summaryStrong}>{money(totals.rcv)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Less Depreciation{settings.recoverableDepreciation ? ' (Recoverable)' : ''}
            </Text>
            <Text>({money(totals.totalDepreciation)})</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryStrong}>Actual Cash Value (ACV)</Text>
            <Text style={styles.summaryStrong}>{money(totals.acv)}</Text>
          </View>
          {settings.deductible > 0 ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Less Deductible</Text>
                <Text>({money(settings.deductible)})</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryStrong}>Net Claim (ACV)</Text>
                <Text style={styles.summaryStrong}>{money(totals.netClaimAcv)}</Text>
              </View>
              {settings.recoverableDepreciation ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryStrong}>Net Claim if Depreciation is Recovered</Text>
                  <Text style={styles.summaryStrong}>{money(totals.netClaimIfRecoverable)}</Text>
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        {/* Trade recap */}
        <View wrap={false}>
          <Text style={styles.recapHeader}>RECAP BY CATEGORY</Text>
          <View style={styles.tableHeader}>
            <Text style={{ width: '60%' }}>TRADE</Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>RCV</Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>% OF TOTAL</Text>
          </View>
          {totals.tradeRecap.map((r) => (
            <View key={r.cat} style={styles.recapRow}>
              <Text style={{ width: '60%' }}>
                {r.cat} — {TRADE_NAMES[r.cat] ?? r.trade}
              </Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>{money(r.rcv)}</Text>
              <Text style={{ width: '20%', textAlign: 'right' }}>{r.pctOfTotal.toFixed(1)}%</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          This estimate is a supplement request prepared by the contractor and represents the scope
          of repairs reasonably necessary to restore the property to its pre-loss condition. Unit
          pricing reflects local market rates as of the date of this estimate and is subject to
          verification against the applicable regional price list. Depreciation shown is an
          estimate; actual holdback is determined by the carrier per the policy terms.
        </Text>

        <View style={styles.footer} fixed>
          <Text>
            {claim.insuredName ? `${claim.insuredName} — ` : ''}
            {claim.claimNumber ? `Claim ${claim.claimNumber}` : estimate.title}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
