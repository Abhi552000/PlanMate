import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../config";

interface EpicState {
  epics: any[];
  loading: boolean;
  error: string | null;
}

const initialState: EpicState = {
  epics: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchEpics = createAsyncThunk("epics/fetchEpics", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/epics");
    return data.epics || [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch epics.");
  }
});

export const createEpic = createAsyncThunk(
  "epics/createEpic",
  async (epicData: { name: string; color?: string; description?: string }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/api/epics", epicData);
      return data.epic;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create epic.");
    }
  }
);

export const deleteEpic = createAsyncThunk("epics/deleteEpic", async (id: string, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/api/epics/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete epic.");
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
