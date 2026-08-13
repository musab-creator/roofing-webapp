import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCarrier,
  fetchCarrierById,
  fetchCarriers,
  updateCarrier
} from '../../services/api/carrier-service';
import type { CarrierInsert } from '../../types/crm_types';

export const useCarriers = () =>
  useQuery({ queryKey: ['carriers'], queryFn: fetchCarriers });

export const useCarrier = (id?: number | null) =>
  useQuery({
    queryKey: ['carrier', id],
    queryFn: () => fetchCarrierById(id as number),
    enabled: id != null
  });

export const useCreateCarrier = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: CarrierInsert) => createCarrier(payload), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carriers'] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Carrier added' });
    }
  });
};

export const useUpdateCarrier = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<CarrierInsert> }) => updateCarrier(id, patch),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries({ queryKey: ['carriers'] });
        qc.invalidateQueries({ queryKey: ['carrier', id] });
        toast?.({ variant: 'success', title: 'Carrier updated' });
      }
    }
  );
};
