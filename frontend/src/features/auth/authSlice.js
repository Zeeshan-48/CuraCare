import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial state from localStorage if available
const storedUser = localStorage.getItem('curacare_user');
const storedToken = localStorage.getItem('curacare_token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      // Save to localStorage
      localStorage.setItem('curacare_user', JSON.stringify(action.payload.user));
      localStorage.setItem('curacare_token', action.payload.token);
    },
    authFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem('curacare_user');
      localStorage.removeItem('curacare_token');
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('curacare_user', JSON.stringify(state.user));
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logout,
  updateUserProfile,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
