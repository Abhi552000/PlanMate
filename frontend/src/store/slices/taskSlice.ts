import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ITask, TaskState } from "../../types";
import { taskService } from "../../services/taskService";
import { getCachedStatuses } from "../../utils/statusUtils";

const initialState: TaskState = {
  tasks: [],
  statuses: getCachedStatuses(),
  loading: false,
  error: null,
};

// Async Thunks
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (_, { rejectWithValue }) => {
  try {
    const data = await taskService.getTasks();
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.tasks)
      ? data.tasks
      : Array.isArray(data?.data)
      ? data.data
      : [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Could not load tasks.");
  }
});

export const createTask = createAsyncThunk("tasks/createTask", async (taskData: any, { rejectWithValue }) => {
  try {
    const task = await taskService.createTask(taskData);
    return task;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to create task.");
  }
});

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }: { id: string; taskData: any }, { rejectWithValue }) => {
    try {
      const task = await taskService.updateTask(id, taskData);
      return task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to update task.");
    }
  }
);

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id: string, { rejectWithValue }) => {
  try {
    const deletedId = await taskService.deleteTask(id);
    return deletedId._id || id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to delete task.");
  }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setStatuses: (state, action: PayloadAction<string[]>) => {
      state.statuses = action.payload;
    },
    updateTaskOptimistic: (
      state,
      action: PayloadAction<{ id: string; status: string; completed?: string | boolean | number }>
    ) => {
      const task = state.tasks.find((t) => t._id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
        if (action.payload.completed !== undefined) {
          task.completed = action.payload.completed;
        }
      }
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
      .addCase(createTask.fulfilled, (state, action: PayloadAction<any>) => {
        const newTask = action.payload?.task || action.payload;
        if (newTask && newTask._id) {
          state.tasks.unshift(newTask);
        }
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<any>) => {
        const updatedTask = action.payload?.task || action.payload;
        if (updatedTask && updatedTask._id) {
          const idx = state.tasks.findIndex((t) => t._id === updatedTask._id);
          if (idx !== -1) {
            state.tasks[idx] = updatedTask;
          }
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<any>) => {
        const idToDelete = action.payload?.id || action.payload?._id || action.payload;
        if (idToDelete) {
          state.tasks = state.tasks.filter((t) => t && t._id !== idToDelete);
        }
      });
  },
});

export const { setStatuses, updateTaskOptimistic } = taskSlice.actions;
export default taskSlice.reducer;
