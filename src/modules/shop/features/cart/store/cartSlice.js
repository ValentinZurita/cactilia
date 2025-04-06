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
      const { product, quantity = 1, shouldIncrement = false } = action.payload;

      // Buscar si el producto ya está en el carrito
      const existingItem = state.items.find(item => item.id === product.id);

      if (existingItem) {
        // Si el producto ya está en el carrito y debemos incrementar (explícitamente indicado)
        if (shouldIncrement) {
          console.log(`Incrementando cantidad de "${existingItem.name}" en ${quantity} unidades (solicitado explícitamente)`);
          existingItem.quantity += quantity;
        } else {
          // Si no se solicitó incremento, mantener la cantidad actual
          // Esto previene incrementos automáticos no deseados
          console.log(`Producto "${existingItem.name}" ya en carrito, manteniendo cantidad (${existingItem.quantity})`);
        }
      } else {
        // Extraer las propiedades de envío con valores por defecto para evitar undefined
        const shippingRuleId = product.shippingRuleId || null;
        
        // Manejar shippingRuleIds correctamente (podría ser undefined, null, o un array)
        let shippingRuleIds = null;
        if (product.shippingRuleIds) {
          if (Array.isArray(product.shippingRuleIds)) {
            shippingRuleIds = [...product.shippingRuleIds];
          } else {
            // Si existe pero no es un array, convertirlo a string
            shippingRuleIds = [String(product.shippingRuleIds)];
          }
        } else if (shippingRuleId) {
          // Si no hay shippingRuleIds pero sí shippingRuleId, usar ese
          shippingRuleIds = [shippingRuleId];
        }

        // Log para depuración
        console.log(`📦 Producto "${product.name}": ${shippingRuleIds ? 
          `${shippingRuleIds.length} reglas de envío [${shippingRuleIds.join(', ')}]` : 
          'sin reglas'}`);

        // Si no, añadirlo con la cantidad especificada
        state.items.push({
          id: product.id,
          name: product.name || product.title,
          price: product.price,
          image: product.image || product.mainImage,
          category: product.category,
          quantity,
          stock: product.stock || 0,
          // Incluir propiedades de envío con valores seguros
          shippingRuleId,
          shippingRuleIds,
          weight: product.weight || 0,
          // Añadir un indicador para propiedades de envío
          hasShippingRules: !!shippingRuleId || (Array.isArray(shippingRuleIds) && shippingRuleIds.length > 0)
        });
      }
    },

    // Actualizar un solo item con stock actualizado
    updateCartItemStock: (state, action) => {
      const { id, stock } = action.payload;

      const item = state.items.find(item => item.id === id);
      if (item) {
        // Solo actualizar la información de stock disponible
        // NUNCA ajustar automáticamente la cantidad del producto
        item.stock = stock;
        
        // El siguiente código está comentado para evitar modificaciones automáticas de cantidad
        // que estaban causando que los productos se incrementaran solos
        /*
        if (adjustQuantity && item.quantity > stock) {
          console.log(`⚠️ Ajustando cantidad de "${item.name}" de ${item.quantity} a ${stock} por stock insuficiente`);
          item.quantity = Math.max(0, stock);
        }
        */
      }
    },

    // Actualizar múltiples items con stock actualizado
    updateMultipleItemsStock: (state, action) => {
      const stockMap = action.payload;

      state.items.forEach(item => {
        if (stockMap[item.id] !== undefined) {
          const newStock = stockMap[item.id];
          // Solo actualizar la información de stock disponible
          item.stock = newStock;

          // El siguiente código está comentado para evitar modificaciones automáticas de cantidad
          /*
          if (item.quantity > newStock) {
            item.quantity = Math.max(0, newStock);
          }
          */
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