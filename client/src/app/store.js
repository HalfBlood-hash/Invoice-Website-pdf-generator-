

import { configureStore } from '@reduxjs/toolkit'
import usersReducer from '../feature/userSlice.js'
import invoiceReducer from '../feature/invoiceSlice.js'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    invoice: invoiceReducer
  }
})