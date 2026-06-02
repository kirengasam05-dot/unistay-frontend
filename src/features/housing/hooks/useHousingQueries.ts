import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { housingApi } from '../housingApi';

export function useHousingQuery() {
  return useQuery({ queryKey: queryKeys.housing, queryFn: housingApi.getAll });
}

export function useHousingDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.housingDetail(id),
    queryFn: () => housingApi.getOne(id),
    enabled: Boolean(id),
  });
}
