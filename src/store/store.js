import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage' // Almacenamiento por defecto (localStorage)
import { registerSlice } from '../modules/auth/store/registerSlice.js'
import { persistReducer, persistStore } from 'redux-persist' // Utilidades para persistencia
// Constantes de acciones de redux-persist para ignorar en el chequeo de serialización
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist' 
import { authSlice } from './auth/authSlice.js'
import messagesReducer from './messages/messageSlice.js'
import ordersReducer from '../modules/admin/components/orders/slices/ordersSlice.js';
import { cartSlice } from '../modules/shop/features/cart/store/index.js'
import homepageReducer from './slices/homepageSlice.js'
import siteConfigReducer from './slices/siteConfigSlice.js'
import shopPageReducer from './slices/shopPageSlice.js'
import uiReducer from './slices/uiSlice.js' // Reducer para estado de UI (ej. modales)

// --- Configuración de Persistencia por Slice --- 

// Configuración de persistencia para 'auth'
const authPersistConfig = {
  key: 'auth', // Clave en el storage
  storage,     // Adaptador de almacenamiento (localStorage)
  whitelist: ['auth'] // Campos específicos a persistir dentro del slice 'auth'
}

// Configuración de persistencia para 'cart'
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'] // Solo persistir los items del carrito
}

// Configuración de persistencia para 'orders' (Admin)
const ordersPersistConfig = {
  key: 'orders',
  storage,
  // Solo persistimos los filtros aplicados, no la lista completa de órdenes
  whitelist: ['filters'] 
}

// Configuración de persistencia para 'shopPage'
const shopPagePersistConfig = {
  key: 'shopPage',
  storage,
  // Persistir datos principales y timestamp, excluir filtros, paginación, carga, errores
  whitelist: ['allProducts', 'categories', 'categoriesMap', 'bannerConfig', 'bannerCollectionImages', 'lastFetchTimestamp'] 
};

// Configuración de persistencia para 'homepage'
const homepagePersistConfig = {
  key: 'homepage',
  storage,
  whitelist: ['pageData', 'featuredProducts', 'featuredCategories', 'collectionImages', 'lastFetchTimestamp'] 
};

// Configuración de persistencia para 'siteConfig'
const siteConfigPersistConfig = {
  key: 'siteConfig',
  storage,
  whitelist: ['companyInfo', 'lastFetchTimestamp'] 
};

// --- Creación de Reducers Persistidos ---
// Envolvemos los reducers que queremos persistir con persistReducer
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer)
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice.reducer)
const persistedOrdersReducer = persistReducer(ordersPersistConfig, ordersReducer)
const persistedShopPageReducer = persistReducer(shopPagePersistConfig, shopPageReducer);
const persistedHomepageReducer = persistReducer(homepagePersistConfig, homepageReducer);
const persistedSiteConfigReducer = persistReducer(siteConfigPersistConfig, siteConfigReducer);

// --- Verificación de Serialización Personalizada (Middleware) ---
// Redux requiere que todo el estado sea serializable.
// Firestore devuelve objetos (como Timestamps) que no son serializables por defecto.
// Este chequeo personalizado permite explícitamente ciertos tipos no serializables 
// relacionados con Firestore, asumiendo que se manejan adecuadamente en otro lugar
// (o se transforman antes de guardarlos, aunque aquí no se ve transformación).
const firestoreSerializableCheck = {
  isSerializable: (value) => {
    // Permite objetos de Firestore y Timestamps
    if (
      value &&
      typeof value === 'object' &&
      (value._firestore || // Objeto Firestore
        value._key ||      // Clave interna Firestore?
        value._converter ||// Convertidor Firestore?
        (value.seconds !== undefined && value.nanoseconds !== undefined)) // Timestamp Firestore
    ) {
      return true;
    }
    // Usa la verificación por defecto para otros tipos
    const defaultCheck = typeof value === 'undefined' ||
                        value === null ||
                        typeof value === 'boolean' ||
                        typeof value === 'number' ||
                        typeof value === 'string' ||
                        Array.isArray(value) ||
                        Object.prototype.toString.call(value) === '[object Object]';
    return defaultCheck;
  },
  // Función opcional para extraer entradas de objetos (usamos la predeterminada)
  getEntries: (value) => {
    return Object.entries(value);
  },
};

// --- Combinación de Reducers --- 
// Mapeo de los nombres de estado a sus respectivos reducers.
// Usamos los reducers persistidos donde corresponda.
const rootReducer = {
  auth: persistedAuthReducer,       // Estado de autenticación (persistido)
  register: registerSlice.reducer,  // Estado de registro (no persistido)
  cart: persistedCartReducer,         // Estado del carrito (persistido)
  messages: messagesReducer,        // Estado de mensajes globales (no persistido)
  orders: persistedOrdersReducer,       // Estado de órdenes (filtros persistidos)
  homepage: persistedHomepageReducer,   // Estado de la página de inicio (persistido)
  siteConfig: persistedSiteConfigReducer, // Estado de configuración del sitio (persistido)
  shopPage: persistedShopPageReducer,   // Estado de la página de tienda (persistido)
  ui: uiReducer,                    // Estado de UI (ej. modal, no persistido)
}

// --- Creación del Store --- 
export const store = configureStore({
  reducer: rootReducer, // El objeto que combina todos nuestros reducers

  // Configuración del Middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configuración para el chequeo de serialización
      serializableCheck: {
        // Usar nuestra función personalizada para permitir ciertos tipos de Firestore
        isSerializable: firestoreSerializableCheck.isSerializable,
        getEntries: firestoreSerializableCheck.getEntries,

        // Ignorar acciones específicas (principalmente de redux-persist y thunks con datos no serializables)
        ignoredActions: [
          // Acciones de Redux Persist
          FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,

          // Acciones de Órdenes que pueden manejar Timestamps de Firestore
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

// --- Exportación del Persistor --- 
// Necesario para envolver la aplicación y rehidratar el estado persistido
export const persistor = persistStore(store);