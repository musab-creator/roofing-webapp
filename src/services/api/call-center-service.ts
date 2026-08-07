import supabase from '../../lib/supabase-client';
import { TABLES } from '../../lib/db-tables';
import type {
  CallCenterAgent,
  CallCenterAgentInsert,
  CallCenterLeadSubmission,
  CallCenterLeadSubmissionInsert
} from '../../types/crm_types';

export const fetchAgents = async (): Promise<CallCenterAgent[]> => {
  const { data, error } = await supabase
    .from(TABLES.CALL_CENTER_AGENT)
    .select('*')
    .order('display_name');
  if (error) throw error;
  return data as CallCenterAgent[];
};

export const fetchActiveAgents = async (): Promise<CallCenterAgent[]> => {
  const { data, error } = await supabase
    .from(TABLES.CALL_CENTER_AGENT)
    .select('*')
    .eq('active', true)
    .order('display_name');
  if (error) throw error;
  return data as CallCenterAgent[];
};

export const createAgent = async (payload: CallCenterAgentInsert): Promise<CallCenterAgent> => {
  const { data, error } = await supabase
    .from(TABLES.CALL_CENTER_AGENT)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as CallCenterAgent;
};

export const updateAgent = async (
  id: number,
  patch: Partial<CallCenterAgentInsert>
): Promise<CallCenterAgent> => {
  const { data, error } = await supabase
    .from(TABLES.CALL_CENTER_AGENT)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CallCenterAgent;
};

export const fetchSubmissionsByAgent = async (
  agentId: number
): Promise<CallCenterLeadSubmission[]> => {
  const { data, error } = await supabase
    .from(TABLES.CALL_CENTER_LEAD_SUBMISSION)
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CallCenterLeadSubmission[];
};

export const createSubmission = async (
  payload: CallCenterLeadSubmissionInsert
): Promise<CallCenterLeadSubmission> => {
  const { data, error } = await supabase
    .from(TABLES.CALL_CENTER_LEAD_SUBMISSION)
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as CallCenterLeadSubmission;
};

export const reviewSubmission = async (
  id: number,
  confirmed: boolean,
  reviewerId: string,
  badLeadReasonId?: number | null
): Promise<CallCenterLeadSubmission> => {
  const { data, error } = await supabase
    .from(TABLES.CALL_CENTER_LEAD_SUBMISSION)
    .update({
      confirmed,
      confirmed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      bad_lead_reason_id: confirmed ? null : badLeadReasonId ?? null
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CallCenterLeadSubmission;
};

// Sums the month's payouts per agent using the agent's pay model.
export const fetchAgentMonthlyPayout = async (agentId: number, yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map((s) => parseInt(s, 10));
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const end = new Date(Date.UTC(year, month, 1)).toISOString();
  const { data: agent, error: agentErr } = await supabase
    .from(TABLES.CALL_CENTER_AGENT)
    .select('*')
    .eq('id', agentId)
    .single();
  if (agentErr) throw agentErr;

  const { data: subs, error: subsErr } = await supabase
    .from(TABLES.CALL_CENTER_LEAD_SUBMISSION)
    .select('confirmed')
    .eq('agent_id', agentId)
    .gte('created_at', start)
    .lt('created_at', end);
  if (subsErr) throw subsErr;

  const confirmedCount = (subs ?? []).filter((s: any) => s.confirmed === true).length;
  const badCount = (subs ?? []).filter((s: any) => s.confirmed === false).length;
  const a = agent as CallCenterAgent;
  const totalCents =
    a.base_pay_cents +
    confirmedCount * a.per_confirmed_cents +
    badCount * a.per_bad_cents;
  return { confirmedCount, badCount, totalCents, agent: a };
};
