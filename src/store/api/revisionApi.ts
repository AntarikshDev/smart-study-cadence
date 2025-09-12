import { apiSlice } from './apiSlice';
import { Topic, RevisionSchedule, RevisionSession } from '@/types/revision';

export const revisionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Topics
    getTopics: builder.query<Topic[], void>({
      query: () => '/topics',
      providesTags: ['Topic'],
    }),
    
    addTopic: builder.mutation<Topic, Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (topic) => ({
        url: '/topics',
        method: 'POST',
        body: topic,
      }),
      invalidatesTags: ['Topic'],
    }),
    
    updateTopic: builder.mutation<Topic, { id: string; updates: Partial<Topic> }>({
      query: ({ id, updates }) => ({
        url: `/topics/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Topic'],
    }),
    
    deleteTopic: builder.mutation<void, string>({
      query: (id) => ({
        url: `/topics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Topic'],
    }),
    
    // Schedules
    getSchedules: builder.query<RevisionSchedule[], void>({
      query: () => '/schedules',
      providesTags: ['Schedule'],
    }),
    
    snoozeSchedule: builder.mutation<
      { newDates: Date[] }, 
      { scheduleId: string; days: number; cascade: boolean }
    >({
      query: ({ scheduleId, days, cascade }) => ({
        url: `/schedules/${scheduleId}/snooze`,
        method: 'POST',
        body: { days, cascade },
      }),
      invalidatesTags: ['Schedule'],
    }),
    
    // Sessions
    getSessions: builder.query<RevisionSession[], void>({
      query: () => '/sessions',
      providesTags: ['Session'],
    }),
    
    startSession: builder.mutation<
      { sessionId: string }, 
      { topicId: string; plannedSeconds: number }
    >({
      query: ({ topicId, plannedSeconds }) => ({
        url: '/sessions/start',
        method: 'POST',
        body: { topicId, plannedSeconds },
      }),
      invalidatesTags: ['Session'],
    }),
    
    finishSession: builder.mutation<
      { nextDueDate: Date; cycleAdvanced: boolean; scheduleId: string },
      { sessionId: string; actualSeconds: number; rating: number; notes?: string }
    >({
      query: ({ sessionId, actualSeconds, rating, notes }) => ({
        url: `/sessions/${sessionId}/finish`,
        method: 'POST',
        body: { actualSeconds, rating, notes },
      }),
      invalidatesTags: ['Session', 'Schedule', 'Topic'],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useAddTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useGetSchedulesQuery,
  useSnoozeScheduleMutation,
  useGetSessionsQuery,
  useStartSessionMutation,
  useFinishSessionMutation,
} = revisionApi;