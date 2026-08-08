import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { backlogService } from "../../services/backlogService";
import { EpicState } from "../../types";

const initialState: EpicState = {
  epics: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchEpics = createAsyncThunk("epics/fetchEpics", async (_, { rejectWithValue }) => {
  try {
    const data = await backlogService.getEpics();
    return data.epics || [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch epics.");
  }
});

export const createEpic = createAsyncThunk(
  "epics/createEpic",
  async (epicData: { name: string; color?: string; description?: string }, { rejectWithValue }) => {
    try {
      const epic = await backlogService.createEpic(epicData);
      return epic;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to create epic.");
    }
  }
);

export const deleteEpic = createAsyncThunk("epics/deleteEpic", async (id: string, { rejectWithValue }) => {
  try {
    const deletedId = await backlogService.deleteEpic(id);
    return deletedId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to delete epic.");
  }
});

const epicSlice = createSlice({
  name: "epics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Epics
      .addCase(fetchEpics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEpics.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.epics = action.payload;
      })
      .addCase(fetchEpics.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Epic
      .addCase(createEpic.fulfilled, (state, action: PayloadAction<any>) => {
        state.epics.unshift(action.payload);
      })
      // Delete Epic
      .addCase(deleteEpic.fulfilled, (state, action: PayloadAction<string>) => {
        state.epics = state.epics.filter((e) => e._id !== action.payload);
      });
  },
});

export default epicSlice.reducer;
