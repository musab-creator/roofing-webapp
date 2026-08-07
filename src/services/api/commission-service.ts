import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type { Commission, CommissionInsert } from '../../types/crm_types';

export const fetchCommissions = async (): Promise<Commission[]> => {
  const { data, error } = await supabase
    .from(TABLES.COMMISSION)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Commission[];
};

export const fetchCommissionsByRep = async (repId: string): Promise<Commission[]> => {
  const { data, error } = await supabase
    .from(TABLES.COMMISSION)
    .select('*')
    .eq('rep_id', repId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Commission[];
};

export const fetchCommissionsByInvoice = async (invoiceId: number): Promise<Commission[]> => {
  const { data, error } = await supabase
    .from(TABLES.COMMISSION)
    .select('*')
    .eq('invoice_id', invoiceId);
  if (error) throw error;
  return data as Commission[];
};

export const createCommission = async (payload: CommissionInsert): Promise<Commission> => {
  const { data, error } = await supabase
    .from(TABLES.COMMISSION)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Commission;
};

export const updateCommission = async (
  id: number,
  patch: Partial<CommissionInsert>
): Promise<Commission> => {
  const { data, error } = await supabase
    .from(TABLES.COMMISSION)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Commission;
};

export const deleteCommission = async (id: number): Promise<void> => {
  const { error } = await supabase.from(TABLES.COMMISSION).delete().eq('id', id);
  if (error) throw error;
};
