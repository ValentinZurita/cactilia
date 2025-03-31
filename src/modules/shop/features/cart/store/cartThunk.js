// src/store/cart/cartThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setCartItems, setSyncStatus, setSyncError, setLastSync, clearCart } from './cartSlice';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig.js'

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
        const cartData = cartSnap.data();
        dispatch(setCartItems(cartData.items || []));
        dispatch(setLastSync(new Date().toISOString()));
        return cartData;
      } else {
        // Si no existe un carrito, inicializar con el carrito actual
        const { cart } = getState();
        await setDoc(cartRef, {
          items: cart.items,
          updatedAt: new Date()
        });
        dispatch(setLastSync(new Date().toISOString()));
        return { items: cart.items };
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
      let mergedItems = cart.items.map(item => ({...item}));

      // Si ya existe un carrito, fusionar los items
      if (cartSnap.exists()) {
        const storedCart = cartSnap.data();
        const storedItems = storedCart.items || [];

        // Para cada item en el carrito almacenado
        storedItems.forEach(storedItem => {
          // Verificar si ya existe en el carrito local
          const localItemIndex = mergedItems.findIndex(i => i.id === storedItem.id);

          if (localItemIndex >= 0) {
            // Si existe, crear un nuevo objeto con la cantidad sumada
            mergedItems[localItemIndex] = {
              ...mergedItems[localItemIndex],
              quantity: mergedItems[localItemIndex].quantity + storedItem.quantity
            };
          } else {
            // Si no existe, añadir una copia
            mergedItems.push({...storedItem});
          }
        });
      }

      // Actualizar en Firestore
      await setDoc(cartRef, {
        items: mergedItems,
        updatedAt: new Date()
      });

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

      dispatch(setSyncStatus('loading'));

      // Guardar el carrito en Firestore
      const cartRef = doc(FirebaseDB, 'carts', auth.uid);
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