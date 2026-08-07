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
import { addTerritorySchema } from '../../../validations/crm-validations';
import { useCreateTerritory } from '../../../hooks/useAPI/use-territory';

type Props = { setOpen?: (v: boolean) => void };

export default function AddTerritoryForm({ setOpen }: Props) {
  const { mutate: createTerritory, isLoading } = useCreateTerritory(toast, setOpen);
  const form = useForm<z.infer<typeof addTerritorySchema>>({
    resolver: zodResolver(addTerritorySchema),
    defaultValues: { name: '', description: '', zip_codes_csv: '' }
  });

  function onSubmit(values: z.infer<typeof addTerritorySchema>) {
    const zips = (values.zip_codes_csv ?? '')
      .split(/[\s,]+/)
      .map((z) => z.trim())
      .filter(Boolean);
    createTerritory({
      name: values.name,
      description: values.description,
      zip_codes: zips
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zip_codes_csv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip codes (comma or space separated)</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
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
            {isLoading ? 'Saving…' : 'Create territory'}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
