import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Topic } from '@/types/revision';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTopics: number;
  totalSessions: number;
  avgSessionTime: number;
  completionRate: number;
}

interface AdminState {
  users: AdminUser[];
  systemStats: SystemStats | null;
  adminTopics: Topic[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  systemStats: null,
  adminTopics: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/users', {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status }: { userId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user status');
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'admin/fetchSystemStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/stats', {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch system stats');
    }
  }
);

export const fetchAdminTopics = createAsyncThunk(
  'admin/fetchAdminTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/topics', {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch admin topics');
    }
  }
);

export const createGlobalTopic = createAsyncThunk(
  'admin/createGlobalTopic',
  async (topic: Omit<Topic, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/topics', {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create global topic');
    }
  }
);

export const updateGlobalTopic = createAsyncThunk(
  'admin/updateGlobalTopic',
  async ({ id, updates }: { id: string; updates: Partial<Topic> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update global topic');
    }
  }
);

export const deleteGlobalTopic = createAsyncThunk(
  'admin/deleteGlobalTopic',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete global topic');
    }
  }
);

export const importCSVTopics = createAsyncThunk(
  'admin/importCSVTopics',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/topics/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to import CSV topics');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch users';
      })
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Fetch system stats
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.systemStats = action.payload;
      })
      // Fetch admin topics
      .addCase(fetchAdminTopics.fulfilled, (state, action) => {
        state.adminTopics = action.payload;
      })
      // Create global topic
      .addCase(createGlobalTopic.fulfilled, (state, action) => {
        state.adminTopics.push(action.payload);
      })
      // Update global topic
      .addCase(updateGlobalTopic.fulfilled, (state, action) => {
        const index = state.adminTopics.findIndex(topic => topic.id === action.payload.id);
        if (index !== -1) {
          state.adminTopics[index] = action.payload;
        }
      })
      // Delete global topic
      .addCase(deleteGlobalTopic.fulfilled, (state, action) => {
        state.adminTopics = state.adminTopics.filter(topic => topic.id !== action.payload);
      })
      // Import CSV topics
      .addCase(importCSVTopics.fulfilled, (state, action) => {
        state.adminTopics.push(...action.payload.topics);
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;