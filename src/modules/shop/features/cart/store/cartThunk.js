// src/store/cart/cartThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setCartItems, setSyncStatus, setSyncError, setLastSync, clearCart, removeFromCart } from './cartSlice';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig.js'

// Variable para controlar throttling de sincronización
let lastSyncTime = 0;
const MIN_SYNC_INTERVAL = 2000; // 2 segundos mínimo entre sincronizaciones

/**
 * Carga el carrito desde Firestore para el usuario autenticado
 */
export const loadCartFromFirestore = createAsyncThunk(
  'cart/loadFromFirestore',
  async (_, { getState, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.uid) return;

      dispatch(setSyncStatus('loading'));

      // Referencia al documento del carrito en Firestore
      const cartRef = doc(FirebaseDB, 'carts', auth.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        // Si existe un carrito en Firestore, usarlo
        const cartData = cartSnap.data();
        console.log('Cargando carrito desde Firestore:', cartData.items || []);
        dispatch(setCartItems(cartData.items || []));
        dispatch(setLastSync(new Date().toISOString()));
        return cartData;
      } else {
        // Si no existe un carrito en Firestore, simplemente notificarlo
        // NO inicializar con el carrito actual para evitar duplicación
        dispatch(setLastSync(new Date().toISOString()));
        // Mantener el carrito actual sin modificar
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
 * Fusiona el carrito local con el de Firestore cuando el usuario inicia sesión
 */
export const mergeCartsOnLogin = createAsyncThunk(
  'cart/mergeOnLogin',
  async (_, { getState, dispatch }) => {
    try {
      const { auth, cart } = getState();
      if (!auth.uid) return;

      // Si no hay items en el carrito local, no hay nada que fusionar
      if (cart.items.length === 0) return;

      dispatch(setSyncStatus('loading'));

      // Intentar obtener el carrito existente del usuario
      const cartRef = doc(FirebaseDB, 'carts', auth.uid);
      const cartSnap = await getDoc(cartRef);

      // Crear una nueva copia profunda de los items para evitar modificar el estado directamente
      let mergedItems = [];
      
      // Si ya existe un carrito en Firestore, usarlo como base
      if (cartSnap.exists()) {
        const storedCart = cartSnap.data();
        mergedItems = storedCart.items || [];
        
        console.log('Carrito encontrado en Firestore:', mergedItems);
        
        // Simplemente reemplazar el carrito local con el de Firestore
        // No hacer fusión que podría causar duplicaciones
        
      } else {
        // Si no existe carrito en Firestore, usar el carrito local como base
        mergedItems = cart.items.map(item => ({...item}));
        
        console.log('No se encontró carrito en Firestore, usando carrito local:', mergedItems);
        
        // Actualizar en Firestore
        await setDoc(cartRef, {
          items: mergedItems,
          updatedAt: new Date()
        });
      }

      // Actualizar en Redux
      dispatch(setCartItems(mergedItems));
      dispatch(setLastSync(new Date().toISOString()));

      return { items: mergedItems };
    } catch (error) {
      console.error('Error fusionando carritos:', error);
      dispatch(setSyncError(error.message));
      return null;
    }
  }
);


/**
 * Sincroniza el carrito de Redux con Firestore
 */
export const syncCartWithServer = createAsyncThunk(
  'cart/syncWithServer',
  async (_, { getState, dispatch }) => {
    try {
      const { auth, cart } = getState();
      if (!auth.uid) return;

      // Implementar throttling para evitar sincronizaciones demasiado frecuentes
      const now = Date.now();
      if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
        console.log('Sincronización omitida por throttling, sincronizando en segundo plano...');
        
        // Programar una sincronización diferida y salir
        setTimeout(() => {
          dispatch(syncCartWithServer());
        }, MIN_SYNC_INTERVAL);
        
        // Actualizar timestap para evitar solapamiento de sincronizaciones
        lastSyncTime = now;
        
        return cart.items;
      }
      
      // Actualizar timestamp de última sincronización
      lastSyncTime = now;

      dispatch(setSyncStatus('loading'));

      // Verificar si ya existe un carrito en Firestore
      const cartRef = doc(FirebaseDB, 'carts', auth.uid);
      const cartSnap = await getDoc(cartRef);
      
      // Si ya existe un carrito, comparar items antes de actualizar
      if (cartSnap.exists()) {
        const storedCart = cartSnap.data();
        const storedItems = storedCart.items || [];
        
        // Si los carritos son idénticos, no hacer nada
        if (JSON.stringify(storedItems) === JSON.stringify(cart.items)) {
          console.log('Carrito sin cambios, omitiendo sincronización');
          dispatch(setLastSync(new Date().toISOString()));
          return cart.items;
        }
      }

      // Guardar el carrito en Firestore
      console.log('Sincronizando carrito con Firestore:', cart.items);
      await setDoc(cartRef, {
        items: cart.items,
        updatedAt: new Date()
      });

      dispatch(setLastSync(new Date().toISOString()));
      return cart.items;
    } catch (error) {
      console.error('Error sincronizando carrito:', error);
      dispatch(setSyncError(error.message));
      return null;
    }
  }
);

/**
 * Limpia el carrito y lo sincroniza con el servidor
 * Utilizada principalmente después de completar una compra
 */
export const clearCartWithSync = createAsyncThunk(
  'cart/clearWithSync',
  async (_, { dispatch, getState }) => {
    try {
      console.log("Executing clearCartWithSync");
      // Limpiar el carrito localmente
      dispatch(clearCart());

      // Obtener el usuario actual
      const { auth } = getState();
      const { uid } = auth;

      // Si está autenticado, eliminar el carrito del servidor
      if (uid) {
        const cartRef = doc(FirebaseDB, 'carts', uid);
        await deleteDoc(cartRef);
        dispatch(setLastSync(new Date().toISOString()));
        console.log("Cart cleared from server for user:", uid);
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
 * Elimina un item del carrito localmente y luego sincroniza con el servidor
 */
export const removeItemAndSync = createAsyncThunk(
  'cart/removeItemAndSync',
  async (productId, { dispatch, getState }) => {
    try {
      console.log(`Attempting to remove item ${productId} and sync...`);
      
      // 1. Eliminar localmente para UI optimista
      dispatch(removeFromCart(productId));
      
      // 2. Obtener estado actualizado y UID
      const { auth, cart } = getState();
      if (!auth.uid) {
        console.log('User not authenticated, skipping server sync after removal.');
        return; // No sincronizar si no está autenticado
      }

      // 3. Forzar la sincronización INMEDIATA con Firestore (sin throttling)
      //    Copiamos la lógica esencial de escritura de syncCartWithServer
      console.log(`Forcing immediate Firestore sync after removing item ${productId}`);
      dispatch(setSyncStatus('loading')); // Indicar que estamos sincronizando
      
      const cartRef = doc(FirebaseDB, 'carts', auth.uid);
      
      // Escribir directamente el estado actual del carrito (ya sin el item)
      await setDoc(cartRef, {
        items: cart.items, // Usar cart.items que ya fue actualizado por removeFromCart
        updatedAt: new Date()
      });
      
      dispatch(setLastSync(new Date().toISOString())); // Actualizar estado de sincronización
      console.log(`Firestore sync complete after removing item ${productId}`);
      
      // Ya no llamamos a dispatch(syncCartWithServer()) aquí
      // await dispatch(syncCartWithServer()); // <- Línea anterior eliminada

      return productId; // Devolver el ID del producto eliminado
    } catch (error) {
      console.error('Error removing item and syncing cart:', error);
      // Podríamos querer revertir la eliminación local aquí si falla la sincronización
      // O simplemente registrar el error y confiar en la próxima sincronización
      dispatch(setSyncError(error.message)); // Reusar el estado de error de sincronización
      throw error; // Relanzar para que el componente pueda manejarlo si es necesario
    }
  }
);