import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import AddLeadForm from '../../components/forms/crm/add-lead-form';
import { useLeads, useLeadStatuses } from '../../hooks/useAPI/use-lead';
import { formatCents } from '../../lib/money';
import type { LeadWithRelations, LeadStatus } from '../../types/crm_types';

export default function LeadsPage() {
  const { data: leads, isLoading } = useLeads();
  const { data: statuses } = useLeadStatuses();

  const columns = React.useMemo<LeadStatus[]>(() => {
    if (!statuses) return [];
    return [...statuses].sort((a, b) => a.sort_order - b.sort_order);
  }, [statuses]);

  const grouped = React.useMemo(() => {
    const map = new Map<number, LeadWithRelations[]>();
    (leads ?? []).forEach((l) => {
      const key = l.status_id ?? -1;
      const arr = map.get(key) ?? [];
      arr.push(l);
      map.set(key, arr);
    });
    return map;
  }, [leads]);

  return (
    <div className="flex flex-col w-full gap-6 mb-6">
      <PageHeader
        title="Leads"
        subheading="Pipeline from intake to collected. Drag support ships in a later phase."
        actionButtonText="Add lead"
        sheetTitle="New lead"
        sheetDescription="Intake from canvassing, inbound, referrals, or call-center review."
        SheetContentBody={AddLeadForm}
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map((status) => {
            const items = grouped.get(status.id) ?? [];
            return (
              <div key={status.id} className="min-w-[260px] flex-shrink-0">
                <Card className="p-3 bg-muted/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">{status.name}</span>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="space-y-2 max-h-[65vh] overflow-y-auto">
                    {items.map((l) => (
                      <Link
                        key={l.id}
                        to={`/crm/leads/${l.id}`}
                        className="block bg-background rounded-md p-2 border hover:border-primary transition">
                        <div className="text-sm font-medium truncate">
                          {l.first_name} {l.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {l.street_address}, {l.city} {l.state}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {l.source?.name ?? '—'}
                          </span>
                          {l.score != null ? (
                            <Badge variant={l.score >= 70 ? 'default' : 'outline'}>
                              {l.score}
                            </Badge>
                          ) : null}
                        </div>
                        {l.home_value_cents ? (
                          <div className="text-xs mt-1">{formatCents(l.home_value_cents)}</div>
                        ) : null}
                      </Link>
                    ))}
                    {items.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic px-2 py-4 text-center">
                        empty
                      </div>
                    ) : null}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
