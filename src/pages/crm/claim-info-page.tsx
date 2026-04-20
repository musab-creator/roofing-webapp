import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { toast } from '../../components/ui/use-toast';
import { useClaim } from '../../hooks/useAPI/use-claim';
import { useCreateSupplement, useSupplementsByClaim } from '../../hooks/useAPI/use-supplement';
import { formatCents } from '../../lib/money';

export default function ClaimInfoPage() {
  const { id } = useParams<{ id: string }>();
  const claimId = id ? parseInt(id, 10) : undefined;
  const { data: claim, isLoading } = useClaim(claimId);
  const { data: supplements } = useSupplementsByClaim(claimId);
  const createSupp = useCreateSupplement(toast);

  if (isLoading || !claim) {
    return <div className="p-6 text-sm text-muted-foreground">Loading claim…</div>;
  }

  const nextNum = (supplements?.length ?? 0) + 1;

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title={claim.claim_number ?? `Claim #${claim.id}`}
        subheading={`${claim.carrier?.name ?? 'No carrier'} • ${claim.status}`}
        showActionButton={false}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3 lg:col-span-2">
          <h3 className="text-base font-semibold">Claim details</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-muted-foreground">Adjuster</div>
            <div>{claim.adjuster_name ?? '—'}</div>
            <div className="text-muted-foreground">Adjuster phone</div>
            <div>{claim.adjuster_phone ?? '—'}</div>
            <div className="text-muted-foreground">Adjuster email</div>
            <div>{claim.adjuster_email ?? '—'}</div>
            <div className="text-muted-foreground">Policy #</div>
            <div>{claim.policy_number ?? '—'}</div>
            <div className="text-muted-foreground">Loss date</div>
            <div>{claim.loss_date ?? '—'}</div>
            <div className="text-muted-foreground">Deductible</div>
            <div>{claim.deductible_cents != null ? formatCents(claim.deductible_cents) : '—'}</div>
            <div className="text-muted-foreground">ACV</div>
            <div>{claim.acv_cents != null ? formatCents(claim.acv_cents) : '—'}</div>
            <div className="text-muted-foreground">RCV</div>
            <div>{claim.rcv_cents != null ? formatCents(claim.rcv_cents) : '—'}</div>
            <div className="text-muted-foreground">Rec. depreciation</div>
            <div>
              {claim.recoverable_depreciation_cents != null
                ? formatCents(claim.recoverable_depreciation_cents)
                : '—'}
            </div>
          </div>
          {claim.notes ? (
            <>
              <Separator />
              <div className="text-sm whitespace-pre-wrap">{claim.notes}</div>
            </>
          ) : null}
        </Card>

        <Card className="p-4 space-y-2">
          <h3 className="text-base font-semibold">Lead</h3>
          <Link to={`/crm/leads/${claim.lead_id}`} className="text-sm underline">
            View lead #{claim.lead_id}
          </Link>
          {claim.lead ? (
            <div className="text-sm text-muted-foreground">
              {claim.lead.first_name} {claim.lead.last_name}
              <br />
              {claim.lead.street_address}
              <br />
              {claim.lead.city}, {claim.lead.state} {claim.lead.zipcode}
            </div>
          ) : null}
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Supplements</h3>
          <Button
            size="sm"
            onClick={() =>
              createSupp.mutate({
                claim_id: claim.id,
                submission_number: nextNum,
                status: 'draft'
              })
            }>
            Start draft #{nextNum}
          </Button>
        </div>
        {(supplements ?? []).length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No supplements yet.</div>
        ) : (
          <ul className="space-y-2">
            {supplements!.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/crm/supplements/${s.id}`}
                  className="block p-2 border rounded hover:border-primary text-sm">
                  <div className="flex justify-between">
                    <span>Submission #{s.submission_number}</span>
                    <Badge variant="outline" className="capitalize">
                      {s.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Requested{' '}
                    {s.amount_requested_cents != null
                      ? formatCents(s.amount_requested_cents)
                      : '—'}{' '}
                    • approved{' '}
                    {s.amount_approved_cents != null
                      ? formatCents(s.amount_approved_cents)
                      : '—'}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
