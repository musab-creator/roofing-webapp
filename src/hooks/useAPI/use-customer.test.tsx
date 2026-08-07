import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../services/api/customer-service', () => ({
  fetchCustomers: vi.fn(),
  fetchCustomerById: vi.fn(),
  fetchCustomerInvoices: vi.fn(),
  fetchCustomerQuotes: vi.fn(),
  fetchRecentlyCreatedCustomers: vi.fn(),
  fetchSearchCustomers: vi.fn(),
  deleteCustomer: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomerById: vi.fn()
}));

// Router hooks are used by mutation hooks; stub so renderHook works without a <Router>
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

import * as customerService from '../../services/api/customer-service';
import { useFetchCustomers, useCreateCustomer } from './use-customer';

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFetchCustomers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading initially then resolves with customer data', async () => {
    const fixture = [
      { id: 1, first_name: 'Jane', last_name: 'Doe' },
      { id: 2, first_name: 'John', last_name: 'Roe' }
    ];
    vi.mocked(customerService.fetchCustomers).mockResolvedValue(fixture as any);

    const { result } = renderHook(() => useFetchCustomers(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.customers).toEqual(fixture);
    expect(result.current.isError).toBe(false);
    expect(customerService.fetchCustomers).toHaveBeenCalledOnce();
  });

  it('surfaces errors via isError', async () => {
    vi.mocked(customerService.fetchCustomers).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useFetchCustomers(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.customers).toBeUndefined();
  });
});

describe('useCreateCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the service, closes the dialog, and toasts on success', async () => {
    vi.mocked(customerService.createCustomer).mockResolvedValue({ id: 1 } as any);
    const toast = vi.fn();
    const setOpen = vi.fn();

    const { result } = renderHook(() => useCreateCustomer(toast, setOpen), {
      wrapper: makeWrapper()
    });

    result.current.mutate({ first_name: 'Jane', last_name: 'Doe' } as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(customerService.createCustomer).toHaveBeenCalledOnce();
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' })
    );
  });

  it('toasts destructively and reopens the dialog on error', async () => {
    vi.mocked(customerService.createCustomer).mockRejectedValue(new Error('nope'));
    const toast = vi.fn();
    const setOpen = vi.fn();

    const { result } = renderHook(() => useCreateCustomer(toast, setOpen), {
      wrapper: makeWrapper()
    });

    result.current.mutate({ first_name: 'Jane', last_name: 'Doe' } as any);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setOpen).toHaveBeenCalledWith(true);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    );
  });
});
