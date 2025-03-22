/**
 * useOrders.js
 *
 * Hook personalizado para la gestión de órdenes de usuario.
 * Proporciona métodos para obtener, filtrar y formatear la información de las órdenes.
 * Incluye manejo de errores y estados de carga.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';
import { addMessage } from '../../../store/messages/messageSlice';
import { getOrderById, getUserOrders } from '../../shop/services/orderService.js';

/**
 * Mapa de estados de pedido a estados de visualización.
 * Esto ayuda a traducir el estado interno de un pedido a un estado
 * más entendible para el usuario final.
 */
const ORDER_STATUS_MAP = {
  'pending': 'processing',
  'payment_failed': 'cancelled',
  'processing': 'processing',
  'shipped': 'delivered',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'completed': 'delivered'
};

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
    // Manejar diferentes formatos de timestamp
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
  // Acceso a redux
  const dispatch = useDispatch();
  const { uid, status } = useSelector(state => state.auth);

  // Estados para el listado de órdenes
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtrar órdenes
  const [filter, setFilter] = useState('all');

  // Estados para detalle de una orden específica
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  /**
   * Cambia el filtro de estado de las órdenes (all, processing, delivered, cancelled, etc.).
   *
   * @param {string} newFilter - Nuevo filtro seleccionado.
   */
  const changeFilter = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  /**
   * Retorna la lista de órdenes, filtradas según el estado (filter).
   *
   * @returns {Array} - Lista de órdenes filtradas.
   */
  const getFilteredOrders = useCallback(() => {
    if (filter === 'all') return orders;

    return orders.filter((order) => {
      // Mapear los estados internos a estados de visualización
      const displayStatus = mapOrderStatusToDisplay(order.status);
      return displayStatus === filter;
    });
  }, [filter, orders]);

  /**
   * Realiza la consulta para obtener todas las órdenes del usuario actual.
   * Maneja los mensajes de error y actualiza los estados de carga.
   */
  const fetchOrders = useCallback(async () => {
    if (status !== 'authenticated' || !uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUserOrders(uid);

      if (result.ok) {
        setOrders(result.data);
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
      setLoading(false);
    }
  }, [uid, status, dispatch]);

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
      console.log('Cargando detalles del pedido:', orderId);

      // Obtener directamente de Firestore
      const orderRef = doc(FirebaseDB, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        console.error('Documento de pedido no encontrado');
        setOrderError('No encontramos el pedido solicitado');
        setOrder(null);
        return;
      }

      // Construir objeto con id e información del documento
      const orderData = {
        id: orderSnap.id,
        ...orderSnap.data()
      };

      console.log('Datos del pedido cargados:', orderData);
      setOrder(orderData);
    } catch (err) {
      console.error('Error obteniendo detalle de orden:', err);
      setOrderError(err.message || 'Error al cargar detalles del pedido');
      setOrder(null);
    } finally {
      setOrderLoading(false);
    }
  }, []);

  /**
   * Cargar las órdenes al montar el componente o cuando cambie el usuario.
   */
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Devuelve la lista de órdenes con campos ya formateados (fecha, estado, etc.).
   * Esto facilita la presentación en la interfaz de usuario.
   *
   * @returns {Array} - Lista de órdenes con campos formateados.
   */
  const getFormattedOrders = useCallback(() => {
    return getFilteredOrders().map((order) => ({
      id: order.id,
      date: formatOrderDate(order.createdAt),
      status: mapOrderStatusToDisplay(order.status),
      items: order.items.reduce((total, item) => total + item.quantity, 0),
      total: order.totals.total
    }));
  }, [getFilteredOrders]);

  // Retorno de estados y métodos que se usarán en los componentes
  return {
    // Estados generales
    loading,
    error,
    orders,
    filter,

    // Estados para la orden específica
    order,
    orderLoading,
    orderError,

    // Funciones
    fetchOrders,
    fetchOrderById,
    changeFilter,
    mapOrderStatusToDisplay,
    formatOrderDate,

    // Órdenes filtradas y formateadas
    filteredOrders: getFormattedOrders()
  };
};
