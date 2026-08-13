import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createClaim,
  deleteClaim,
  fetchClaimById,
  fetchClaims,
  fetchClaimsByLead,
  updateClaim
} from '../../services/api/claim-service';
import type { ClaimInsert } from '../../types/crm_types';

export const useClaims = () =>
  useQuery({ queryKey: ['claims'], queryFn: fetchClaims });

export const useClaim = (id?: number | null) =>
  useQuery({
    queryKey: ['claim', id],
    queryFn: () => fetchClaimById(id as number),
    enabled: id != null
  });

export const useClaimsByLead = (leadId?: number | null) =>
  useQuery({
    queryKey: ['claims', 'by-lead', leadId],
    queryFn: () => fetchClaimsByLead(leadId as number),
    enabled: leadId != null
  });

export const useCreateClaim = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: ClaimInsert) => createClaim(payload), {
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ['claims'] });
      qc.invalidateQueries({ queryKey: ['claims', 'by-lead', payload.lead_id] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Claim created' });
    },
    onError: () => {
      toast?.({ variant: 'destructive', title: 'Could not create claim' });
    }
  });
};

export const useUpdateClaim = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<ClaimInsert> }) => updateClaim(id, patch),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries({ queryKey: ['claims'] });
        qc.invalidateQueries({ queryKey: ['claim', id] });
        toast?.({ variant: 'success', title: 'Claim updated' });
      }
    }
  );
};

export const useDeleteClaim = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation((id: number) => deleteClaim(id), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims'] });
      toast?.({ variant: 'success', title: 'Claim removed' });
    }
  });
};
