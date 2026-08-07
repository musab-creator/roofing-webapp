import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type { Carrier, CarrierInsert } from '../../types/crm_types';

export const fetchCarriers = async (): Promise<Carrier[]> => {
  const { data, error } = await supabase
    .from(TABLES.CARRIER)
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Carrier[];
};

export const fetchCarrierById = async (id: number): Promise<Carrier> => {
  const { data, error } = await supabase
    .from(TABLES.CARRIER)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Carrier;
};

export const createCarrier = async (payload: CarrierInsert): Promise<Carrier> => {
  const { data, error } = await supabase
    .from(TABLES.CARRIER)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Carrier;
};

export const updateCarrier = async (
  id: number,
  patch: Partial<CarrierInsert>
): Promise<Carrier> => {
  const { data, error } = await supabase
    .from(TABLES.CARRIER)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Carrier;
};
