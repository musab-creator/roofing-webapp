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
import { addLeadSchema } from '../../../validations/crm-validations';
import {
  useCreateLead,
  useLeadSources,
  useLeadStatuses,
  useTerritoriesLookup,
  useCarriersLookup
} from '../../../hooks/useAPI/use-lead';
import { useActiveRepProfiles } from '../../../hooks/useAPI/use-rep-profile';
import { dollarsToCents } from '../../../lib/money';
import { scoreLead } from '../../../lib/lead-score';

type Props = { setOpen?: (v: boolean) => void };

export default function AddLeadForm({ setOpen }: Props) {
  const { data: sources } = useLeadSources();
  const { data: statuses } = useLeadStatuses();
  const { data: territories } = useTerritoriesLookup();
  const { data: carriers } = useCarriersLookup();
  const { data: reps } = useActiveRepProfiles();
  const { mutate: createLead, isLoading } = useCreateLead(toast, setOpen);

  const form = useForm<z.infer<typeof addLeadSchema>>({
    resolver: zodResolver(addLeadSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      street_address: '',
      city: '',
      state: '',
      zipcode: '',
      notes: ''
    }
  });

  function onSubmit(values: z.infer<typeof addLeadSchema>) {
    const newStatus = statuses?.find((s) => s.name === 'New');
    createLead({
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone,
      email: values.email || undefined,
      street_address: values.street_address,
      city: values.city,
      state: values.state || undefined,
      zipcode: values.zipcode,
      source_id: values.source_id ?? null,
      status_id: values.status_id ?? newStatus?.id ?? null,
      territory_id: values.territory_id ?? null,
      carrier_id: values.carrier_id ?? null,
      roof_age_years: values.roof_age_years,
      story_count: values.story_count,
      home_value_cents: values.home_value_dollars != null
        ? dollarsToCents(values.home_value_dollars)
        : undefined,
      appointment_at: values.appointment_at || undefined,
      notes: values.notes,
      score: scoreLead({
        home_value_cents:
          values.home_value_dollars != null ? dollarsToCents(values.home_value_dollars) : null,
        roof_age_years: values.roof_age_years ?? null,
        story_count: values.story_count ?? null,
        has_carrier: values.carrier_id != null,
        in_territory: values.territory_id != null
      })
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
          name="street_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zipcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip</FormLabel>
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
            name="source_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v, 10))}
                  value={field.value ? String(field.value) : undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sources?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
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
            name="territory_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Territory</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v, 10))}
                  value={field.value ? String(field.value) : undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-assign" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {territories?.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="roof_age_years"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roof age</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="story_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stories</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="home_value_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Home value $</FormLabel>
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
            {isLoading ? 'Saving…' : 'Create lead'}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
