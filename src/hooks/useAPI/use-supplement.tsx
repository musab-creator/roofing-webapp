import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSupplement,
  deleteLineItem,
  deleteSupplement,
  fetchSupplementById,
  fetchSupplementTemplates,
  fetchSupplementsByClaim,
  updateSupplement,
  upsertLineItems
} from '../../services/api/supplement-service';
import type {
  SupplementInsert,
  SupplementLineItemInsert
} from '../../types/crm_types';

export const useSupplementsByClaim = (claimId?: number | null) =>
  useQuery({
    queryKey: ['supplements', 'by-claim', claimId],
    queryFn: () => fetchSupplementsByClaim(claimId as number),
    enabled: claimId != null
  });

export const useSupplement = (id?: number | null) =>
  useQuery({
    queryKey: ['supplement', id],
    queryFn: () => fetchSupplementById(id as number),
    enabled: id != null
  });

export const useCreateSupplement = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation((payload: SupplementInsert) => createSupplement(payload), {
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ['supplements', 'by-claim', payload.claim_id] });
      toast?.({ variant: 'success', title: 'Supplement created' });
    }
  });
};

export const useUpdateSupplement = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<SupplementInsert> }) => updateSupplement(id, patch),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries({ queryKey: ['supplement', id] });
        qc.invalidateQueries({ queryKey: ['supplements', 'by-claim'] });
        toast?.({ variant: 'success', title: 'Supplement updated' });
      }
    }
  );
};

export const useDeleteSupplement = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation((id: number) => deleteSupplement(id), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplements', 'by-claim'] });
      toast?.({ variant: 'success', title: 'Supplement removed' });
    }
  });
};

export const useUpsertLineItems = () => {
  const qc = useQueryClient();
  return useMutation((items: SupplementLineItemInsert[]) => upsertLineItems(items), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplement'] });
    }
  });
};

export const useDeleteLineItem = () => {
  const qc = useQueryClient();
  return useMutation((id: number) => deleteLineItem(id), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplement'] });
    }
  });
};

export const useSupplementTemplates = () =>
  useQuery({ queryKey: ['supplement-templates'], queryFn: fetchSupplementTemplates });
