import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type {
  Supplement,
  SupplementInsert,
  SupplementLineItem,
  SupplementLineItemInsert,
  SupplementTemplate,
  SupplementWithRelations
} from '../../types/crm_types';

export const fetchSupplementsByClaim = async (
  claimId: number
): Promise<SupplementWithRelations[]> => {
  const { data, error } = await supabase
    .from(TABLES.SUPPLEMENT)
    .select(
      `
      *,
      claim:claim ( id, claim_number, lead_id ),
      line_items:supplement_line_item ( * )
      `
    )
    .eq('claim_id', claimId)
    .order('submission_number', { ascending: true });
  if (error) throw error;
  return data as unknown as SupplementWithRelations[];
};

export const fetchSupplementById = async (id: number): Promise<SupplementWithRelations> => {
  const { data, error } = await supabase
    .from(TABLES.SUPPLEMENT)
    .select(
      `
      *,
      claim:claim ( id, claim_number, lead_id ),
      line_items:supplement_line_item ( * )
      `
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as SupplementWithRelations;
};

export const createSupplement = async (payload: SupplementInsert): Promise<Supplement> => {
  const { data, error } = await supabase
    .from(TABLES.SUPPLEMENT)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Supplement;
};

export const updateSupplement = async (
  id: number,
  patch: Partial<SupplementInsert>
): Promise<Supplement> => {
  const { data, error } = await supabase
    .from(TABLES.SUPPLEMENT)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Supplement;
};

export const deleteSupplement = async (id: number): Promise<void> => {
  const { error } = await supabase.from(TABLES.SUPPLEMENT).delete().eq('id', id);
  if (error) throw error;
};

export const upsertLineItems = async (
  items: SupplementLineItemInsert[]
): Promise<SupplementLineItem[]> => {
  if (items.length === 0) return [];
  const { data, error } = await supabase
    .from(TABLES.SUPPLEMENT_LINE_ITEM)
    .upsert(items)
    .select();
  if (error) throw error;
  return data as SupplementLineItem[];
};

export const deleteLineItem = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from(TABLES.SUPPLEMENT_LINE_ITEM)
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const fetchSupplementTemplates = async (): Promise<SupplementTemplate[]> => {
  const { data, error } = await supabase
    .from(TABLES.SUPPLEMENT_TEMPLATE)
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return data as SupplementTemplate[];
};
