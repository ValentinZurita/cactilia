import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './auth/authSlice.js'
import { registerSlice } from '../../auth/store/registerSlice.js'

export default configureStore({
  reducer: {
    auth: authSlice.reducer,
    register: registerSlice.reducer
  }
})