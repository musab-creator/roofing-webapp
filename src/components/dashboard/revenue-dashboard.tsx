import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  HardHat
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type InvoiceStatusName = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export type DashboardInvoice = {
  id: number;
  invoice_number: number;
  invoice_date: string;
  due_date: string;
  total: number;
  amount_due: number;
  status: InvoiceStatusName;
  customer_name: string;
  service_type: string;
};

type Props = { invoices: DashboardInvoice[] };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);

const shortUsd = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return usd(n);
};

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

// ─── Sample Data ─────────────────────────────────────────────────────────────

export const sampleInvoices: DashboardInvoice[] = [
  // Month -11 (September last year)
  {
    id: 1,
    invoice_number: 10041,
    invoice_date: '2025-09-03',
    due_date: '2025-09-18',
    total: 12400,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Marcus Hensley',
    service_type: 'Roof Replacement'
  },
  {
    id: 2,
    invoice_number: 10042,
    invoice_date: '2025-09-14',
    due_date: '2025-09-29',
    total: 3200,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Angela Torres',
    service_type: 'Roof Repair'
  },
  // Month -10 (October)
  {
    id: 3,
    invoice_number: 10043,
    invoice_date: '2025-10-01',
    due_date: '2025-10-16',
    total: 18700,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Derek Okonkwo',
    service_type: 'Roof Replacement'
  },
  {
    id: 4,
    invoice_number: 10044,
    invoice_date: '2025-10-08',
    due_date: '2025-10-23',
    total: 4500,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Sandra Kim',
    service_type: 'Gutter Installation'
  },
  {
    id: 5,
    invoice_number: 10045,
    invoice_date: '2025-10-20',
    due_date: '2025-11-04',
    total: 2700,
    amount_due: 2700,
    status: 'Overdue',
    customer_name: 'Pete Whitmore',
    service_type: 'Skylight Installation'
  },
  // Month -9 (November)
  {
    id: 6,
    invoice_number: 10046,
    invoice_date: '2025-11-05',
    due_date: '2025-11-20',
    total: 9800,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Veronica Sloane',
    service_type: 'Roof Replacement'
  },
  {
    id: 7,
    invoice_number: 10047,
    invoice_date: '2025-11-12',
    due_date: '2025-11-27',
    total: 6200,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Marcus Hensley',
    service_type: 'Flat Roof Coating'
  },
  {
    id: 8,
    invoice_number: 10048,
    invoice_date: '2025-11-22',
    due_date: '2025-12-07',
    total: 1450,
    amount_due: 1450,
    status: 'Overdue',
    customer_name: 'Tommy Breck',
    service_type: 'Roof Repair'
  },
  // Month -8 (December)
  {
    id: 9,
    invoice_number: 10049,
    invoice_date: '2025-12-02',
    due_date: '2025-12-17',
    total: 22300,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Angela Torres',
    service_type: 'Roof Replacement'
  },
  {
    id: 10,
    invoice_number: 10050,
    invoice_date: '2025-12-09',
    due_date: '2025-12-24',
    total: 3800,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Sandra Kim',
    service_type: 'Gutter Installation'
  },
  {
    id: 11,
    invoice_number: 10051,
    invoice_date: '2025-12-18',
    due_date: '2026-01-02',
    total: 5100,
    amount_due: 5100,
    status: 'Overdue',
    customer_name: 'Leo Frazier',
    service_type: 'Skylight Installation'
  },
  // Month -7 (January)
  {
    id: 12,
    invoice_number: 10052,
    invoice_date: '2026-01-06',
    due_date: '2026-01-21',
    total: 14200,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Derek Okonkwo',
    service_type: 'Roof Replacement'
  },
  {
    id: 13,
    invoice_number: 10053,
    invoice_date: '2026-01-15',
    due_date: '2026-01-30',
    total: 2900,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Veronica Sloane',
    service_type: 'Roof Repair'
  },
  // Month -6 (February)
  {
    id: 14,
    invoice_number: 10054,
    invoice_date: '2026-02-03',
    due_date: '2026-02-18',
    total: 19500,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Marcus Hensley',
    service_type: 'Roof Replacement'
  },
  {
    id: 15,
    invoice_number: 10055,
    invoice_date: '2026-02-14',
    due_date: '2026-03-01',
    total: 4100,
    amount_due: 4100,
    status: 'Pending',
    customer_name: 'Rachel Patel',
    service_type: 'Flat Roof Coating'
  },
  {
    id: 16,
    invoice_number: 10056,
    invoice_date: '2026-02-25',
    due_date: '2026-03-12',
    total: 7300,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Angela Torres',
    service_type: 'Gutter Installation'
  },
  // Month -5 (March)
  {
    id: 17,
    invoice_number: 10057,
    invoice_date: '2026-03-04',
    due_date: '2026-03-19',
    total: 28000,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Leo Frazier',
    service_type: 'Roof Replacement'
  },
  {
    id: 18,
    invoice_number: 10058,
    invoice_date: '2026-03-17',
    due_date: '2026-04-01',
    total: 5600,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Sandra Kim',
    service_type: 'Skylight Installation'
  },
  // Month -4 (April)
  {
    id: 19,
    invoice_number: 10059,
    invoice_date: '2026-04-01',
    due_date: '2026-04-16',
    total: 16800,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Derek Okonkwo',
    service_type: 'Roof Replacement'
  },
  {
    id: 20,
    invoice_number: 10060,
    invoice_date: '2026-04-10',
    due_date: '2026-04-25',
    total: 3350,
    amount_due: 3350,
    status: 'Pending',
    customer_name: 'Tommy Breck',
    service_type: 'Roof Repair'
  },
  {
    id: 21,
    invoice_number: 10061,
    invoice_date: '2026-04-22',
    due_date: '2026-05-07',
    total: 6700,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Veronica Sloane',
    service_type: 'Gutter Installation'
  },
  // Month -3 (May)
  {
    id: 22,
    invoice_number: 10062,
    invoice_date: '2026-05-05',
    due_date: '2026-05-20',
    total: 21000,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Marcus Hensley',
    service_type: 'Roof Replacement'
  },
  {
    id: 23,
    invoice_number: 10063,
    invoice_date: '2026-05-18',
    due_date: '2026-06-02',
    total: 4800,
    amount_due: 4800,
    status: 'Pending',
    customer_name: 'Rachel Patel',
    service_type: 'Flat Roof Coating'
  },
  {
    id: 24,
    invoice_number: 10064,
    invoice_date: '2026-05-27',
    due_date: '2026-06-11',
    total: 8200,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Angela Torres',
    service_type: 'Roof Repair'
  },
  // Month -2 (June)
  {
    id: 25,
    invoice_number: 10065,
    invoice_date: '2026-06-03',
    due_date: '2026-06-18',
    total: 31500,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Leo Frazier',
    service_type: 'Roof Replacement'
  },
  {
    id: 26,
    invoice_number: 10066,
    invoice_date: '2026-06-16',
    due_date: '2026-07-01',
    total: 5950,
    amount_due: 5950,
    status: 'Pending',
    customer_name: 'Sandra Kim',
    service_type: 'Skylight Installation'
  },
  // Month -1 (July)
  {
    id: 27,
    invoice_number: 10067,
    invoice_date: '2026-07-07',
    due_date: '2026-07-22',
    total: 17400,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Derek Okonkwo',
    service_type: 'Roof Replacement'
  },
  {
    id: 28,
    invoice_number: 10068,
    invoice_date: '2026-07-14',
    due_date: '2026-07-29',
    total: 6400,
    amount_due: 6400,
    status: 'Pending',
    customer_name: 'Rachel Patel',
    service_type: 'Flat Roof Coating'
  },
  {
    id: 29,
    invoice_number: 10069,
    invoice_date: '2026-07-21',
    due_date: '2026-08-05',
    total: 2850,
    amount_due: 0,
    status: 'Paid',
    customer_name: 'Tommy Breck',
    service_type: 'Roof Repair'
  },
  // Current month (August)
  {
    id: 30,
    invoice_number: 10070,
    invoice_date: '2026-08-01',
    due_date: '2026-08-16',
    total: 9200,
    amount_due: 9200,
    status: 'Draft',
    customer_name: 'Veronica Sloane',
    service_type: 'Gutter Installation'
  },
  {
    id: 31,
    invoice_number: 10071,
    invoice_date: '2026-08-02',
    due_date: '2026-08-17',
    total: 24000,
    amount_due: 24000,
    status: 'Pending',
    customer_name: 'Marcus Hensley',
    service_type: 'Roof Replacement'
  }
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InvoiceStatusName, { bg: string; text: string; dot: string }> = {
  Paid: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  Overdue: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  Draft: { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' }
};

function StatusBadge({ status }: { status: InvoiceStatusName }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

type KpiProps = {
  label: string;
  value: string;
  sub?: string;
  delta: number | null;
  icon: React.ReactNode;
  accentClass: string;
};

function KpiCard({ label, value, sub, delta, icon, accentClass }: KpiProps) {
  const isPositive = delta !== null && delta > 0;
  const isNegative = delta !== null && delta < 0;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col gap-4">
      {/* accent glow */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${accentClass}`}
      />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-400 leading-snug">{label}</p>
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${accentClass} bg-opacity-20`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {delta !== null && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'}`}>
          {isPositive ? (
            <TrendingUp size={13} />
          ) : isNegative ? (
            <TrendingDown size={13} />
          ) : (
            <Minus size={13} />
          )}
          <span>
            {isPositive ? '+' : ''}
            {delta.toFixed(1)}% vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{shortUsd(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function RoofingDashboard({ invoices }: Props) {
  // ── Derived metrics ────────────────────────────────────────────────────────
  const { kpis, monthlyData, statusBreakdown, serviceRevenue, topCustomers, recentInvoices } =
    useMemo(() => {
      const now = new Date();
      const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

      // ── Monthly buckets: last 12 months ──
      const monthKeys: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
      type MonthBucket = { billed: number; collected: number };
      const buckets: Record<string, MonthBucket> = {};
      monthKeys.forEach((k) => {
        buckets[k] = { billed: 0, collected: 0 };
      });

      invoices.forEach((inv) => {
        const key = inv.invoice_date.slice(0, 7);
        if (buckets[key]) {
          buckets[key].billed += inv.total;
          buckets[key].collected += inv.total - inv.amount_due;
        }
      });

      const monthlyData = monthKeys.map((k) => ({
        month: MONTH_LABELS[parseInt(k.split('-')[1]) - 1],
        Collected: buckets[k].collected,
        Billed: buckets[k].billed
      }));

      const thisBucket = buckets[thisMonthKey] ?? { billed: 0, collected: 0 };
      const prevBucket = buckets[prevMonthKey] ?? { billed: 0, collected: 0 };

      // ── KPI: Total Revenue (all-time collected) ──
      const totalRevenue = invoices.reduce((s, inv) => s + inv.total - inv.amount_due, 0);
      const prevRevenue = prevBucket.collected;
      const thisRevenue = thisBucket.collected;
      const revDelta = prevRevenue > 0 ? ((thisRevenue - prevRevenue) / prevRevenue) * 100 : null;

      // ── KPI: Outstanding A/R ──
      const outstandingAR = invoices
        .filter((inv) => inv.status !== 'Paid' && inv.status !== 'Draft')
        .reduce((s, inv) => s + inv.amount_due, 0);

      // ── KPI: Overdue ──
      const overdueInvs = invoices.filter((inv) => inv.status === 'Overdue');
      const overdueAmount = overdueInvs.reduce((s, inv) => s + inv.amount_due, 0);
      const overdueCount = overdueInvs.length;

      // ── KPI: Avg invoice value ──
      const avgInvoice =
        invoices.length > 0 ? invoices.reduce((s, inv) => s + inv.total, 0) / invoices.length : 0;
      const prevInvs = invoices.filter((inv) => inv.invoice_date.slice(0, 7) === prevMonthKey);
      const thisInvs = invoices.filter((inv) => inv.invoice_date.slice(0, 7) === thisMonthKey);
      const prevAvg =
        prevInvs.length > 0 ? prevInvs.reduce((s, i) => s + i.total, 0) / prevInvs.length : 0;
      const thisAvg =
        thisInvs.length > 0 ? thisInvs.reduce((s, i) => s + i.total, 0) / thisInvs.length : 0;
      const avgDelta = prevAvg > 0 ? ((thisAvg - prevAvg) / prevAvg) * 100 : null;

      const kpis = {
        totalRevenue,
        revDelta,
        outstandingAR,
        overdueAmount,
        overdueCount,
        avgInvoice,
        avgDelta
      };

      // ── Status breakdown ──
      const statusMap: Record<string, { count: number; total: number }> = {};
      invoices.forEach((inv) => {
        if (!statusMap[inv.status]) statusMap[inv.status] = { count: 0, total: 0 };
        statusMap[inv.status].count += 1;
        statusMap[inv.status].total += inv.total;
      });
      const statusBreakdown = Object.entries(statusMap).map(([name, v]) => ({ name, ...v }));

      // ── Revenue by service type ──
      const svcMap: Record<string, number> = {};
      invoices.forEach((inv) => {
        svcMap[inv.service_type] = (svcMap[inv.service_type] ?? 0) + (inv.total - inv.amount_due);
      });
      const serviceRevenue = Object.entries(svcMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

      // ── Top 5 customers ──
      const custMap: Record<string, number> = {};
      invoices.forEach((inv) => {
        custMap[inv.customer_name] =
          (custMap[inv.customer_name] ?? 0) + (inv.total - inv.amount_due);
      });
      const topCustomers = Object.entries(custMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // ── Recent invoices (10 newest) ──
      const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())
        .slice(0, 10);

      return { kpis, monthlyData, statusBreakdown, serviceRevenue, topCustomers, recentInvoices };
    }, [invoices]);

  // ── Donut colors ──
  const STATUS_COLORS: Record<string, string> = {
    Paid: '#10b981',
    Pending: '#f59e0b',
    Overdue: '#ef4444',
    Draft: '#64748b'
  };

  const AVATAR_COLORS = [
    'bg-blue-600',
    'bg-violet-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8 font-sans">
      {/* ── Header ── */}
      <header className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <HardHat size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Revenue Analytics</h1>
            <p className="text-sm text-slate-400">Roofing Operations Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-slate-300 font-medium">Live Data</span>
        </div>
      </header>

      {/* ── KPI Row ── */}
      <section
        aria-label="Key performance indicators"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Revenue Collected"
          value={shortUsd(kpis.totalRevenue)}
          sub={usd(kpis.totalRevenue)}
          delta={kpis.revDelta}
          icon={<DollarSign size={18} className="text-blue-400" />}
          accentClass="bg-blue-500"
        />
        <KpiCard
          label="Outstanding A/R"
          value={shortUsd(kpis.outstandingAR)}
          sub="Unpaid invoices"
          delta={null}
          icon={<Clock size={18} className="text-amber-400" />}
          accentClass="bg-amber-500"
        />
        <KpiCard
          label="Overdue"
          value={shortUsd(kpis.overdueAmount)}
          sub={`${kpis.overdueCount} invoice${kpis.overdueCount !== 1 ? 's' : ''} past due`}
          delta={null}
          icon={<AlertTriangle size={18} className="text-red-400" />}
          accentClass="bg-red-500"
        />
        <KpiCard
          label="Avg Invoice Value"
          value={shortUsd(kpis.avgInvoice)}
          sub="All invoices"
          delta={kpis.avgDelta}
          icon={<FileText size={18} className="text-violet-400" />}
          accentClass="bg-violet-500"
        />
      </section>

      {/* ── Charts Row 1: Area + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Monthly Revenue Area Chart */}
        <section
          aria-label="Monthly revenue chart"
          className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-white">Monthly Revenue</h2>
            <p className="text-sm text-slate-400">Collected vs Billed — last 12 months</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => shortUsd(v)}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="Billed"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#gradBilled)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="Collected"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#gradCollected)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* Status Donut */}
        <section
          aria-label="Invoice status breakdown"
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-white">Invoice Status</h2>
            <p className="text-sm text-slate-400">Breakdown by count & value</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="name"
                  strokeWidth={0}>
                  {statusBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { name: string; total: number; count: number };
                    return (
                      <div className="rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur p-3 shadow-xl text-xs">
                        <p className="text-white font-semibold mb-1">{d.name}</p>
                        <p className="text-slate-300">
                          {d.count} invoice{d.count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-white font-bold">{usd(d.total)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 mt-2">
            {statusBreakdown.map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: STATUS_COLORS[s.name] ?? '#64748b' }}
                  />
                  <span className="text-slate-300">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{s.count}</span>
                  <span className="text-white font-medium">{shortUsd(s.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Charts Row 2: Bar + Top Customers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue by Service Type */}
        <section
          aria-label="Revenue by service type"
          className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-white">Revenue by Service</h2>
            <p className="text-sm text-slate-400">Collected revenue per service category</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={serviceRevenue}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0f" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => shortUsd(v)}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" fill="url(#barGrad)" radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Top 5 Customers */}
        <section
          aria-label="Top customers by revenue"
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-white">Top Customers</h2>
            <p className="text-sm text-slate-400">By collected revenue</p>
          </div>
          <ol className="flex-1 space-y-3">
            {topCustomers.map((c, i) => (
              <li key={c.name} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-3 text-center font-bold">{i + 1}</span>
                <div
                  className={`w-9 h-9 rounded-xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center shrink-0`}
                  aria-hidden="true">
                  <span className="text-xs font-bold text-white">{initials(c.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      style={{ width: `${(c.revenue / topCustomers[0].revenue) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-white shrink-0">{shortUsd(c.revenue)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* ── Recent Invoices Table ── */}
      <section
        aria-label="Recent invoices"
        className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Recent Invoices</h2>
            <p className="text-sm text-slate-400">10 most recent</p>
          </div>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  scope="col"
                  className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">
                  Invoice
                </th>
                <th
                  scope="col"
                  className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">
                  Customer
                </th>
                <th
                  scope="col"
                  className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4 hidden sm:table-cell">
                  Service
                </th>
                <th
                  scope="col"
                  className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4 hidden md:table-cell">
                  Date
                </th>
                <th
                  scope="col"
                  className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pr-4">
                  Total
                </th>
                <th
                  scope="col"
                  className="pb-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className="font-mono text-slate-300 text-xs">#{inv.invoice_number}</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-blue-400">
                          {initials(inv.customer_name)}
                        </span>
                      </div>
                      <span className="text-white font-medium whitespace-nowrap">
                        {inv.customer_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 hidden sm:table-cell">
                    <span className="text-slate-400">{inv.service_type}</span>
                  </td>
                  <td className="py-3.5 pr-4 hidden md:table-cell">
                    <span className="text-slate-400">
                      {new Date(inv.invoice_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <span className="text-white font-semibold">{usd(inv.total)}</span>
                  </td>
                  <td className="py-3.5 text-right">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
