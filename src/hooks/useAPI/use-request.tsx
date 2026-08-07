import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRequest,
  deleteRequest,
  fetchOpenRequests,
  fetchRequests,
  fetchRequestsByAssignee,
  transitionRequest,
  updateRequest
} from '../../services/api/request-service';
import type { RequestInsert, RequestStatus } from '../../types/crm_types';

export const useRequests = () =>
  useQuery({ queryKey: ['requests'], queryFn: fetchRequests });

export const useOpenRequests = () =>
  useQuery({ queryKey: ['requests', 'open'], queryFn: fetchOpenRequests });

export const useRequestsByAssignee = (assigneeId?: string | null) =>
  useQuery({
    queryKey: ['requests', 'assignee', assigneeId],
    queryFn: () => fetchRequestsByAssignee(assigneeId as string),
    enabled: assigneeId != null
  });

export const useCreateRequest = (toast?: any, setOpen?: (v: boolean) => void) => {
  const qc = useQueryClient();
  return useMutation((payload: RequestInsert) => createRequest(payload), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] });
      setOpen?.(false);
      toast?.({ variant: 'success', title: 'Request submitted' });
    }
  });
};

export const useTransitionRequest = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, status }: { id: number; status: RequestStatus }) => transitionRequest(id, status),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['requests'] });
        toast?.({ variant: 'success', title: 'Request updated' });
      }
    }
  );
};

export const useUpdateRequest = (toast?: any) => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, patch }: { id: number; patch: Partial<RequestInsert> }) => updateRequest(id, patch),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['requests'] });
        toast?.({ variant: 'success', title: 'Request updated' });
      }
    }
  );
};

export const useDeleteRequest = () => {
  const qc = useQueryClient();
  return useMutation((id: number) => deleteRequest(id), {
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] })
  });
};
