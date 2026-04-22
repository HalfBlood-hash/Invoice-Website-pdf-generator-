import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../utils/axios.js'

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error.message

const normalizeInvoice = (invoice) => {
  const total = Number(invoice?.total) || 0
  const paidAmount = Number(invoice?.paidAmount) || 0
  const payments = (invoice?.payments || []).map((payment) => ({
    ...payment,
    amountPaid: Number(payment?.amountPaid) || 0
  }))
  const dueAmount =
    invoice?.dueAmount !== undefined && invoice?.dueAmount !== null
      ? Number(invoice.dueAmount)
      : Math.max(total - paidAmount, 0)

  let status = invoice?.status
  if (!status) {
    if (dueAmount === 0 && paidAmount > 0) {
      status = 'PAID'
    } else if (paidAmount > 0) {
      status = 'PARTIAL'
    } else {
      status = 'DUE'
    }
  }

  return {
    ...invoice,
    total,
    paidAmount,
    dueAmount,
    status,
    payments
  }
}

export const fetchInvoiceNumber = createAsyncThunk(
  'invoice/fetchInvoiceNumber',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoices/invoiceNumber')
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
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
      return rejectWithValue(getErrorMessage(error))
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
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchInvoiceById = createAsyncThunk(
  'invoice/fetchInvoiceById',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const addPayment = createAsyncThunk(
  'invoice/addPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/add', paymentData)
      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
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
  currentInvoice: null,
  currentInvoicePending: false,
  currentInvoiceError: null,
  createPending: false,
  createError: null,
  lastCreatedInvoice: null,
  paymentPending: false,
  paymentError: null,
  paymentInvoiceId: null,
  lastPaymentSummary: null
}

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearInvoiceError(state) {
      state.invoiceError = null
      state.createError = null
      state.paymentError = null
      state.currentInvoiceError = null
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
        const normalizedInvoices = action.payload.map(normalizeInvoice)
        state.invoices = normalizedInvoices

        if (state.currentInvoice?._id) {
          const refreshedCurrentInvoice = normalizedInvoices.find(
            (invoice) => invoice._id === state.currentInvoice._id
          )

          if (refreshedCurrentInvoice) {
            state.currentInvoice = refreshedCurrentInvoice
          }
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.invoicesPending = false
        state.invoicesError = action.payload || 'Failed to fetch invoices'
      })
      .addCase(fetchInvoiceById.pending, (state) => {
        state.currentInvoicePending = true
        state.currentInvoiceError = null
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.currentInvoicePending = false
        const normalizedInvoice = normalizeInvoice(action.payload)
        state.currentInvoice = normalizedInvoice

        const existingInvoiceIndex = state.invoices.findIndex(
          (invoice) => invoice._id === normalizedInvoice._id
        )

        if (existingInvoiceIndex >= 0) {
          state.invoices[existingInvoiceIndex] = normalizedInvoice
        } else {
          state.invoices.unshift(normalizedInvoice)
        }
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.currentInvoicePending = false
        state.currentInvoiceError = action.payload || 'Failed to fetch invoice details'
      })
      .addCase(createInvoice.pending, (state) => {
        state.createPending = true
        state.createError = null
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.createPending = false
        const normalizedInvoice = normalizeInvoice(action.payload)
        state.lastCreatedInvoice = normalizedInvoice
        state.invoices.unshift(normalizedInvoice)
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.createPending = false
        state.createError = action.payload || 'Failed to create invoice'
      })
      .addCase(addPayment.pending, (state, action) => {
        state.paymentPending = true
        state.paymentError = null
        state.paymentInvoiceId = action.meta.arg.invoiceId
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.paymentPending = false
        state.paymentError = null
        state.paymentInvoiceId = null
        state.lastPaymentSummary = action.payload

        if (action.payload.invoice) {
          const normalizedInvoice = normalizeInvoice(action.payload.invoice)
          state.invoices = state.invoices.map((invoice) =>
            invoice._id === normalizedInvoice._id ? normalizedInvoice : invoice
          )

          if (state.lastCreatedInvoice?._id === normalizedInvoice._id) {
            state.lastCreatedInvoice = normalizedInvoice
          }

          if (state.currentInvoice?._id === normalizedInvoice._id) {
            state.currentInvoice = normalizedInvoice
          }
        }
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.paymentPending = false
        state.paymentInvoiceId = null
        state.paymentError = action.payload || 'Failed to add payment'
      })
  }
})

export const { clearInvoiceError } = invoiceSlice.actions
export default invoiceSlice.reducer
