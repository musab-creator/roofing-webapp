import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import SupplementBuilder from '../../components/crm/supplement-builder';
import { useSupplement, useUpdateSupplement } from '../../hooks/useAPI/use-supplement';
import type { SupplementStatus } from '../../types/crm_types';
import { exportSupplementAsEsx } from '../../lib/integrations/xactimate';

const STATUSES: SupplementStatus[] = [
  'draft',
  'submitted',
  'reviewing',
  'approved',
  'partial',
  'denied',
  'appealing'
];

export default function SupplementInfoPage() {
  const { id } = useParams<{ id: string }>();
  const suppId = id ? parseInt(id, 10) : undefined;
  const { data: supp, isLoading } = useSupplement(suppId);
  const update = useUpdateSupplement(toast);

  if (isLoading || !supp) {
    return <div className="p-6 text-sm text-muted-foreground">Loading supplement…</div>;
  }

  async function onExportEsx() {
    // TODO: integration — real ESX export. Currently stubbed.
    await exportSupplementAsEsx(supp!.line_items);
    toast({
      variant: 'default',
      title: 'ESX export',
      description: 'Xactimate ESX export is stubbed until sample files land.'
    });
  }

  return (
    <div className="flex flex-col w-full gap-4 mb-6">
      <PageHeader
        title={`Supplement #${supp.submission_number}`}
        subheading={`Claim ${supp.claim_id} • status ${supp.status}`}
        showActionButton={false}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3 lg:col-span-2">
          <SupplementBuilder supplementId={supp.id} initialItems={supp.line_items ?? []} />
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-2">
            <h3 className="text-base font-semibold">Status</h3>
            <Badge className="capitalize">{supp.status}</Badge>
            <Select
              value={supp.status}
              onValueChange={(v) =>
                update.mutate({
                  id: supp.id,
                  patch: {
                    status: v as SupplementStatus,
                    submitted_at:
                      v === 'submitted' ? new Date().toISOString() : supp.submitted_at,
                    response_at:
                      ['approved', 'partial', 'denied'].includes(v)
                        ? new Date().toISOString()
                        : supp.response_at
                  }
                })
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-4 space-y-2">
            <h3 className="text-base font-semibold">Export</h3>
            <Button size="sm" variant="outline" onClick={onExportEsx}>
              Export ESX (stub)
            </Button>
            <div className="text-xs text-muted-foreground">
              Full Xactimate export ships with Phase 4b.
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <h3 className="text-base font-semibold">Claim</h3>
            <Link to={`/crm/claims/${supp.claim_id}`} className="text-sm underline">
              Claim #{supp.claim_id}
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
