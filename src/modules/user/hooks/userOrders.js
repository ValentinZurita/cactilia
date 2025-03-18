import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { addMessage } from '../../../store/messages/messageSlice';
import { getOrderById, getUserOrders } from '../../shop/services/orderService.js'

/**
 * Hook personalizado para gestionar órdenes de usuario
 * Proporciona métodos para obtener órdenes y filtrarlas
 *
 * @returns {Object} - Estados y funciones para gestionar órdenes
 */
export const useOrders = () => {
  const dispatch = useDispatch();
  const { uid, status } = useSelector(state => state.auth);

  // Estado para órdenes
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Obtener órdenes del usuario
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

  // Cargar órdenes al montar componente o cambiar usuario
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Obtener una orden específica por ID
  const fetchOrderById = useCallback(async (orderId) => {
    if (!orderId) return;

    setOrderLoading(true);
    setOrderError(null);

    try {
      const result = await getOrderById(orderId);

      if (result.ok) {
        setOrder(result.data);
      } else {
        setOrderError(result.error);
        dispatch(addMessage({
          type: 'error',
          text: 'Error al cargar detalles del pedido',
          autoHide: true
        }));
      }
    } catch (err) {
      console.error('Error obteniendo detalle de orden:', err);
      setOrderError(err.message || 'Error al cargar detalles del pedido');
      dispatch(addMessage({
        type: 'error',
        text: 'Error al cargar detalles del pedido',
        autoHide: true
      }));
    } finally {
      setOrderLoading(false);
    }
  }, [dispatch]);

  // Función para cambiar el filtro actual
  const changeFilter = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  // Filtrar órdenes según el filtro seleccionado
  const filteredOrders = useCallback(() => {
    if (filter === 'all') return orders;

    return orders.filter(order => order.status === filter);
  }, [filter, orders]);

  // Mapear estados internos a estados más amigables para mostrar
  const mapOrderStatusToDisplay = useCallback((status) => {
    const statusMap = {
      'pending': 'processing',
      'payment_failed': 'cancelled',
      'processing': 'processing',
      'shipped': 'delivered',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'completed': 'delivered'
    };

    return statusMap[status] || status;
  }, []);

  // Formatear fecha para mostrar
  const formatOrderDate = useCallback((timestamp) => {
    if (!timestamp) return 'Fecha no disponible';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Formatear órdenes para mostrar en la interfaz
  const formattedOrders = useCallback(() => {
    return filteredOrders().map(order => ({
      id: order.id,
      date: formatOrderDate(order.createdAt),
      status: mapOrderStatusToDisplay(order.status),
      items: order.items.reduce((total, item) => total + item.quantity, 0),
      total: order.totals.total
    }));
  }, [filteredOrders, formatOrderDate, mapOrderStatusToDisplay]);

  return {
    // Estados generales
    loading,
    error,
    orders,
    filter,
    filteredOrders: formattedOrders(),

    // Estados para orden específica
    order,
    orderLoading,
    orderError,

    // Funciones
    fetchOrders,
    fetchOrderById,
    changeFilter,
    mapOrderStatusToDisplay,
    formatOrderDate
  };
};