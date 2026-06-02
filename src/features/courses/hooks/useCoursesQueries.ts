import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/lib/queryKeys';
import { coursesApi } from '../coursesApi';

export function useCoursesQuery() {
  return useQuery({ queryKey: queryKeys.courses, queryFn: coursesApi.getAll });
}

export function useCourseDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.courseDetail(id),
    queryFn: () => coursesApi.getOne(id),
    enabled: Boolean(id),
  });
}
