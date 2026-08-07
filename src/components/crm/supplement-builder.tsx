import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from '../ui/use-toast';
import { useUpsertLineItems, useDeleteLineItem } from '../../hooks/useAPI/use-supplement';
import type { SupplementLineItem } from '../../types/crm_types';
import { dollarsToCents, centsToDollars, formatCents } from '../../lib/money';

type Props = {
  supplementId: number;
  initialItems: SupplementLineItem[];
};

type Row = {
  id?: number;
  xactimate_code: string;
  description: string;
  qty: number;
  unit: string;
  rate_dollars: number;
  amount_dollars: number;
};

function rowFromItem(li: SupplementLineItem): Row {
  return {
    id: li.id,
    xactimate_code: li.xactimate_code ?? '',
    description: li.description,
    qty: Number(li.qty ?? 1),
    unit: li.unit ?? '',
    rate_dollars: centsToDollars(li.rate_cents ?? 0),
    amount_dollars: centsToDollars(li.amount_cents ?? 0)
  };
}

export default function SupplementBuilder({ supplementId, initialItems }: Props) {
  const [rows, setRows] = React.useState<Row[]>(() =>
    initialItems.length > 0 ? initialItems.map(rowFromItem) : [blankRow()]
  );
  const upsert = useUpsertLineItems();
  const del = useDeleteLineItem();

  function blankRow(): Row {
    return {
      xactimate_code: '',
      description: '',
      qty: 1,
      unit: 'EA',
      rate_dollars: 0,
      amount_dollars: 0
    };
  }

  function updateRow(i: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((r, idx) => {
        if (idx !== i) return r;
        const next = { ...r, ...patch };
        if (patch.qty !== undefined || patch.rate_dollars !== undefined) {
          next.amount_dollars = Number((next.qty * next.rate_dollars).toFixed(2));
        }
        return next;
      })
    );
  }

  function addRow() {
    setRows((prev) => [...prev, blankRow()]);
  }

  async function removeRow(i: number) {
    const row = rows[i];
    if (row.id) {
      await del.mutateAsync(row.id);
    }
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    const payload = rows.map((r, idx) => ({
      id: r.id,
      supplement_id: supplementId,
      xactimate_code: r.xactimate_code || undefined,
      description: r.description,
      qty: r.qty,
      unit: r.unit || undefined,
      rate_cents: dollarsToCents(r.rate_dollars),
      amount_cents: dollarsToCents(r.amount_dollars),
      sort_order: idx
    }));
    await upsert.mutateAsync(payload);
    toast({ variant: 'success', title: 'Line items saved' });
  }

  const total_cents = rows.reduce((acc, r) => acc + dollarsToCents(r.amount_dollars), 0);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Supplement line items</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-semibold">{formatCents(total_cents)}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
        <div className="col-span-2">Xactimate code</div>
        <div className="col-span-4">Description</div>
        <div className="col-span-1">Qty</div>
        <div className="col-span-1">Unit</div>
        <div className="col-span-2">Rate $</div>
        <div className="col-span-1">Amount $</div>
        <div className="col-span-1" />
      </div>

      {rows.map((r, i) => (
        <div key={r.id ?? `new-${i}`} className="grid grid-cols-12 gap-2 items-center">
          <Input
            className="col-span-2"
            value={r.xactimate_code}
            placeholder="RFG240"
            onChange={(e) => updateRow(i, { xactimate_code: e.target.value })}
          />
          <Input
            className="col-span-4"
            value={r.description}
            placeholder="Ice & water shield — valleys"
            onChange={(e) => updateRow(i, { description: e.target.value })}
          />
          <Input
            className="col-span-1"
            type="number"
            step="0.01"
            value={r.qty}
            onChange={(e) => updateRow(i, { qty: parseFloat(e.target.value || '0') })}
          />
          <Input
            className="col-span-1"
            value={r.unit}
            onChange={(e) => updateRow(i, { unit: e.target.value })}
          />
          <Input
            className="col-span-2"
            type="number"
            step="0.01"
            value={r.rate_dollars}
            onChange={(e) => updateRow(i, { rate_dollars: parseFloat(e.target.value || '0') })}
          />
          <Input
            className="col-span-1"
            type="number"
            step="0.01"
            value={r.amount_dollars}
            onChange={(e) => updateRow(i, { amount_dollars: parseFloat(e.target.value || '0') })}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="col-span-1"
            onClick={() => removeRow(i)}>
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex justify-between items-center pt-2">
        <Button type="button" size="sm" variant="outline" onClick={addRow}>
          <PlusIcon className="h-4 w-4 mr-1" /> Add line
        </Button>
        <Button type="button" size="sm" onClick={save} disabled={upsert.isLoading}>
          {upsert.isLoading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </Card>
  );
}
