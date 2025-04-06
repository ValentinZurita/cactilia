import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadCartFromServer, syncCartWithServer } from '../store/cartThunk.js'


/**
 * Hook para sincronizar automáticamente el carrito con Firebase
 * Se encarga de cargar el carrito al iniciar sesión y sincronizar
 * cuando hay cambios en el estado de autenticación
 *
 * @returns {Object} - Métodos para sincronización y estado actual
 */
export const useCartSync = () => {
  const dispatch = useDispatch();

  // Obtener estado de autenticación y carrito
  const { uid, status: authStatus } = useSelector(state => state.auth);
  const { items, lastSync } = useSelector(state => state.cart);

  // Cargar carrito al iniciar sesión
  useEffect(() => {
    // Desactivado para evitar duplicaciones
    // El carrito se carga desde App.jsx
    // Esto previene carga duplicada y mezcla de carritos
  }, [authStatus, uid, lastSync, dispatch]);

  // Función para sincronizar manualmente
  const syncCart = useCallback(() => {
    if (authStatus === 'authenticated' && uid) {
      dispatch(syncCartWithServer(uid));
    }
  }, [authStatus, uid, dispatch]);

  // Función para sincronizar después de una operación
  const syncAfterOperation = useCallback(() => {
    // Retrasar la sincronización para asegurar que los cambios de Redux se han procesado
    setTimeout(() => {
      syncCart();
    }, 100);
  }, [syncCart]);

  return {
    isAuthenticated: authStatus === 'authenticated',
    isSyncing: false, // Este estado debería venir de Redux si implementas un indicador de sincronización
    lastSync,
    syncCart,
    syncAfterOperation
  };
};