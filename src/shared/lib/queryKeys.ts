export const queryKeys = {
  housing: ['housing'] as const,
  housingDetail: (id: string) => ['housing', id] as const,
  bookings: ['bookings', 'mine'] as const,
  booking: (id: string) => ['bookings', id] as const,
  jobs: ['jobs'] as const,
  courses: ['courses'] as const,
  courseDetail: (id: string) => ['courses', id] as const,
  learningProfile: ['learning-profile', 'mine'] as const,
};
