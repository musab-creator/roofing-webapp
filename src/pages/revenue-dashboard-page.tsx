import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import RoofingDashboard, {
  sampleInvoices,
  DashboardInvoice,
  InvoiceStatusName
} from '../components/dashboard/revenue-dashboard';
import { useFetchAllInvoices } from '../hooks/useAPI/use-invoice';
import { InvoiceWithRelations } from '../types/db_types';

const KNOWN_STATUSES: InvoiceStatusName[] = ['Paid', 'Pending', 'Overdue', 'Draft'];

/** Map a Supabase invoice row (with joined relations) to the dashboard's prop shape. */
const toDashboardInvoice = (invoice: InvoiceWithRelations): DashboardInvoice => {
  const statusName = invoice.invoice_status?.name;
  const status: InvoiceStatusName = KNOWN_STATUSES.includes(statusName as InvoiceStatusName)
    ? (statusName as InvoiceStatusName)
    : 'Pending';
  const customerName =
    `${invoice.customer?.first_name ?? ''} ${invoice.customer?.last_name ?? ''}`.trim() ||
    'Unknown Customer';
  return {
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    total: invoice.total ?? 0,
    amount_due: invoice.amount_due ?? 0,
    status,
    customer_name: customerName,
    service_type: invoice.service?.name ?? 'Other'
  };
};

export default function RevenueDashboardPage() {
  const { data: invoices, isLoading } = useFetchAllInvoices();

  const dashboardInvoices: DashboardInvoice[] = React.useMemo(() => {
    if (!invoices || invoices.length === 0) return sampleInvoices;
    return (invoices as InvoiceWithRelations[]).map(toDashboardInvoice);
  }, [invoices]);

  const usingSampleData = !isLoading && (!invoices || invoices.length === 0);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        {usingSampleData && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
            Showing sample data — no invoices found
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <RoofingDashboard invoices={dashboardInvoices} />
      )}
    </div>
  );
}
