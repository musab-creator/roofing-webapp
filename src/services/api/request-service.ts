import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type { Request, RequestInsert, RequestStatus } from '../../types/crm_types';

export const fetchRequests = async (): Promise<Request[]> => {
  const { data, error } = await supabase
    .from(TABLES.REQUEST)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Request[];
};

export const fetchRequestsByAssignee = async (assigneeId: string): Promise<Request[]> => {
  const { data, error } = await supabase
    .from(TABLES.REQUEST)
    .select('*')
    .eq('assignee_id', assigneeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Request[];
};

export const fetchOpenRequests = async (): Promise<Request[]> => {
  const { data, error } = await supabase
    .from(TABLES.REQUEST)
    .select('*')
    .in('status', ['open', 'in_progress', 'blocked'])
    .order('priority', { ascending: false });
  if (error) throw error;
  return data as Request[];
};

export const createRequest = async (payload: RequestInsert): Promise<Request> => {
  const { data, error } = await supabase
    .from(TABLES.REQUEST)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Request;
};

export const updateRequest = async (
  id: number,
  patch: Partial<RequestInsert>
): Promise<Request> => {
  const { data, error } = await supabase
    .from(TABLES.REQUEST)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Request;
};

export const transitionRequest = async (
  id: number,
  status: RequestStatus
): Promise<Request> => {
  const patch: Partial<RequestInsert> = { status };
  if (status === 'done') patch.completed_at = new Date().toISOString();
  return updateRequest(id, patch);
};

export const deleteRequest = async (id: number): Promise<void> => {
  const { error } = await supabase.from(TABLES.REQUEST).delete().eq('id', id);
  if (error) throw error;
};
