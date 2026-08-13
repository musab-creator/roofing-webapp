import React from 'react';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import AddRequestForm from '../../components/forms/crm/add-request-form';
import {
  useOpenRequests,
  useTransitionRequest,
  useRequests
} from '../../hooks/useAPI/use-request';
import type { Request, RequestStatus } from '../../types/crm_types';

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-amber-500 text-white',
  normal: 'bg-muted',
  low: 'bg-muted/60'
};

const REQUEST_LABEL: Record<string, string> = {
  permit_pull: 'Permit pull',
  supplement_draft: 'Supplement draft',
  crew_schedule: 'Crew schedule',
  material_order: 'Material order',
  cancel_lead: 'Cancel lead',
  inspection_report: 'Inspection report',
  contract_send: 'Send contract',
  other: 'Other'
};

export default function RequestsPage() {
  const [showAll, setShowAll] = React.useState(false);
  const open = useOpenRequests();
  const all = useRequests();
  const transition = useTransitionRequest();

  const data = showAll ? all.data : open.data;
  const isLoading = showAll ? all.isLoading : open.isLoading;

  const transitionTo = (r: Request, status: RequestStatus) =>
    transition.mutate({ id: r.id, status });

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title="Requests"
        subheading="Structured queue that replaces most rep-to-office text traffic."
        actionButtonText="New request"
        sheetTitle="Submit a request"
        SheetContentBody={AddRequestForm}
      />

      <div className="flex gap-2">
        <Button
          variant={showAll ? 'outline' : 'default'}
          size="sm"
          onClick={() => setShowAll(false)}>
          Open
        </Button>
        <Button
          variant={showAll ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAll(true)}>
          All
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No requests here.
        </Card>
      ) : (
        <ul className="space-y-2">
          {data!.map((r) => (
            <Card key={r.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className={PRIORITY_COLOR[r.priority]}>{r.priority}</Badge>
                  <Badge variant="outline">{REQUEST_LABEL[r.request_type]}</Badge>
                  <Badge variant="secondary" className="capitalize">{r.status}</Badge>
                </div>
                <div className="mt-1 font-medium">{r.subject}</div>
                {r.body ? (
                  <div className="text-sm text-muted-foreground truncate">{r.body}</div>
                ) : null}
                <div className="text-xs text-muted-foreground mt-1">
                  {r.due_at
                    ? `Due ${new Date(r.due_at).toLocaleString()}`
                    : r.sla_hours
                    ? `SLA ${r.sla_hours}h`
                    : null}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {r.status !== 'in_progress' ? (
                  <Button size="sm" variant="outline" onClick={() => transitionTo(r, 'in_progress')}>
                    Take
                  </Button>
                ) : null}
                {r.status !== 'blocked' ? (
                  <Button size="sm" variant="outline" onClick={() => transitionTo(r, 'blocked')}>
                    Block
                  </Button>
                ) : null}
                {r.status !== 'done' ? (
                  <Button size="sm" onClick={() => transitionTo(r, 'done')}>
                    Done
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
