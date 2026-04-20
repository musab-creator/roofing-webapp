import { beforeEach, describe, expect, it, vi } from 'vitest';

// Reusable fluent builder that records every call and resolves to a
// single { data, error } result we can configure per-test.
type Result = { data: any; error: any };

const buildBuilder = () => {
  const result: Result = { data: null, error: null };
  const calls: { method: string; args: unknown[] }[] = [];

  const record = (method: string) =>
    vi.fn((...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    });

  const terminal = vi.fn((...args: unknown[]) => {
    calls.push({ method: 'single', args });
    return Promise.resolve(result);
  });

  const builder: any = {
    select: record('select'),
    insert: record('insert'),
    update: record('update'),
    delete: record('delete'),
    eq: record('eq'),
    or: record('or'),
    order: record('order'),
    limit: record('limit'),
    single: terminal,
    then: (resolve: (r: Result) => unknown) => Promise.resolve(result).then(resolve)
  };

  return { builder, result, calls };
};

const fromMock = vi.fn();

vi.mock('../../lib/supabase-client', () => ({
  default: {
    from: (table: string) => fromMock(table)
  }
}));

// Import after the mock is registered
import {
  createCustomer,
  deleteCustomer,
  fetchSearchCustomers
} from './customer-service';

describe('customer-service', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  describe('createCustomer', () => {
    it('inserts into the customer table and returns the created row', async () => {
      const { builder, result, calls } = buildBuilder();
      result.data = { id: 42, first_name: 'Jane', last_name: 'Doe' };
      fromMock.mockReturnValue(builder);

      const payload = {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com'
      } as any;

      const created = await createCustomer(payload);

      expect(fromMock).toHaveBeenCalledWith('customer');
      expect(calls.map((c) => c.method)).toEqual(['insert', 'select', 'single']);
      expect(calls[0].args[0]).toBe(payload);
      expect(created).toEqual({ id: 42, first_name: 'Jane', last_name: 'Doe' });
    });

    it('throws when Supabase returns an error', async () => {
      const { builder, result } = buildBuilder();
      result.error = { message: 'duplicate key', code: '23505' };
      fromMock.mockReturnValue(builder);

      await expect(
        createCustomer({ first_name: 'Jane', last_name: 'Doe' } as any)
      ).rejects.toMatchObject({ code: '23505' });
    });
  });

  describe('deleteCustomer', () => {
    it('scopes the delete to the given id', async () => {
      const { builder, calls } = buildBuilder();
      fromMock.mockReturnValue(builder);

      await deleteCustomer(7);

      expect(fromMock).toHaveBeenCalledWith('customer');
      expect(calls.map((c) => c.method)).toEqual(['delete', 'eq']);
      expect(calls[1].args).toEqual(['id', 7]);
    });
  });

  describe('fetchSearchCustomers', () => {
    it('builds an OR ilike filter across name, email, and phone', async () => {
      const { builder, result, calls } = buildBuilder();
      result.data = [{ id: 1, first_name: 'Jane' }];
      fromMock.mockReturnValue(builder);

      const data = await fetchSearchCustomers('jane');

      const or = calls.find((c) => c.method === 'or');
      expect(or).toBeDefined();
      expect(or!.args[0]).toBe(
        'first_name.ilike.%jane%,last_name.ilike.%jane%,email.ilike.%jane%,phone_number.ilike.%jane%'
      );
      expect(data).toHaveLength(1);
    });
  });
});
