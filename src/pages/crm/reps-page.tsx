import React from 'react';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { useRepProfiles } from '../../hooks/useAPI/use-rep-profile';
import { formatCents } from '../../lib/money';

export default function RepsPage() {
  const { data: reps, isLoading } = useRepProfiles();

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title="Sales Reps"
        subheading="Rep profiles with default commission share and overhead cap."
        showActionButton={false}
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (reps ?? []).length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No rep profiles yet. Create one by inserting a row in <code>rep_profile</code> with
          the auth user id.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {reps!.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{r.display_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.email ?? '—'} • {r.phone ?? '—'}
                  </div>
                </div>
                <Badge variant={r.active ? 'default' : 'outline'}>
                  {r.active ? 'active' : 'inactive'}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Default share</div>
                  <div>{r.default_commission_share_pct}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Overhead cap</div>
                  <div>{formatCents(r.default_overhead_cap_cents)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
