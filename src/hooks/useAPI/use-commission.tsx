import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCommission,
  deleteCommission,
  fetchCommissions,
  fetchCommissionsByInvoice,
  fetchCommissionsByRep,
  updateCommission
} from '../../services/api/commission-service';
import type { CommissionInsert } from '../../types/crm_types';

export const useCommissions = () =>
  useQuery({ queryKey: ['commissions'], queryFn: fetchCommissions });

export const useCommissionsByRep = (repId?: string | null) =>
  useQuery({
    queryKey: ['commissions', 'rep', repId],
    queryFn: () => fetchCommissionsByRep(repId as string),
    enabled: repId != null
  });

export const useCommissionsByInvoice = (invoiceId?: number | null) =>
  useQuery({
    queryKey: ['commissions', 'invoice', invoiceId],
    queryFn: () => fetchCommissionsByInvoice(invoiceId as number),
    enabled: invoiceId != null
  });

export const useCreateCommission = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: CommissionInsert) => createCommission(payload), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['commissions'] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Commission saved' });
    }
  });
};

export const useUpdateCommission = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<CommissionInsert> }) => updateCommission(id, patch),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['commissions'] });
        toast?.({ variant: 'success', title: 'Commission updated' });
      }
    }
  );
};

export const useDeleteCommission = () => {
  const qc = useQueryClient();
  return useMutation((id: number) => deleteCommission(id), {
    onSuccess: () => qc.invalidateQueries({ queryKey: ['commissions'] })
  });
};
