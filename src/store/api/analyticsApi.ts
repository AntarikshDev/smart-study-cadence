import { apiSlice } from './apiSlice';
import { AnalyticsData, LeaderboardEntry, ComparisonData } from '@/types/revision';

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Analytics
    getAnalytics: builder.query<AnalyticsData, string>({
      query: (timeRange) => `/analytics?range=${timeRange}`,
      providesTags: ['Analytics'],
    }),
    
    // Leaderboards
    getLeaderboard: builder.query<
      LeaderboardEntry[], 
      { scope: string; window: string }
    >({
      query: ({ scope, window }) => `/leaderboard?scope=${scope}&window=${window}`,
      providesTags: ['Leaderboard'],
    }),
    
    getComparison: builder.query<
      ComparisonData,
      { scope: string; id: string; window: string }
    >({
      query: ({ scope, id, window }) => `/comparison?scope=${scope}&id=${id}&window=${window}`,
      providesTags: ['Comparison'],
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetLeaderboardQuery,
  useGetComparisonQuery,
} = analyticsApi;