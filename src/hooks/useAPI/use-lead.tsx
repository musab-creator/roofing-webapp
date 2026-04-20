import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLead,
  deleteLead,
  fetchLeadById,
  fetchLeadActivities,
  fetchLeads,
  findDuplicateLeads,
  logLeadActivity,
  updateLead
} from '../../services/api/lead-service';
import {
  fetchBadLeadReasons,
  fetchCarriers,
  fetchLeadSources,
  fetchLeadStatuses,
  fetchTerritories
} from '../../services/api/lead-lookup-service';
import type { LeadInsert, LeadActivityInsert } from '../../types/crm_types';

export const useLeads = () =>
  useQuery({ queryKey: ['leads'], queryFn: fetchLeads });

export const useLead = (id?: number | null) =>
  useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id as number),
    enabled: id != null
  });

export const useLeadActivities = (id?: number | null) =>
  useQuery({
    queryKey: ['lead-activities', id],
    queryFn: () => fetchLeadActivities(id as number),
    enabled: id != null
  });

export const useCreateLead = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: LeadInsert) => createLead(payload), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Lead created' });
    },
    onError: () => {
      toast?.({ variant: 'destructive', title: 'Could not create lead' });
    }
  });
};

export const useUpdateLead = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<LeadInsert> }) => updateLead(id, patch),
    {
      onSuccess: (_, { id }) => {
        qc.invalidateQueries({ queryKey: ['leads'] });
        qc.invalidateQueries({ queryKey: ['lead', id] });
        toast?.({ variant: 'success', title: 'Lead updated' });
      },
      onError: () => {
        toast?.({ variant: 'destructive', title: 'Could not update lead' });
      }
    }
  );
};

export const useDeleteLead = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation((id: number) => deleteLead(id), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      toast?.({ variant: 'success', title: 'Lead removed' });
    }
  });
};

export const useLogLeadActivity = () => {
  const qc = useQueryClient();
  return useMutation((payload: LeadActivityInsert) => logLeadActivity(payload), {
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['lead-activities', vars.lead_id] });
    }
  });
};

export const useDuplicateLeads = (phone?: string, streetAddress?: string) =>
  useQuery({
    queryKey: ['lead-dupes', phone, streetAddress],
    queryFn: () => findDuplicateLeads(phone, streetAddress),
    enabled: Boolean(phone || streetAddress)
  });

export const useLeadSources = () =>
  useQuery({ queryKey: ['lead-sources'], queryFn: fetchLeadSources });

export const useLeadStatuses = () =>
  useQuery({ queryKey: ['lead-statuses'], queryFn: fetchLeadStatuses });

export const useTerritoriesLookup = () =>
  useQuery({ queryKey: ['territories'], queryFn: fetchTerritories });

export const useBadLeadReasons = () =>
  useQuery({ queryKey: ['bad-lead-reasons'], queryFn: fetchBadLeadReasons });

export const useCarriersLookup = () =>
  useQuery({ queryKey: ['carriers'], queryFn: fetchCarriers });
