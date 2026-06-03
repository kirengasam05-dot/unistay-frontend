import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { learningProfileApi } from '../learningProfileApi';

export function useLearningProfileQuery(enabled = true) {
  return useQuery({ queryKey: queryKeys.learningProfile, queryFn: learningProfileApi.getMine, enabled });
}
