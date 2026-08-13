import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { SheetFooter, SheetClose } from '../../ui/sheet';
import { toast } from '../../ui/use-toast';
import { addAgentSchema } from '../../../validations/crm-validations';
import { useCreateAgent } from '../../../hooks/useAPI/use-call-center';
import { dollarsToCents } from '../../../lib/money';

type Props = { setOpen?: (v: boolean) => void };

export default function AddAgentForm({ setOpen }: Props) {
  const { mutate: createAgent, isLoading } = useCreateAgent(toast, setOpen);
  const form = useForm<z.infer<typeof addAgentSchema>>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      display_name: '',
      supervisor_name: 'Amireh',
      timezone: 'Asia/Amman',
      base_pay_dollars: 280,
      per_confirmed_dollars: 15,
      per_bad_dollars: 5
    }
  });

  function onSubmit(values: z.infer<typeof addAgentSchema>) {
    createAgent({
      display_name: values.display_name,
      supervisor_name: values.supervisor_name,
      timezone: values.timezone,
      base_pay_cents: dollarsToCents(values.base_pay_dollars),
      per_confirmed_cents: dollarsToCents(values.per_confirmed_dollars),
      per_bad_cents: dollarsToCents(values.per_bad_dollars),
      start_date: values.start_date || undefined,
      notes: values.notes
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supervisor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="base_pay_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base $/mo</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="per_confirmed_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>$/confirmed</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="per_bad_dollars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>$/bad</FormLabel>
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
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                <Textarea rows={2} {...field} />
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
            {isLoading ? 'Saving…' : 'Add agent'}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
