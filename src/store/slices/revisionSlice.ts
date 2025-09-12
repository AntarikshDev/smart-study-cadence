import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Topic, RevisionSchedule, RevisionSession } from '@/types/revision';

interface RevisionState {
  topics: Topic[];
  schedules: RevisionSchedule[];
  sessions: RevisionSession[];
  loading: boolean;
  error: string | null;
  selectedTopic: Topic | null;
  focusMode: {
    isActive: boolean;
    currentTopicId: string | null;
    startTime: Date | null;
    duration: number;
  };
}

const initialState: RevisionState = {
  topics: [],
  schedules: [],
  sessions: [],
  loading: false,
  error: null,
  selectedTopic: null,
  focusMode: {
    isActive: false,
    currentTopicId: null,
    startTime: null,
    duration: 0,
  },
};

// Async thunks for API calls
export const fetchTopics = createAsyncThunk(
  'revision/fetchTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/topics', {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch topics');
    }
  }
);

export const addTopic = createAsyncThunk(
  'revision/addTopic',
  async (topic: Omit<Topic, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(topic),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add topic');
    }
  }
);

export const updateTopic = createAsyncThunk(
  'revision/updateTopic',
  async ({ id, updates }: { id: string; updates: Partial<Topic> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update topic');
    }
  }
);

export const deleteTopic = createAsyncThunk(
  'revision/deleteTopic',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete topic');
    }
  }
);

export const fetchSchedules = createAsyncThunk(
  'revision/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/schedules', {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch schedules');
    }
  }
);

export const snoozeSchedule = createAsyncThunk(
  'revision/snoozeSchedule',
  async ({ scheduleId, days, cascade }: { scheduleId: string; days: number; cascade: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}/snooze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ days, cascade }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to snooze schedule');
    }
  }
);

export const startSession = createAsyncThunk(
  'revision/startSession',
  async ({ topicId, plannedSeconds }: { topicId: string; plannedSeconds: number }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ topicId, plannedSeconds }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to start session');
    }
  }
);

export const finishSession = createAsyncThunk(
  'revision/finishSession',
  async ({ sessionId, actualSeconds, rating, notes }: { sessionId: string; actualSeconds: number; rating: number; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ actualSeconds, rating, notes }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to finish session');
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'revision/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/sessions', {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sessions');
    }
  }
);

const revisionSlice = createSlice({
  name: 'revision',
  initialState,
  reducers: {
    setSelectedTopic: (state, action: PayloadAction<Topic | null>) => {
      state.selectedTopic = action.payload;
    },
    startFocusMode: (state, action: PayloadAction<string>) => {
      state.focusMode = {
        isActive: true,
        currentTopicId: action.payload,
        startTime: new Date(),
        duration: 0,
      };
    },
    endFocusMode: (state) => {
      state.focusMode = {
        isActive: false,
        currentTopicId: null,
        startTime: null,
        duration: 0,
      };
    },
    updateFocusDuration: (state, action: PayloadAction<number>) => {
      state.focusMode.duration = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch topics
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch topics';
      })
      // Add topic
      .addCase(addTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics.push(action.payload);
      })
      .addCase(addTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add topic';
      })
      // Update topic
      .addCase(updateTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTopic.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.topics.findIndex(topic => topic.id === action.payload.id);
        if (index !== -1) {
          state.topics[index] = action.payload;
        }
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update topic';
      })
      // Delete topic
      .addCase(deleteTopic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTopic.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = state.topics.filter(topic => topic.id !== action.payload);
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete topic';
      })
      // Fetch schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch schedules';
      })
      // Snooze schedule
      .addCase(snoozeSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex(schedule => schedule.id === action.payload.id);
        if (index !== -1) {
          state.schedules[index] = action.payload;
        }
      })
      // Start session
      .addCase(startSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        state.focusMode.isActive = true;
        state.focusMode.currentTopicId = action.payload.topicId;
        state.focusMode.startTime = new Date(action.payload.startTime);
      })
      // Finish session
      .addCase(finishSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(session => session.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        state.focusMode.isActive = false;
        state.focusMode.currentTopicId = null;
        state.focusMode.startTime = null;
        state.focusMode.duration = 0;
      })
      // Fetch sessions
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
      });
  },
});

export const {
  setSelectedTopic,
  startFocusMode,
  endFocusMode,
  updateFocusDuration,
  clearError,
} = revisionSlice.actions;

export default revisionSlice.reducer;