import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ITask, SprintState } from "../../types";
import { backlogService } from "../../services/backlogService";

const initialState: SprintState = {
  sprints: [],
  backlogTasks: [],
  activeSprint: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchSprints = createAsyncThunk("sprints/fetchSprints", async (_, { rejectWithValue }) => {
  try {
    const data = await backlogService.getSprints();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch sprints.");
  }
});

export const createSprint = createAsyncThunk(
  "sprints/createSprint",
  async (sprintData: { name: string; startDate?: string; endDate?: string; goal?: string }, { rejectWithValue }) => {
    try {
      const sprint = await backlogService.createSprint(sprintData);
      return sprint;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to create sprint.");
    }
  }
);

export const updateSprint = createAsyncThunk(
  "sprints/updateSprint",
  async (
    { id, sprintData }: { id: string; sprintData: { name?: string; startDate?: string; endDate?: string; goal?: string; status?: "planned" | "active" | "completed" | "closed" } },
    { rejectWithValue }
  ) => {
    try {
      const sprint = await backlogService.updateSprint(id, sprintData);
      return sprint;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to update sprint.");
    }
  }
);

export const deleteSprint = createAsyncThunk("sprints/deleteSprint", async (id: string, { rejectWithValue }) => {
  try {
    const deletedId = await backlogService.deleteSprint(id);
    return deletedId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to delete sprint.");
  }
});

const sprintSlice = createSlice({
  name: "sprints",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Sprints
      .addCase(fetchSprints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSprints.fulfilled, (state, action: PayloadAction<{ sprints: any[]; backlogTasks: ITask[] }>) => {
        state.loading = false;
        state.sprints = action.payload.sprints || [];
        state.backlogTasks = action.payload.backlogTasks || [];
        state.activeSprint = action.payload.sprints?.find((s: any) => s.status === "active") || null;
      })
      .addCase(fetchSprints.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Sprint
      .addCase(createSprint.fulfilled, (state, action: PayloadAction<any>) => {
        state.sprints.unshift({ ...action.payload, tasks: [] });
      })
      // Update Sprint
      .addCase(updateSprint.fulfilled, (state, action: PayloadAction<any>) => {
        const updated = action.payload;
        const idx = state.sprints.findIndex((s) => s._id === updated._id);
        if (idx !== -1) {
          state.sprints[idx] = { ...state.sprints[idx], ...updated };
        }
        if (updated.status === "active") {
          state.activeSprint = state.sprints.find((s) => s._id === updated._id) || null;
        } else if (updated.status === "completed" || updated.status === "closed") {
          if (state.activeSprint?._id === updated._id) {
            state.activeSprint = null;
          }
        }
      })
      // Delete Sprint
      .addCase(deleteSprint.fulfilled, (state, action: PayloadAction<string>) => {
        state.sprints = state.sprints.filter((s) => s._id !== action.payload);
        if (state.activeSprint?._id === action.payload) {
          state.activeSprint = null;
        }
      });
  },
});

export default sprintSlice.reducer;
