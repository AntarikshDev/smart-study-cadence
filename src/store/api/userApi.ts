import { apiSlice } from './apiSlice';
import { UserSettings } from '@/types/revision';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation<
      { token: string; user: any },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<
      { token: string; user: any },
      { email: string; password: string; name: string }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // User Profile
    getProfile: builder.query<any, void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<any, Partial<any>>({
      query: (updates) => ({
        url: '/user/profile',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Settings
    getSettings: builder.query<UserSettings, void>({
      query: () => '/user/settings',
      providesTags: ['Settings'],
    }),
    
    updateSettings: builder.mutation<UserSettings, Partial<UserSettings>>({
      query: (settings) => ({
        url: '/user/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = userApi;