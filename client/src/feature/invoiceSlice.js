import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../utils/axios.js'

export const fetchInvoiceNumber = createAsyncThunk(
  'invoice/fetchInvoiceNumber',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoices/invoiceNumber')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message)
    }
  }
)

export const createInvoice = createAsyncThunk(
  'invoice/createInvoice',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/invoices/create', invoiceData)
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message)
    }
  }
)

export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoices/all')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  invoiceNumber: '',
  invoicePending: false,
  invoiceError: null,
  invoices: [],
  invoicesPending: false,
  invoicesError: null,
  createPending: false,
  createError: null,
  lastCreatedInvoice: null
}

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearInvoiceError(state) {
      state.invoiceError = null
      state.createError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoiceNumber.pending, (state) => {
        state.invoicePending = true
        state.invoiceError = null
      })
      .addCase(fetchInvoiceNumber.fulfilled, (state, action) => {
        state.invoicePending = false
        state.invoiceNumber = action.payload.invoiceNumber
      })
      .addCase(fetchInvoiceNumber.rejected, (state, action) => {
        state.invoicePending = false
        state.invoiceError = action.payload || 'Failed to fetch invoice number'
      })
      .addCase(fetchInvoices.pending, (state) => {
        state.invoicesPending = true
        state.invoicesError = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoicesPending = false
        state.invoices = action.payload
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.invoicesPending = false
        state.invoicesError = action.payload || 'Failed to fetch invoices'
      })
      .addCase(createInvoice.pending, (state) => {
        state.createPending = true
        state.createError = null
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.createPending = false
        state.lastCreatedInvoice = action.payload
        state.invoices.unshift(action.payload)
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.createPending = false
        state.createError = action.payload || 'Failed to create invoice'
      })
  }
})

export const { clearInvoiceError } = invoiceSlice.actions
export default invoiceSlice.reducer
