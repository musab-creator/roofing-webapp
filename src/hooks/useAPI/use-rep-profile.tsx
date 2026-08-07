import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRepProfile,
  fetchActiveRepProfiles,
  fetchRepProfiles,
  fetchRepTerritories,
  setRepTerritories,
  updateRepProfile
} from '../../services/api/rep-profile-service';
import type { RepProfileInsert } from '../../types/crm_types';

export const useRepProfiles = () =>
  useQuery({ queryKey: ['rep-profiles'], queryFn: fetchRepProfiles });

export const useActiveRepProfiles = () =>
  useQuery({ queryKey: ['rep-profiles', 'active'], queryFn: fetchActiveRepProfiles });

export const useRepTerritories = (repId?: string | null) =>
  useQuery({
    queryKey: ['rep-territories', repId],
    queryFn: () => fetchRepTerritories(repId as string),
    enabled: repId != null
  });

export const useCreateRepProfile = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: RepProfileInsert) => createRepProfile(payload), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rep-profiles'] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Rep added' });
    }
  });
};

export const useUpdateRepProfile = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: string; patch: Partial<RepProfileInsert> }) =>
      updateRepProfile(id, patch),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['rep-profiles'] });
        toast?.({ variant: 'success', title: 'Rep updated' });
      }
    }
  );
};

export const useSetRepTerritories = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ repId, territoryIds, primaryId }: { repId: string; territoryIds: number[]; primaryId?: number }) =>
      setRepTerritories(repId, territoryIds, primaryId),
    {
      onSuccess: (_, { repId }) => {
        qc.invalidateQueries({ queryKey: ['rep-territories', repId] });
        toast?.({ variant: 'success', title: 'Territories updated' });
      }
    }
  );
};
