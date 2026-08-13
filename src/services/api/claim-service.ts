import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type { Claim, ClaimInsert, ClaimWithRelations } from '../../types/crm_types';

const CLAIM_WITH_RELATIONS = `
  *,
  carrier:carrier ( id, name ),
  lead:lead ( id, first_name, last_name, street_address, city, state, zipcode ),
  supplements:supplement ( * )
`;

export const fetchClaims = async (): Promise<ClaimWithRelations[]> => {
  const { data, error } = await supabase
    .from(TABLES.CLAIM)
    .select(CLAIM_WITH_RELATIONS)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as ClaimWithRelations[];
};

export const fetchClaimById = async (id: number): Promise<ClaimWithRelations> => {
  const { data, error } = await supabase
    .from(TABLES.CLAIM)
    .select(CLAIM_WITH_RELATIONS)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as ClaimWithRelations;
};

export const fetchClaimsByLead = async (leadId: number): Promise<ClaimWithRelations[]> => {
  const { data, error } = await supabase
    .from(TABLES.CLAIM)
    .select(CLAIM_WITH_RELATIONS)
    .eq('lead_id', leadId);
  if (error) throw error;
  return data as unknown as ClaimWithRelations[];
};

export const createClaim = async (payload: ClaimInsert): Promise<Claim> => {
  const { data, error } = await supabase
    .from(TABLES.CLAIM)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Claim;
};

export const updateClaim = async (id: number, patch: Partial<ClaimInsert>): Promise<Claim> => {
  const { data, error } = await supabase
    .from(TABLES.CLAIM)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Claim;
};

export const deleteClaim = async (id: number): Promise<void> => {
  const { error } = await supabase.from(TABLES.CLAIM).delete().eq('id', id);
  if (error) throw error;
};
