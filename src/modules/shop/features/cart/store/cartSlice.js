import { createSlice } from '@reduxjs/toolkit';

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    lastSync: null,
    syncStatus: 'idle',
    error: null
  },
  reducers: {
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

    // Actualizar un solo item con stock actualizado
    updateCartItemStock: (state, action) => {
      const { id, stock } = action.payload;

      const item = state.items.find(item => item.id === id);
      if (item) {
        item.stock = stock;

        // Ajustar cantidad si excede el stock
        if (item.quantity > stock) {
          item.quantity = Math.max(0, stock);
        }
      }
    },

    // Actualizar múltiples items con stock actualizado
    updateMultipleItemsStock: (state, action) => {
      const stockMap = action.payload;

      state.items.forEach(item => {
        if (stockMap[item.id] !== undefined) {
          const newStock = stockMap[item.id];
          item.stock = newStock;

          // Ajustar cantidad si excede el stock
          if (item.quantity > newStock) {
            item.quantity = Math.max(0, newStock);
          }
        }
      });
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.id !== productId);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;

      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity); // Asegurar que no sea menor a 1
      }
    },

    clearCart: (state) => {
      state.items = [];
    },

    setCartItems: (state, action) => {
      state.items = action.payload;
    },

    setSyncStatus: (state, action) => {
      state.syncStatus = action.payload;
    },

    setSyncError: (state, action) => {
      state.error = action.payload;
      state.syncStatus = 'failed';
    },

    setLastSync: (state, action) => {
      state.lastSync = action.payload;
      state.syncStatus = 'succeeded';
      state.error = null;
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartItems,
  setSyncStatus,
  setSyncError,
  setLastSync,
  updateCartItemStock,
  updateMultipleItemsStock,
} = cartSlice.actions;

// Exportar el reducer directamente
export const cartReducer = cartSlice.reducer;

// Y también exportar todo el slice como default
export default cartSlice;