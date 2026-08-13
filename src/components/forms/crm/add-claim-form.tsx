import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { SheetFooter, SheetClose } from '../../ui/sheet';
import { toast } from '../../ui/use-toast';
import { addClaimSchema } from '../../../validations/crm-validations';
import { useCreateClaim } from '../../../hooks/useAPI/use-claim';
import { useCarriers } from '../../../hooks/useAPI/use-carrier';
import { useLeads } from '../../../hooks/useAPI/use-lead';
import { dollarsToCents } from '../../../lib/money';

type Props = { setOpen?: (v: boolean) => void; defaultLeadId?: number };

export default function AddClaimForm({ setOpen, defaultLeadId }: Props) {
  const { data: carriers } = useCarriers();
  const { data: leads } = useLeads();
  const { mutate: createClaim, isLoading } = useCreateClaim(toast, setOpen);

  const form = useForm<z.infer<typeof addClaimSchema>>({
    resolver: zodResolver(addClaimSchema),
    defaultValues: {
      lead_id: defaultLeadId ?? undefined,
      claim_number: '',
      adjuster_name: '',
      adjuster_phone: '',
      adjuster_email: '',
      policy_number: '',
      notes: ''
    }
  });

  function onSubmit(values: z.infer<typeof addClaimSchema>) {
    createClaim({
      lead_id: values.lead_id,
      claim_number: values.claim_number,
      carrier_id: values.carrier_id,
      adjuster_name: values.adjuster_name,
      adjuster_phone: values.adjuster_phone,
      adjuster_email: values.adjuster_email || undefined,
      policy_number: values.policy_number,
      loss_date: values.loss_date || undefined,
      deductible_cents:
        values.deductible_dollars != null ? dollarsToCents(values.deductible_dollars) : undefined,
      acv_cents: values.acv_dollars != null ? dollarsToCents(values.acv_dollars) : undefined,
      rcv_cents: values.rcv_dollars != null ? dollarsToCents(values.rcv_dollars) : undefined,
      recoverable_depreciation_cents:
        values.recoverable_depreciation_dollars != null
          ? dollarsToCents(values.recoverable_depreciation_dollars)
          : undefined,
      notes: values.notes
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
        <FormField
          control={form.control}
          name="lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(parseInt(v, 10))}
                value={field.value ? String(field.value) : undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a lead" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leads?.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.first_name} {l.last_name} — {l.street_address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="carrier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrier</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v, 10))}
                  value={field.value ? String(field.value) : undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a carrier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {carriers?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="claim_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Claim #</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="adjuster_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjuster</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="adjuster_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adjuster phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="adjuster_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adjuster email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="policy_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy #</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loss_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loss date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="deductible_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deductible $</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recoverable_depreciation_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rec. depreciation $</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="acv_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ACV $</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rcv_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RCV $</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Create claim'}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
