import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { bookingsApi } from '../bookingsApi';

export function useBookingQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => bookingsApi.getOne(id),
    enabled: Boolean(id),
  });
}
