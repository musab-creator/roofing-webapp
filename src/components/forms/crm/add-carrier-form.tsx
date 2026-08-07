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
import { addCarrierSchema } from '../../../validations/crm-validations';
import { useCreateCarrier } from '../../../hooks/useAPI/use-carrier';

type Props = { setOpen?: (v: boolean) => void };

export default function AddCarrierForm({ setOpen }: Props) {
  const { mutate: createCarrier, isLoading } = useCreateCarrier(toast, setOpen);
  const form = useForm<z.infer<typeof addCarrierSchema>>({
    resolver: zodResolver(addCarrierSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      notes_markdown: ''
    }
  });

  function onSubmit(values: z.infer<typeof addCarrierSchema>) {
    createCarrier({
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      notes_markdown: values.notes_markdown,
      avg_response_days: values.avg_response_days
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrier</FormLabel>
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
          name="avg_response_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avg response days</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes_markdown"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Playbook (Markdown)</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="Typical deductibles, SLAs, reviewer phrasing that works…" {...field} />
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
            {isLoading ? 'Saving…' : 'Add carrier'}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
