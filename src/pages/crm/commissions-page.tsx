import React from 'react';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import CommissionCalculatorForm from '../../components/forms/crm/commission-calculator-form';
import { useCommissions } from '../../hooks/useAPI/use-commission';
import { useActiveRepProfiles } from '../../hooks/useAPI/use-rep-profile';
import { formatCents } from '../../lib/money';

export default function CommissionsPage() {
  const { data: commissions, isLoading } = useCommissions();
  const { data: reps } = useActiveRepProfiles();

  const repName = (id: string) => reps?.find((r) => r.id === id)?.display_name ?? id;

  const totals = React.useMemo(() => {
    const byRep = new Map<string, number>();
    let total = 0;
    (commissions ?? []).forEach((c) => {
      byRep.set(c.rep_id, (byRep.get(c.rep_id) ?? 0) + c.payout_cents);
      total += c.payout_cents;
    });
    return { byRep, total };
  }, [commissions]);

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title="Commissions"
        subheading="50/50 default with $1,800 overhead cap. Split 25/25/50 supported."
        actionButtonText="Calculate"
        sheetTitle="Commission calculator"
        sheetDescription="Runs the capped-overhead math and saves the result on submit."
        SheetContentBody={CommissionCalculatorForm}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Total paid out (all-time)</div>
          <div className="text-2xl font-semibold">{formatCents(totals.total)}</div>
        </Card>
        {Array.from(totals.byRep.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([repId, payout]) => (
            <Card key={repId} className="p-4">
              <div className="text-xs text-muted-foreground">{repName(repId)}</div>
              <div className="text-2xl font-semibold">{formatCents(payout)}</div>
            </Card>
          ))}
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : (commissions ?? []).length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No commissions recorded.
        </Card>
      ) : (
        <div className="space-y-2">
          {commissions!.map((c) => (
            <Card key={c.id} className="p-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">
                  Invoice #{c.invoice_id} • {repName(c.rep_id)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {c.share_pct}% share • cap {formatCents(c.overhead_cap_cents)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">
                  {c.status}
                </Badge>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Payout</div>
                  <div className="font-semibold">{formatCents(c.payout_cents)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
