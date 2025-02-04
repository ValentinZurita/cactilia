import { configureStore, combineReducers } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { authSlice } from './auth/authSlice.js'
import { registerSlice } from '../../auth/store/registerSlice.js'
import { persistReducer, persistStore } from 'redux-persist'
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'


// Config persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
}

// Create the persisted reducer for the auth slice only
const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer)

// Create the store with the reducers and the middleware to ignore some actions for the persistence
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer, // Add the persisted auth slice to the store
    register: registerSlice.reducer, // Add the register slice to the store
  },
  // Add the middleware to ignore some actions for the persistence
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER], // Ignore these actions
      },
    }),
})

// Export the store
export const persistor = persistStore(store);