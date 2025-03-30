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

      // Datos esenciales del producto para el carrito
      const cartProduct = {
        id: product.id,
        name: product.name || product.title,
        price: product.price,
        image: product.image || product.mainImage,
        category: product.category,
        stock: product.stock || 0
      };

      // Buscar si el producto ya está en el carrito
      const existingItem = state.items.find(item => item.id === cartProduct.id);

      if (existingItem) {
        // Validar stock antes de actualizar
        const newQuantity = existingItem.quantity + quantity;
        if (cartProduct.stock === 0) {
          // No hacer nada si no hay stock
          return;
        }
        // Limitar a stock disponible si está definido
        existingItem.quantity = cartProduct.stock > 0
          ? Math.min(newQuantity, cartProduct.stock)
          : newQuantity;
        // Actualizar información de stock
        existingItem.stock = cartProduct.stock;
      } else {
        // Validar stock antes de añadir
        if (cartProduct.stock === 0) {
          // No añadir si no hay stock
          return;
        }
        // Limitar a stock disponible
        const validQuantity = cartProduct.stock > 0
          ? Math.min(quantity, cartProduct.stock)
          : quantity;

        // Añadir el producto con la cantidad validada
        state.items.push({
          ...cartProduct,
          quantity: validQuantity
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