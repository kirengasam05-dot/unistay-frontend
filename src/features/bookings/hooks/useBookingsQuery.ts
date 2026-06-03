import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { bookingsApi } from '../bookingsApi';

export function useBookingsQuery() {
  return useQuery({ queryKey: queryKeys.bookings, queryFn: bookingsApi.getMyBookings });
}
