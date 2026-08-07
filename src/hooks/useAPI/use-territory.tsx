import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTerritory,
  fetchTerritories,
  territoryForZip,
  updateTerritory
} from '../../services/api/territory-service';
import type { TerritoryInsert } from '../../types/crm_types';

export const useTerritories = () =>
  useQuery({ queryKey: ['territories'], queryFn: fetchTerritories });

export const useTerritoryForZip = (zip?: string) =>
  useQuery({
    queryKey: ['territory-for-zip', zip],
    queryFn: () => territoryForZip(zip as string),
    enabled: !!zip && zip.length >= 5
  });

export const useCreateTerritory = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: TerritoryInsert) => createTerritory(payload), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['territories'] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Territory created' });
    }
  });
};

export const useUpdateTerritory = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<TerritoryInsert> }) => updateTerritory(id, patch),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['territories'] });
        toast?.({ variant: 'success', title: 'Territory updated' });
      }
    }
  );
};
