import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAgent,
  createSubmission,
  fetchActiveAgents,
  fetchAgentMonthlyPayout,
  fetchAgents,
  fetchSubmissionsByAgent,
  reviewSubmission,
  updateAgent
} from '../../services/api/call-center-service';
import type {
  CallCenterAgentInsert,
  CallCenterLeadSubmissionInsert
} from '../../types/crm_types';

export const useAgents = () =>
  useQuery({ queryKey: ['cc-agents'], queryFn: fetchAgents });

export const useActiveAgents = () =>
  useQuery({ queryKey: ['cc-agents', 'active'], queryFn: fetchActiveAgents });

export const useCreateAgent = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: CallCenterAgentInsert) => createAgent(payload), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cc-agents'] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Agent added' });
    }
  });
};

export const useUpdateAgent = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<CallCenterAgentInsert> }) =>
      updateAgent(id, patch),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['cc-agents'] });
        toast?.({ variant: 'success', title: 'Agent updated' });
      }
    }
  );
};

export const useSubmissionsByAgent = (agentId?: number | null) =>
  useQuery({
    queryKey: ['cc-submissions', 'by-agent', agentId],
    queryFn: () => fetchSubmissionsByAgent(agentId as number),
    enabled: agentId != null
  });

export const useCreateSubmission = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    (payload: CallCenterLeadSubmissionInsert) => createSubmission(payload),
    {
      onSuccess: (_, payload) => {
        qc.invalidateQueries({ queryKey: ['cc-submissions', 'by-agent', payload.agent_id] });
        toast?.({ variant: 'success', title: 'Lead submitted' });
      }
    }
  );
};

export const useReviewSubmission = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({
      id,
      confirmed,
      reviewerId,
      badLeadReasonId
    }: {
      id: number;
      confirmed: boolean;
      reviewerId: string;
      badLeadReasonId?: number | null;
    }) => reviewSubmission(id, confirmed, reviewerId, badLeadReasonId),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['cc-submissions'] });
        toast?.({ variant: 'success', title: 'Review saved' });
      }
    }
  );
};

export const useAgentMonthlyPayout = (agentId?: number | null, yearMonth?: string) =>
  useQuery({
    queryKey: ['cc-payout', agentId, yearMonth],
    queryFn: () => fetchAgentMonthlyPayout(agentId as number, yearMonth as string),
    enabled: agentId != null && !!yearMonth
  });
