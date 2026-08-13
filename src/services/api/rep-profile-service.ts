import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type { RepProfile, RepProfileInsert, RepTerritory } from '../../types/crm_types';

export const fetchRepProfiles = async (): Promise<RepProfile[]> => {
  const { data, error } = await supabase
    .from(TABLES.REP_PROFILE)
    .select('*')
    .order('display_name');
  if (error) throw error;
  return data as RepProfile[];
};

export const fetchActiveRepProfiles = async (): Promise<RepProfile[]> => {
  const { data, error } = await supabase
    .from(TABLES.REP_PROFILE)
    .select('*')
    .eq('active', true)
    .order('display_name');
  if (error) throw error;
  return data as RepProfile[];
};

export const createRepProfile = async (payload: RepProfileInsert): Promise<RepProfile> => {
  const { data, error } = await supabase
    .from(TABLES.REP_PROFILE)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as RepProfile;
};

export const updateRepProfile = async (
  id: string,
  patch: Partial<RepProfileInsert>
): Promise<RepProfile> => {
  const { data, error } = await supabase
    .from(TABLES.REP_PROFILE)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as RepProfile;
};

export const fetchRepTerritories = async (repId: string): Promise<RepTerritory[]> => {
  const { data, error } = await supabase
    .from(TABLES.REP_TERRITORY)
    .select('*')
    .eq('rep_id', repId);
  if (error) throw error;
  return data as RepTerritory[];
};

export const setRepTerritories = async (
  repId: string,
  territoryIds: number[],
  primaryId?: number
): Promise<void> => {
  await supabase.from(TABLES.REP_TERRITORY).delete().eq('rep_id', repId);
  if (territoryIds.length === 0) return;
  const rows = territoryIds.map((t) => ({
    rep_id: repId,
    territory_id: t,
    is_primary: t === primaryId
  }));
  const { error } = await supabase.from(TABLES.REP_TERRITORY).insert(rows);
  if (error) throw error;
};
