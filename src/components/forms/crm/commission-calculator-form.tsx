import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { SheetFooter, SheetClose } from '../../ui/sheet';
import { toast } from '../../ui/use-toast';
import { Card } from '../../ui/card';
import { addCommissionSchema } from '../../../validations/crm-validations';
import { useCreateCommission } from '../../../hooks/useAPI/use-commission';
import { useActiveRepProfiles } from '../../../hooks/useAPI/use-rep-profile';
import { calculateCommission, marginStatus } from '../../../lib/commission-math';
import { dollarsToCents, formatCents } from '../../../lib/money';

type Props = { setOpen?: (v: boolean) => void; defaultInvoiceId?: number };

export default function CommissionCalculatorForm({ setOpen, defaultInvoiceId }: Props) {
  const { data: reps } = useActiveRepProfiles();
  const { mutate: createCommission, isLoading } = useCreateCommission(toast, setOpen);

  const form = useForm<z.infer<typeof addCommissionSchema>>({
    resolver: zodResolver(addCommissionSchema),
    defaultValues: {
      invoice_id: defaultInvoiceId,
      rep_id: '',
      share_pct: 50,
      overhead_cap_dollars: 1800,
      contract_dollars: 0,
      material_dollars: 0,
      labor_dollars: 0,
      overhead_dollars: 0,
      supplement_fee_dollars: 0,
      other_dollars: 0
    }
  });

  const watched = useWatch({ control: form.control });
  const preview = calculateCommission({
    contract_cents: dollarsToCents(Number(watched.contract_dollars ?? 0)),
    material_cents: dollarsToCents(Number(watched.material_dollars ?? 0)),
    labor_cents: dollarsToCents(Number(watched.labor_dollars ?? 0)),
    overhead_cents: dollarsToCents(Number(watched.overhead_dollars ?? 0)),
    supplement_fee_cents: dollarsToCents(Number(watched.supplement_fee_dollars ?? 0)),
    other_cents: dollarsToCents(Number(watched.other_dollars ?? 0)),
    share_pct: Number(watched.share_pct ?? 50),
    overhead_cap_cents: dollarsToCents(Number(watched.overhead_cap_dollars ?? 1800))
  });
  const status = marginStatus(
    dollarsToCents(Number(watched.contract_dollars ?? 0)),
    dollarsToCents(Number(watched.material_dollars ?? 0)),
    dollarsToCents(Number(watched.labor_dollars ?? 0))
  );

  function onSubmit(values: z.infer<typeof addCommissionSchema>) {
    const inputs = {
      contract_cents: dollarsToCents(values.contract_dollars),
      material_cents: dollarsToCents(values.material_dollars),
      labor_cents: dollarsToCents(values.labor_dollars),
      overhead_cents: dollarsToCents(values.overhead_dollars),
      supplement_fee_cents: dollarsToCents(values.supplement_fee_dollars),
      other_cents: dollarsToCents(values.other_dollars),
      share_pct: values.share_pct,
      overhead_cap_cents: dollarsToCents(values.overhead_cap_dollars)
    };
    const result = calculateCommission(inputs);
    createCommission({
      invoice_id: values.invoice_id,
      rep_id: values.rep_id,
      share_pct: values.share_pct,
      overhead_cap_cents: inputs.overhead_cap_cents,
      contract_cents: inputs.contract_cents,
      material_cents: inputs.material_cents,
      labor_cents: inputs.labor_cents,
      overhead_cents: result.effective_overhead_cents,
      supplement_fee_cents: inputs.supplement_fee_cents,
      other_cents: inputs.other_cents,
      calculated_profit_cents: result.net_profit_cents,
      payout_cents: result.payout_cents,
      notes: values.notes
    });
  }

  const statusColor =
    status === 'outlier'
      ? 'text-red-600'
      : status === 'watch'
      ? 'text-amber-600'
      : 'text-emerald-600';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="invoice_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice #</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rep_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rep</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a rep" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {reps?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="share_pct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Share %</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="overhead_cap_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overhead cap $</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['contract_dollars', 'Contract $'],
            ['material_dollars', 'Material (ABC + misc) $'],
            ['labor_dollars', 'Labor (crew) $'],
            ['overhead_dollars', 'Overhead $'],
            ['supplement_fee_dollars', 'Supplement fee $'],
            ['other_dollars', 'Other $']
          ].map(([name, label]) => (
            <FormField
              key={name}
              control={form.control}
              // @ts-expect-error name is a known field
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Card className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Effective overhead</span>
            <span>{formatCents(preview.effective_overhead_cents)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Net profit</span>
            <span>{formatCents(preview.net_profit_cents)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Rep payout</span>
            <span className="text-primary">{formatCents(preview.payout_cents)}</span>
          </div>
          <div className={`flex justify-between text-sm ${statusColor}`}>
            <span>Margin status</span>
            <span className="uppercase tracking-wide">{status}</span>
          </div>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </SheetClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Save commission'}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
