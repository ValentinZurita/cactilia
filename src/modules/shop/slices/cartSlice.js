import { createSlice } from '@reduxjs/toolkit';

/**
 * Slice de Redux para el carrito de compras
 * Maneja el estado y acciones relacionadas con el carrito
 */
export const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    lastSync: null,
    syncStatus: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null
  },
  reducers: {
    /**
     * Añade un producto al carrito o incrementa su cantidad si ya existe
     */
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;

      // Buscar si el producto ya está en el carrito
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        // Si el producto ya está en el carrito, incrementar cantidad
        existingItem.quantity += quantity;
      } else {
        // Si no, añadirlo con la cantidad especificada
        state.items.push({
          id: product.id,
          name: product.name || product.title,
          price: product.price,
          image: product.image || product.mainImage,
          category: product.category,
          quantity,
          stock: product.stock || 0
        });
      }
    },

    /**
     * Elimina un producto del carrito
     */
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
    },

    /**
     * Actualiza la cantidad de un producto
     */
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;

      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity); // Asegurar que no sea menor a 1
      }
    },

    /**
     * Vacía el carrito
     */
    clearCart: (state) => {
      state.items = [];
    },

    /**
     * Establece todo el contenido del carrito
     * Útil para cargar desde el servidor
     */
    setCartItems: (state, action) => {
      state.items = action.payload;
    },

    /**
     * Actualiza el estado de sincronización
     */
    setSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    },

    /**
     * Registra el error de sincronización
     */
    setSyncError: (state, action) => {
      state.error = action.payload;
      state.syncStatus = 'failed';
    },

    /**
     * Registra la última sincronización exitosa
     */
    setLastSync: (state, action) => {
      state.lastSync = action.payload;
      state.syncStatus = 'succeeded';
      state.error = null;
    },

    /**
     * Actualiza la información de stock de los productos en el carrito
     */
    updateStockInfo: (state, action) => {
      const stockUpdates = action.payload;

      state.items.forEach(item => {
        if (stockUpdates[item.id]) {
          item.stock = stockUpdates[item.id];
        }
      });
    }
  }
});

// Exportar acciones
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartItems,
  setSyncStatus,
  setSyncError,
  setLastSync,
  updateStockInfo
} = cartSlice.actions;

// Exportar selector para acceder fácilmente al carrito desde cualquier componente
export const selectCartItems = state => state.cart.items;
export const selectCartSyncStatus = state => state.cart.syncStatus;

export default cartSlice.reducer;