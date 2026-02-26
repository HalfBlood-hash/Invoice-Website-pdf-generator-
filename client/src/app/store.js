

import {configureStore} from "@reduxjs/toolkit"
import usersReducer from '../feature/userSlice.js'
export const store=configureStore({
    reducer:{
        users:usersReducer
    }
})