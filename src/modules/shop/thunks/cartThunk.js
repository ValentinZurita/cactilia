import { createAsyncThunk } from '@reduxjs/toolkit';
import { saveCart, getCart, deleteCart } from '../services/cartService.js';
import {
  setCartItems,
  setSyncStatus,
  setSyncError,
  setLastSync,
  clearCart
} from '../slices/cartSlice';

/**
 * Carga el carrito desde Firebase
 */
export const loadCartFromServer = createAsyncThunk(
  'cart/loadFromServer',
  async (userId, { dispatch }) => {
    try {
      dispatch(setSyncStatus('loading'));

      const result = await getCart(userId);

      if (result.ok) {
        // Si hay items, cargarlos
        if (result.data && result.data.items && result.data.items.length > 0) {
          dispatch(setCartItems(result.data.items));
        }

        // Registrar sincronización exitosa
        dispatch(setLastSync(new Date().toISOString()));
        return result.data;
      } else {
        dispatch(setSyncError(result.error || 'Error al cargar el carrito'));
        return null;
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      dispatch(setSyncError(error.message));
      return null;
    }
  }
);

/**
 * Sincroniza el carrito con Firebase
 */
export const syncCartWithServer = createAsyncThunk(
  'cart/syncWithServer',
  async (userId, { getState, dispatch }) => {
    try {
      dispatch(setSyncStatus('loading'));

      // Obtener items actuales del carrito
      const { cart } = getState();
      const { items } = cart;

      // Si el carrito está vacío, eliminar el documento del servidor
      if (items.length === 0) {
        await deleteCart(userId);
        dispatch(setLastSync(new Date().toISOString()));
        return [];
      }

      // Si hay items, guardarlos en el servidor
      const result = await saveCart(userId, items);

      if (result.ok) {
        dispatch(setLastSync(new Date().toISOString()));
        return items;
      } else {
        dispatch(setSyncError(result.error || 'Error al sincronizar el carrito'));
        return null;
      }
    } catch (error) {
      console.error('Error sincronizando carrito:', error);
      dispatch(setSyncError(error.message));
      return null;
    }
  }
);

/**
 * Limpia el carrito y lo sincroniza con el servidor
 */
export const clearCartWithSync = createAsyncThunk(
  'cart/clearWithSync',
  async (_, { dispatch, getState }) => {
    try {
      // Limpiar el carrito localmente
      dispatch(clearCart());

      // Obtener el usuario actual
      const { auth } = getState();
      const { uid } = auth;

      // Si está autenticado, sincronizar con el servidor
      if (uid) {
        await deleteCart(uid);
        dispatch(setLastSync(new Date().toISOString()));
      }

      return null;
    } catch (error) {
      console.error('Error limpiando carrito:', error);
      dispatch(setSyncError(error.message));
      return null;
    }
  }
);

/**
 * Verifica y actualiza el stock de los productos en el carrito
 */
export const checkCartItemsStock = createAsyncThunk(
  'cart/checkStock',
  async (_, { dispatch, getState }) => {
    try {
      // Obtener items actuales del carrito
      const { cart } = getState();
      const { items } = cart;

      if (items.length === 0) return null;

      // Aquí deberías tener un servicio que consulte el stock actual
      // de los productos en el carrito, por ejemplo:
      // const stockInfo = await getProductsStock(items.map(item => item.id));

      // Por ahora, esto es un placeholder
      // En tu implementación real, reemplaza esto con una llamada a tu API
      // que verifique el stock actual

      return null;
    } catch (error) {
      console.error('Error verificando stock:', error);
      return null;
    }
  }
);