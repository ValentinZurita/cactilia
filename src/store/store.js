import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { registerSlice } from '../modules/auth/store/registerSlice.js'
import { persistReducer, persistStore } from 'redux-persist'
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { authSlice } from './auth/authSlice.js'
import { cartSlice } from './cart/cartSlice.js'
import messagesReducer from './messages/messageSlice.js'


// Config persistence for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['auth']
}


// Config persistence for cart
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items']
}


// Create the persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer)
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice.reducer)


// Create the store with the reducers and the middleware to ignore some actions for the persistence
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    register: registerSlice.reducer,
    cart: persistedCartReducer,
    messages: messagesReducer,
  },


  // Add the middleware to ignore some actions for the persistence
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})


// Export the store
export const persistor = persistStore(store);