import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import { registerSlice } from '../modules/auth/store/registerSlice.js'
import { persistReducer, persistStore } from 'redux-persist'
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { authSlice } from './auth/authSlice.js'
import messagesReducer from './messages/messageSlice.js'
import ordersReducer from '../modules/admin/components/orders/slices/ordersSlice.js';
import { cartSlice } from '../modules/shop/features/cart/store/index.js'
import homepageReducer from './slices/homepageSlice.js'
import siteConfigReducer from './slices/siteConfigSlice.js'
import shopPageReducer from './slices/shopPageSlice.js'

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

// Config persistence for orders
// Solo persistimos filtros y algunas configuraciones, no los datos completos
const ordersPersistConfig = {
  key: 'orders',
  storage,
  whitelist: ['filters'] // Solo persistimos los filtros aplicados
}

// Create the persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer)
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice.reducer)
const persistedOrdersReducer = persistReducer(ordersPersistConfig, ordersReducer)

// Config persistence for shopPage
const shopPagePersistConfig = {
  key: 'shopPage',
  storage,
  // Persist core data and timestamp, exclude filters/pagination/loading/error
  whitelist: ['allProducts', 'categories', 'categoriesMap', 'bannerConfig', 'bannerCollectionImages', 'lastFetchTimestamp'] 
};
const persistedShopPageReducer = persistReducer(shopPagePersistConfig, shopPageReducer);

// Crear un customSerializer para manejar objetos de Firestore
const firestoreSerializableCheck = {
  isSerializable: (value) => {
    // Verificar si es un objeto de Firestore o un Timestamp, en cuyo caso lo consideramos serializable
    // porque lo vamos a transformar antes de guardarlo en el store
    if (
      value &&
      typeof value === 'object' &&
      (value._firestore ||
        value._key ||
        value._converter ||
        (value.seconds !== undefined && value.nanoseconds !== undefined))
    ) {
      return true;
    }

    // Para otros valores, usar la verificación predeterminada
    // Esto no es el código completo, solo una indicación
    return typeof value === 'undefined' ||
      value === null ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      Array.isArray(value) ||
      Object.prototype.toString.call(value) === '[object Object]';
  },

  // Puedes definir getEntries si necesitas personalizar cómo se extraen las entradas de objetos
  getEntries: (value) => {
    return Object.entries(value);
  },
};

// Create the store with the reducers and the middleware to ignore some actions for the persistence
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    register: registerSlice.reducer,
    cart: persistedCartReducer,
    messages: messagesReducer,
    orders: persistedOrdersReducer, // Añadimos el reducer de orders
    homepage: homepageReducer,
    siteConfig: siteConfigReducer,
    shopPage: persistedShopPageReducer,
  },

  // Add the middleware to ignore some actions for the persistence
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Usar nuestra verificación personalizada
        isSerializable: firestoreSerializableCheck.isSerializable,
        getEntries: firestoreSerializableCheck.getEntries,

        // Acciones a ignorar
        ignoredActions: [
          // Redux Persist actions
          FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,

          // Orders actions que manejan datos de Firestore
          'orders/fetchOrders/pending',
          'orders/fetchOrders/fulfilled',
          'orders/fetchOrderById/pending',
          'orders/fetchOrderById/fulfilled',
          'orders/updateOrderStatus/pending',
          'orders/updateOrderStatus/fulfilled',
          'orders/addOrderNote/pending',
          'orders/addOrderNote/fulfilled',
        ],

        // Ignorar rutas específicas del estado
        ignoredPaths: [
          'orders.lastDoc',
          'orders.selectedOrder',
          'orders.orders',
        ],
      },
    }),
})

// Export the store
export const persistor = persistStore(store);