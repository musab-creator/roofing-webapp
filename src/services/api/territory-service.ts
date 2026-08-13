import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type { Territory, TerritoryInsert } from '../../types/crm_types';

export const fetchTerritories = async (): Promise<Territory[]> => {
  const { data, error } = await supabase
    .from(TABLES.TERRITORY)
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Territory[];
};

export const createTerritory = async (payload: TerritoryInsert): Promise<Territory> => {
  const { data, error } = await supabase
    .from(TABLES.TERRITORY)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Territory;
};

export const updateTerritory = async (
  id: number,
  patch: Partial<TerritoryInsert>
): Promise<Territory> => {
  const { data, error } = await supabase
    .from(TABLES.TERRITORY)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Territory;
};

// Lookup used by lead auto-assignment: which territory contains a zip?
export const territoryForZip = async (zip: string): Promise<Territory | null> => {
  const { data, error } = await supabase
    .from(TABLES.TERRITORY)
    .select('*')
    .contains('zip_codes', [zip])
    .maybeSingle();
  if (error) throw error;
  return data as Territory | null;
};
