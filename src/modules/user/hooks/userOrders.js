/**
 * useOrders.js
 *
 * Hook personalizado para la gestión de órdenes de usuario.
 * Proporciona métodos para obtener, filtrar y formatear la información de las órdenes.
 * Incluye manejo de errores y estados de carga.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addMessage } from '../../../store/messages/messageSlice';
import { getOrderById, getUserOrders } from '../../shop/features/order/services/orderService.js';

import { ORDER_STATUS_MAP } from '../constants/orderConstants.js';

const ORDERS_PER_PAGE = 10; // Número de órdenes a cargar por página

/**
 * Convierte el estado interno de un pedido a un estado de visualización.
 *
 * @param {string} status - El estado interno del pedido (p.e., "pending", "shipped", etc.).
 * @returns {string} - El estado convertido que se mostrará al usuario.
 */
const mapOrderStatusToDisplay = (status) => {
  return ORDER_STATUS_MAP[status] || status;
};

/**
 * Formatea un timestamp o fecha para mostrarla en formato "día de mes de año".
 *
 * @param {Object|number} timestamp - Puede ser un objeto de Firebase, un objeto Date o un número (milisegundos).
 * @returns {string} - Fecha formateada en español, o un mensaje de error si no se puede formatear.
 */
const formatOrderDate = (timestamp) => {
  if (!timestamp) return 'Fecha no disponible';

  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Hook principal para gestionar las órdenes del usuario.
 * Se encarga de:
 *   - Obtener todas las órdenes del usuario autenticado.
 *   - Filtrar órdenes según el estado seleccionado.
 *   - Obtener una orden específica por su ID.
 *   - Manejar errores y mostrar mensajes adecuados.
 *
 * @returns {Object} - Estados y funciones para gestionar órdenes.
 */
export const useOrders = () => {
  const dispatch = useDispatch();
  const { uid, status } = useSelector(state => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga general
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Estados para paginación
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Estado de carga para páginas siguientes

  const changeFilter = useCallback((newFilter) => {
    setFilter(newFilter);
    // TODO: Resetear paginación y volver a cargar si el filtro cambia?
    // Por ahora, el filtro solo aplica a las órdenes ya cargadas.
    // Para filtrar en backend, la lógica de fetch tendría que incluir el filtro.
  }, []);

  const getFilteredOrders = useCallback(() => {
    // Esta función ahora filtra las órdenes ya cargadas en el frontend.
    if (filter === 'all') return orders;
    return orders.filter((order) => {
      const displayStatus = mapOrderStatusToDisplay(order.status);
      return displayStatus === filter;
    });
  }, [filter, orders]);

  /**
   * Obtiene órdenes (primera página o siguientes).
   *
   * @param {boolean} loadMore - Indica si se están cargando más órdenes o es la carga inicial.
   */
  const fetchOrders = useCallback(async (loadMore = false) => {
    if (status !== 'authenticated' || !uid) {
      if (!loadMore) setLoading(false);
      return;
    }

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true); // Carga inicial
      setOrders([]); // Limpiar órdenes antes de la carga inicial
      setLastVisible(null);
      setHasMore(true);
    }
    setError(null);

    try {
      // Llamar a getUserOrders con parámetros de paginación
      const result = await getUserOrders(
        uid,
        ORDERS_PER_PAGE,
        loadMore ? lastVisible : null // Usar lastVisible si se carga más
      );

      if (result.ok) {
        setOrders(prevOrders => loadMore ? [...prevOrders, ...result.data] : result.data);
        setLastVisible(result.lastVisible); // Guardar el último documento visible
        setHasMore(result.hasMore); // Actualizar si hay más páginas
      } else {
        setError(result.error);
        dispatch(addMessage({
          type: 'error',
          text: 'Error al cargar tus pedidos. Por favor, intenta de nuevo.',
          autoHide: true
        }));
      }
    } catch (err) {
      console.error('Error obteniendo órdenes:', err);
      setError(err.message || 'Error al cargar pedidos');
      dispatch(addMessage({
        type: 'error',
        text: 'Error al cargar tus pedidos',
        autoHide: true
      }));
    } finally {
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [uid, status, dispatch, lastVisible]); // <-- Incluir lastVisible en dependencias

  /**
   * Carga la siguiente página de órdenes.
   */
  const fetchNextPage = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      fetchOrders(true); // Llama a fetchOrders indicando que es para cargar más
    }
  }, [hasMore, loading, loadingMore, fetchOrders]);

  /**
   * Realiza la consulta para obtener el detalle de una orden específica por su ID.
   * Maneja los estados de carga y posibles errores.
   *
   * @param {string} orderId - ID de la orden a consultar.
   */
  const fetchOrderById = useCallback(async (orderId) => {
    if (!orderId) {
      setOrderError('ID de pedido no proporcionado');
      return;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const result = await getOrderById(orderId);

      if (!result.ok) {
        console.error('Error obteniendo detalle de orden:', result.error);
        setOrderError(result.error || 'Error al cargar detalles del pedido');
        setOrder(null);

        // Despachar un mensaje global para homogeneizar la UX
        dispatch(addMessage({
          type: 'error',
          text: result.error || 'No encontramos el pedido solicitado',
          autoHide: true
        }));
        return;
      }

      setOrder(result.data);
    } catch (err) {
      console.error('Error obteniendo detalle de orden:', err);
      setOrderError(err.message || 'Error al cargar detalles del pedido');
      setOrder(null);

      // También despachamos un mensaje global
      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error al cargar detalles del pedido',
        autoHide: true
      }));
    } finally {
      setOrderLoading(false);
    }
  }, [dispatch]);

  /**
   * Cargar la primera página de órdenes al montar o cuando cambie el usuario.
   */
  useEffect(() => {
    fetchOrders(false); // Carga inicial
  }, [uid, status]); // Depender solo de uid y status para la carga inicial

  /**
   * Devuelve la lista de órdenes con campos formateados (fecha, estado, etc.).
   * Esto facilita la presentación en la interfaz de usuario.
   *
   * @returns {Array} - Lista de órdenes con campos formateados.
   */
  const getFormattedOrders = useCallback(() => {
    // Asegurarse de que getFilteredOrders() devuelve un array
    const filtered = getFilteredOrders() || [];
    
    return filtered.map((order) => ({
      id: order.id,
      date: formatOrderDate(order.createdAt),
      status: mapOrderStatusToDisplay(order.status),
      // Calcular items de forma segura
      items: order.items?.reduce((total, item) => total + (item.quantity || 0), 0) ?? 0,
      // === INICIO CAMBIO ===
      // Asignar el finalTotal al campo 'total' del objeto formateado
      total: order.totals?.finalTotal ?? 0
      // === FIN CAMBIO ===
    }));
  }, [getFilteredOrders]);

  // Retornar los estados y funciones necesarios, incluyendo los de paginación
  return {
    orders, // Las órdenes actuales (ya filtradas si se usa getFilteredOrders)
    loading: loading, // Carga inicial
    loadingMore, // Carga de páginas siguientes
    error,
    filter,
    changeFilter,
    getFilteredOrders, // Función para filtrar en frontend
    order, // Detalle de orden
    orderLoading,
    orderError,
    fetchOrderById,
    fetchNextPage, // Función para cargar la siguiente página
    hasMore, // Booleano que indica si hay más páginas
    getFormattedOrders
  };
};
