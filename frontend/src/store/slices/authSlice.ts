import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types";

interface AuthState {
  currentUser: IUser | null;
  loading: boolean;
  error: string | null;
}

const getInitialUser = (): IUser | null => {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
};

const initialState: AuthState = {
  currentUser: getInitialUser(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<IUser>) => {
      state.currentUser = action.payload;
      state.error = null;
      localStorage.setItem("currentUser", JSON.stringify(action.payload));
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.error = null;
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
    },
    updateUserFields: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
      }
    },
  },
});

export const { loginSuccess, logoutSuccess, updateUserFields } = authSlice.actions;
export default authSlice.reducer;
