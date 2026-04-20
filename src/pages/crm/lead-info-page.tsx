import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../components/ui/use-toast';
import {
  useLead,
  useLeadActivities,
  useLogLeadActivity,
  useUpdateLead,
  useLeadStatuses,
  useBadLeadReasons
} from '../../hooks/useAPI/use-lead';
import { useClaimsByLead } from '../../hooks/useAPI/use-claim';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import { formatCents } from '../../lib/money';

export default function LeadInfoPage() {
  const { id } = useParams<{ id: string }>();
  const leadId = id ? parseInt(id, 10) : undefined;
  const { data: lead, isLoading } = useLead(leadId);
  const { data: activities } = useLeadActivities(leadId);
  const { data: claims } = useClaimsByLead(leadId);
  const { data: statuses } = useLeadStatuses();
  const { data: reasons } = useBadLeadReasons();
  const update = useUpdateLead(toast);
  const logActivity = useLogLeadActivity();

  const [note, setNote] = React.useState('');

  if (isLoading || !lead) {
    return <div className="p-6 text-sm text-muted-foreground">Loading lead…</div>;
  }

  const onChangeStatus = (newId: string) => {
    update.mutate({ id: lead.id, patch: { status_id: parseInt(newId, 10) } });
    logActivity.mutate({
      lead_id: lead.id,
      activity_type: 'status_change',
      body: `Status set to ${statuses?.find((s) => s.id === parseInt(newId, 10))?.name}`
    });
  };

  const onAddNote = () => {
    if (!note.trim()) return;
    logActivity.mutate({ lead_id: lead.id, activity_type: 'note', body: note });
    setNote('');
  };

  const onMarkBad = (reasonId: string) => {
    const lostStatus = statuses?.find((s) => s.name === 'Lost (Bad Lead)');
    update.mutate({
      id: lead.id,
      patch: {
        bad_lead_reason_id: parseInt(reasonId, 10),
        status_id: lostStatus?.id,
        bad_lead_credit_requested_at: new Date().toISOString()
      }
    });
    logActivity.mutate({
      lead_id: lead.id,
      activity_type: 'status_change',
      body: `Marked bad lead (${reasons?.find((r) => r.id === parseInt(reasonId, 10))?.label}); credit requested from vendor.`
    });
  };

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title={`${lead.first_name} ${lead.last_name}`}
        subheading={`${lead.street_address ?? ''}, ${lead.city ?? ''} ${lead.state ?? ''} ${lead.zipcode ?? ''}`}
        showActionButton={false}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3 lg:col-span-2">
          <h3 className="text-base font-semibold">Details</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Phone</div>
            <div>{lead.phone ?? '—'}</div>
            <div className="text-muted-foreground">Email</div>
            <div>{lead.email ?? '—'}</div>
            <div className="text-muted-foreground">Source</div>
            <div>{lead.source?.name ?? '—'}</div>
            <div className="text-muted-foreground">Territory</div>
            <div>{lead.territory?.name ?? '—'}</div>
            <div className="text-muted-foreground">Carrier</div>
            <div>{lead.carrier?.name ?? '—'}</div>
            <div className="text-muted-foreground">Roof age</div>
            <div>{lead.roof_age_years != null ? `${lead.roof_age_years}y` : '—'}</div>
            <div className="text-muted-foreground">Home value</div>
            <div>{lead.home_value_cents != null ? formatCents(lead.home_value_cents) : '—'}</div>
            <div className="text-muted-foreground">Score</div>
            <div>{lead.score ?? '—'}</div>
          </div>

          {lead.notes ? (
            <>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Notes</div>
                <div className="text-sm whitespace-pre-wrap">{lead.notes}</div>
              </div>
            </>
          ) : null}

          <Separator />
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Add note / log call</div>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            <Button size="sm" onClick={onAddNote} disabled={!note.trim()}>
              Log activity
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="text-base font-semibold">Status</h3>
            <div>
              <Badge className="mb-2">{lead.status?.name ?? 'No status'}</Badge>
              <Select value={lead.status_id ? String(lead.status_id) : undefined} onValueChange={onChangeStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {lead.bad_lead_reason_id == null ? (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-1">Mark bad lead</div>
                <Select onValueChange={onMarkBad}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons?.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="pt-2 border-t text-xs">
                <div className="text-red-600 font-medium">
                  Bad: {lead.bad_lead_reason?.label}
                </div>
                <div className="text-muted-foreground">
                  Credit {lead.bad_lead_credit_received ? 'received' : 'requested'}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold">Claims</h3>
              <Link to="/crm/claims" className="text-xs underline">
                view all
              </Link>
            </div>
            {(claims ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground italic">No claims yet.</div>
            ) : (
              claims!.map((c) => (
                <Link key={c.id} to={`/crm/claims/${c.id}`} className="block text-sm underline">
                  {c.claim_number ?? `Claim #${c.id}`} — {c.status}
                </Link>
              ))
            )}
          </Card>
        </div>
      </div>

      <Card className="p-4 space-y-2">
        <h3 className="text-base font-semibold">Activity</h3>
        {(activities ?? []).length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No activity yet.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {activities!.map((a) => (
              <li key={a.id} className="flex gap-3">
                <Badge variant="outline" className="h-5 mt-0.5 capitalize">
                  {a.activity_type.replace('_', ' ')}
                </Badge>
                <div className="flex-1">
                  <div className="whitespace-pre-wrap">{a.body}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.occurred_at).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
