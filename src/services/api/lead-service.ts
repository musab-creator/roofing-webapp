import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type {
  Lead,
  LeadInsert,
  LeadWithRelations,
  LeadActivityInsert,
  LeadActivity
} from '../../types/crm_types';

const LEAD_WITH_RELATIONS = `
  *,
  source:lead_source ( id, name, source_type ),
  status:lead_status ( id, name, sort_order, is_terminal ),
  territory:territory ( id, name ),
  carrier:carrier ( id, name ),
  bad_lead_reason:bad_lead_reason ( id, code, label )
`;

export const fetchLeads = async (): Promise<LeadWithRelations[]> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD)
    .select(LEAD_WITH_RELATIONS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as LeadWithRelations[];
};

export const fetchLeadById = async (id: number): Promise<LeadWithRelations> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD)
    .select(LEAD_WITH_RELATIONS)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as LeadWithRelations;
};

export const createLead = async (payload: LeadInsert): Promise<Lead> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
};

export const updateLead = async (id: number, patch: Partial<LeadInsert>): Promise<Lead> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Lead;
};

export const deleteLead = async (id: number): Promise<void> => {
  const { error } = await supabase.from(TABLES.LEAD).delete().eq('id', id);
  if (error) throw error;
};

export const fetchLeadActivities = async (leadId: number): Promise<LeadActivity[]> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD_ACTIVITY)
    .select('*')
    .eq('lead_id', leadId)
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return data as LeadActivity[];
};

export const logLeadActivity = async (payload: LeadActivityInsert): Promise<LeadActivity> => {
  const { data, error } = await supabase
    .from(TABLES.LEAD_ACTIVITY)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as LeadActivity;
};

// Duplicate detection: match on address + phone.
export const findDuplicateLeads = async (phone?: string, streetAddress?: string) => {
  if (!phone && !streetAddress) return [];
  const filters: string[] = [];
  if (phone) filters.push(`phone.eq.${phone}`);
  if (streetAddress) filters.push(`street_address.ilike.${streetAddress}`);
  const { data, error } = await supabase
    .from(TABLES.LEAD)
    .select('id, first_name, last_name, phone, street_address, city, state')
    .or(filters.join(','));
  if (error) throw error;
  return data ?? [];
};
