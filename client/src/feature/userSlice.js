import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../utils/axios'

// Thunk: Get Users (unchanged but cleaned)
export const getUsers = createAsyncThunk(
  'users/getUsers',
  async (_userData, { rejectWithValue }) => {
    try {
      const res = await api.get('/users/getallusers')
      return res.data?.payload ?? [] // be defensive
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch users'
      return rejectWithValue(message)
    }
  }
)

// ✅ Thunk: Login User — accept credentials from component
export const loginUser = createAsyncThunk(
  'users/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/login', { email, password })
      // Token is handled by secure cookies from the server.
      return res.data?.payload
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to login'
      return rejectWithValue(message)
    }
  }
)

// ✅ Thunk: Register User — accept credentials from component
export const registerUser = createAsyncThunk(
  'users/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/users/register', { name, email, password })
      // After registration, perhaps auto-login or just return success
      return res.data?.message || 'Registration successful'
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to register'
      return rejectWithValue(message)
    }
  }
)


export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, { rejectWithValue }) => {
      try {
         const res= await api.get('/users/current-user')
         return res.data.payload;


      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);

export const logoutUser = createAsyncThunk(
  'users/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/users/logout');
      return;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to logout';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  users: [],
  loggedUser: null,     // 🔧 consistent name
  loading: false,
  error: null,
  isLoggedIn: false     // 🔧 consistent casing
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    logout(state) {
      state.loggedUser = null
      state.isLoggedIn = false
      state.error = null
    },
    clearError(state) {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
        state.error = null
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.loggedUser = action.payload      // 🔧 fixed key
        state.isLoggedIn = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false                  // 🔧 fixed typo
        state.isLoggedIn = false
        state.loggedUser = null
        state.error = action.payload || 'Something went wrong during login'
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Optionally set some state, but since registration doesn't log in, maybe just clear error
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong during registration'
      })
      .addCase(getCurrentUser.pending,(state)=>{
        state.loading=true;
        state.error=null
      })
      .addCase(getCurrentUser.fulfilled,(state,action)=>{
        state.loading=false,
        state.loggedUser=action.payload,
        state.isLoggedIn=true,
        state.error=null
      })
      .addCase(getCurrentUser.rejected,(state,action)=>{
        state.loading=false;
        state.isLoggedIn=false;
        state.loggedUser=null;
        state.error=null;
      
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.loggedUser = null;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong during logout';
        // Still logout locally even if backend fails
        state.loggedUser = null;
        state.isLoggedIn = false;
      })
  },
})

export const { logout, clearError } = usersSlice.actions
export default usersSlice.reducer
