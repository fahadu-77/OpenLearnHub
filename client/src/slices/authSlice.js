import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const token = localStorage.getItem('token');

let decodedUser = null;

if (token) {
  try {
    decodedUser = jwtDecode(token); // ⚠️ temporary only
  } catch {
    // localStorage.removeItem('token');
  }
}

const initialState = {
  token,
  user: decodedUser,        // temporary hydration
  isAuthenticated: false,   // ❌ DO NOT trust token
  loading: true,            // ✅ auth is async
  isLoaded: false,          // 🔄 tracks if loadUser has run
};
console.log('Initial token on load:', token); // Add this

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoaded: (state, action) => {
      state.user = action.payload;     // real user from backend
      state.isAuthenticated = true;
      state.loading = false;
      state.isLoaded = true;
    },

    loginSuccess: (state, action) => {
      localStorage.setItem('token', action.payload.token);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.isLoaded = true;
    },

    logout: (state) => {
        console.log('LOGOUT CALLED'); // Add this

      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    authError: (state) => {
console.log('authError triggered'); // Add this
      state.isAuthenticated = false;
      state.loading = false;
      state.isLoaded = true;
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const {
  userLoaded,
  loginSuccess,
  logout,
  authError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
