import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { jobsApi } from '../jobsApi';

export function useJobsQuery() {
  return useQuery({ queryKey: queryKeys.jobs, queryFn: jobsApi.getAll });
}
