import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin Analytics
    getAdminAnalytics: builder.query<any, string>({
      query: (timeRange) => `/admin/analytics?range=${timeRange}`,
      providesTags: ['Admin'],
    }),
    
    // User Management
    getUsers: builder.query<any[], void>({
      query: () => '/admin/users',
      providesTags: ['Admin'],
    }),
    
    updateUserRole: builder.mutation<any, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['Admin'],
    }),
    
    // System Management
    getSystemStats: builder.query<any, void>({
      query: () => '/admin/system/stats',
      providesTags: ['Admin'],
    }),
    
    exportData: builder.mutation<any, { type: string; format: string }>({
      query: ({ type, format }) => ({
        url: `/admin/export/${type}`,
        method: 'POST',
        body: { format },
      }),
    }),
  }),
});

export const {
  useGetAdminAnalyticsQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useGetSystemStatsQuery,
  useExportDataMutation,
} = adminApi;