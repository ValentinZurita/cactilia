import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './auth/authSlice.js'

export default configureStore({
  reducer: {
    auth: authSlice.reducer
  }
})