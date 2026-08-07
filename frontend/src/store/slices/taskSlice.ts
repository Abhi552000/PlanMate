import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../config";
import { ITask } from "../../types";

interface TaskState {
  tasks: ITask[];
  statuses: string[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  statuses: ["To Do", "In Progress", "Done"],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/api/tasks/gp");
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.tasks)
      ? data.tasks
      : Array.isArray(data?.data)
      ? data.data
      : [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Could not load tasks.");
  }
});

export const createTask = createAsyncThunk("tasks/createTask", async (taskData: any, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post("/api/tasks", taskData);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to create task.");
  }
});

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }: { id: string; taskData: any }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/api/tasks/${id}`, taskData);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update task.");
    }
  }
);

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id: string, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/api/tasks/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete task.");
  }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setStatuses: (state, action: PayloadAction<string[]>) => {
      state.statuses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<ITask[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action: PayloadAction<ITask>) => {
        state.tasks.unshift(action.payload);
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<ITask>) => {
        const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) {
          state.tasks[idx] = action.payload;
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      });
  },
});

export const { setStatuses } = taskSlice.actions;
export default taskSlice.reducer;
