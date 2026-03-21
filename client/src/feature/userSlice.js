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
      // Save token to localStorage
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token)
      }
      // Return whatever your backend returns. Assuming payload has user (adjust as needed)
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
      localStorage.removeItem('token')
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
        state.error=action.payload;
      
      })
  },
})

export const { logout, clearError } = usersSlice.actions
export default usersSlice.reducer
