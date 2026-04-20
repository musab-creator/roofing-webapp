import React from 'react';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import AddAgentForm from '../../components/forms/crm/add-agent-form';
import { useAgents } from '../../hooks/useAPI/use-call-center';
import { formatCents } from '../../lib/money';

export default function CallCenterPage() {
  const { data: agents, isLoading } = useAgents();

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title="Call Center"
        subheading="Jordan-based agents — $280 base + $15/confirmed + $5/bad."
        actionButtonText="Add agent"
        sheetTitle="New agent"
        sheetDescription="Configure pay model and timezone."
        SheetContentBody={AddAgentForm}
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (agents ?? []).length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">No agents yet.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {agents!.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{a.display_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.supervisor_name ?? 'No supervisor'} • {a.timezone}
                  </div>
                </div>
                <Badge variant={a.active ? 'default' : 'outline'}>
                  {a.active ? 'active' : 'inactive'}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Base</div>
                  <div>{formatCents(a.base_pay_cents)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">$/confirmed</div>
                  <div>{formatCents(a.per_confirmed_cents)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">$/bad</div>
                  <div>{formatCents(a.per_bad_cents)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
