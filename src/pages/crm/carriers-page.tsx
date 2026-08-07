import React from 'react';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import AddCarrierForm from '../../components/forms/crm/add-carrier-form';
import { useCarriers } from '../../hooks/useAPI/use-carrier';

export default function CarriersPage() {
  const { data: carriers, isLoading } = useCarriers();

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title="Carriers"
        subheading="Playbook notes per carrier: SLAs, typical objections, reviewer phrasing."
        actionButtonText="Add carrier"
        sheetTitle="New carrier"
        SheetContentBody={AddCarrierForm}
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(carriers ?? []).map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.phone ?? '—'} • {c.email ?? '—'}
                  </div>
                </div>
                {c.avg_response_days != null ? (
                  <Badge variant="outline">{c.avg_response_days}d avg</Badge>
                ) : null}
              </div>
              {c.notes_markdown ? (
                <pre className="mt-3 text-xs whitespace-pre-wrap text-muted-foreground line-clamp-4">
                  {c.notes_markdown}
                </pre>
              ) : (
                <div className="mt-3 text-xs text-muted-foreground italic">No playbook yet.</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
