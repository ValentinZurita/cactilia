// src/modules/shop/features/cart/store/cartSlice.js
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
  setLastSync
} = cartSlice.actions;

// Exportar el reducer directamente
export const cartReducer = cartSlice.reducer;

// Y también exportar todo el slice como default
export default cartSlice;