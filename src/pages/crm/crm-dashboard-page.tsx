import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  SpeechIcon,
  FileTextIcon,
  ClipboardListIcon,
  DollarSignIcon,
  PhoneIncomingIcon,
  ShieldCheckIcon,
  MapIcon,
  UsersIcon
} from 'lucide-react';
import { useLeads } from '../../hooks/useAPI/use-lead';
import { useClaims } from '../../hooks/useAPI/use-claim';
import { useOpenRequests } from '../../hooks/useAPI/use-request';
import { useCommissions } from '../../hooks/useAPI/use-commission';
import { formatCents } from '../../lib/money';
import {
  JOB_THROUGHPUT,
  throughputTier
} from '../../lib/commission-math';

const MODULES = [
  { to: '/crm/leads', label: 'Leads', icon: <SpeechIcon className="h-4 w-4" /> },
  { to: '/crm/claims', label: 'Claims', icon: <ShieldCheckIcon className="h-4 w-4" /> },
  { to: '/crm/requests', label: 'Requests', icon: <ClipboardListIcon className="h-4 w-4" /> },
  { to: '/crm/commissions', label: 'Commissions', icon: <DollarSignIcon className="h-4 w-4" /> },
  { to: '/crm/call-center', label: 'Call Center', icon: <PhoneIncomingIcon className="h-4 w-4" /> },
  { to: '/crm/carriers', label: 'Carriers', icon: <FileTextIcon className="h-4 w-4" /> },
  { to: '/crm/territories', label: 'Territories', icon: <MapIcon className="h-4 w-4" /> },
  { to: '/crm/reps', label: 'Reps', icon: <UsersIcon className="h-4 w-4" /> }
];

export default function CrmDashboardPage() {
  const { data: leads } = useLeads();
  const { data: claims } = useClaims();
  const { data: openReqs } = useOpenRequests();
  const { data: commissions } = useCommissions();

  const openLeadCount = (leads ?? []).filter((l) => !l.status?.is_terminal).length;
  const filedClaimCount = (claims ?? []).filter((c) => c.status !== 'draft').length;
  const paidThisMonth = (commissions ?? [])
    .filter((c) => c.status === 'paid' && c.paid_at && new Date(c.paid_at).getMonth() === new Date().getMonth())
    .reduce((acc, c) => acc + c.payout_cents, 0);

  // Monthly throughput = commissions recorded this month (crude proxy for jobs).
  const thisMonthJobs = (commissions ?? []).filter(
    (c) => c.created_at && new Date(c.created_at).getMonth() === new Date().getMonth()
  ).length;
  const tier = throughputTier(thisMonthJobs);

  const tierBadge =
    tier === 'target'
      ? 'bg-emerald-500 text-white'
      : tier === 'growth'
      ? 'bg-sky-500 text-white'
      : tier === 'break_even'
      ? 'bg-amber-500 text-white'
      : 'bg-red-500 text-white';

  return (
    <div className="flex flex-col w-full gap-6 mb-6">
      <PageHeader
        title="CRM"
        subheading="Unified view across leads, claims, requests, commissions, and call center."
        showActionButton={false}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Open leads</div>
          <div className="text-3xl font-semibold">{openLeadCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Active claims</div>
          <div className="text-3xl font-semibold">{filedClaimCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Open requests</div>
          <div className="text-3xl font-semibold">{(openReqs ?? []).length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Commissions this month</div>
          <div className="text-3xl font-semibold">{formatCents(paidThisMonth)}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Throughput this month</div>
            <div className="text-2xl font-semibold">{thisMonthJobs} deals</div>
            <div className="text-xs text-muted-foreground">
              Break-even {JOB_THROUGHPUT.breakEvenPerMonth} • growth{' '}
              {JOB_THROUGHPUT.healthyGrowthPerMonth} • $1M target{' '}
              {JOB_THROUGHPUT.millionDollarTargetPerMonth}
            </div>
          </div>
          <Badge className={`capitalize ${tierBadge}`}>{tier.replace('_', ' ')}</Badge>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="p-4 flex items-center gap-3 hover:border-primary transition">
              {m.icon}
              <span className="font-medium">{m.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
