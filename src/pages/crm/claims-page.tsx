import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import AddClaimForm from '../../components/forms/crm/add-claim-form';
import { useClaims } from '../../hooks/useAPI/use-claim';
import { formatCents } from '../../lib/money';

export default function ClaimsPage() {
  const { data: claims, isLoading } = useClaims();

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title="Claims"
        subheading="All insurance claims from filed through closed."
        actionButtonText="Add claim"
        sheetTitle="New claim"
        sheetDescription="Attach a claim to an existing lead."
        SheetContentBody={AddClaimForm}
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (claims ?? []).length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">No claims yet.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {claims!.map((c) => (
            <Link key={c.id} to={`/crm/claims/${c.id}`}>
              <Card className="p-4 hover:border-primary transition">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="text-sm font-semibold">
                      {c.claim_number ?? `Claim #${c.id}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.carrier?.name ?? 'No carrier'}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {c.status}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Adjuster: {c.adjuster_name ?? '—'}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                  <div>
                    <div className="text-muted-foreground">ACV</div>
                    <div>{c.acv_cents != null ? formatCents(c.acv_cents) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">RCV</div>
                    <div>{c.rcv_cents != null ? formatCents(c.rcv_cents) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Ded.</div>
                    <div>{c.deductible_cents != null ? formatCents(c.deductible_cents) : '—'}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
