import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsData, LeaderboardEntry, ComparisonData } from '@/types/revision';

interface AnalyticsState {
  data: AnalyticsData | null;
  leaderboard: LeaderboardEntry[];
  comparison: ComparisonData | null;
  loading: boolean;
  error: string | null;
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
}

const initialState: AnalyticsState = {
  data: null,
  leaderboard: [],
  comparison: null,
  loading: false,
  error: null,
  timeRange: '30d',
};

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (timeRange: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch analytics');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'analytics/fetchLeaderboard',
  async ({ scope, window }: { scope: string; window: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/leaderboard?scope=${scope}&window=${window}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch leaderboard');
    }
  }
);

export const fetchComparison = createAsyncThunk(
  'analytics/fetchComparison',
  async ({ scope, id, window }: { scope: string; id: string; window: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/comparison?scope=${scope}&id=${id}&window=${window}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch comparison');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch analytics';
      })
      // Fetch leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch leaderboard';
      })
      // Fetch comparison
      .addCase(fetchComparison.fulfilled, (state, action) => {
        state.comparison = action.payload;
      })
      .addCase(fetchComparison.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch comparison';
      });
  },
});

export const { setTimeRange, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;