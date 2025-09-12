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
  async () => {
    // Replace with actual API call
    const response = await fetch('/api/topics');
    return response.json();
  }
);

export const addTopic = createAsyncThunk(
  'revision/addTopic',
  async (topic: Omit<Topic, 'id'>) => {
    // Replace with actual API call
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic),
    });
    return response.json();
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
        state.error = action.error.message || 'Failed to fetch topics';
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
        state.error = action.error.message || 'Failed to add topic';
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