import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStatistics,
  addOrderNote
} from './orderAdminService.js';
import { addMessage } from '../../../../store/messages/messageSlice.js'

/**
 * Hook personalizado para la gestión de pedidos en el panel de administración
 *
 * @param {Object} initialFilters - Filtros iniciales para la carga de pedidos
 * @returns {Object} Métodos y estado para gestionar pedidos
 */
export const useAdminOrders = (initialFilters = {}) => {
  const dispatch = useDispatch();
  const { uid } = useSelector(state => state.auth);

  // Estados para la lista de pedidos
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: null,
    endDate: null,
    searchTerm: '',
    pageSize: 25,
    advancedFilters: {},
    ...initialFilters
  });
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Estado para pedido seleccionado
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);

  // Estado para estadísticas
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Estado para procesamiento de acciones
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Cargar pedidos según los filtros actuales
   */
  /**
   * Cargar pedidos según los filtros actuales
   */
  const loadOrders = useCallback(async (resetPagination = true) => {
    setLoading(true);
    setError(null);

    try {
      // Si resetea paginación, se limpia el lastDoc
      const paginationParam = resetPagination ? {} : { lastDoc };

      // Procesar filtros avanzados si existen
      let queryParams = { ...filters };

      if (filters.advancedFilters && Object.keys(filters.advancedFilters).length > 0) {
        const { dateFrom, dateTo, minAmount, maxAmount, productName } = filters.advancedFilters;

        // Sobrescribir las fechas de inicio/fin si están definidas en los filtros avanzados
        if (dateFrom) queryParams.startDate = new Date(dateFrom);
        if (dateTo) queryParams.endDate = new Date(dateTo);

        // Añadir filtros de monto y producto
        if (minAmount !== undefined && minAmount !== null) queryParams.minAmount = Number(minAmount);
        if (maxAmount !== undefined && maxAmount !== null) queryParams.maxAmount = Number(maxAmount);
        if (productName) queryParams.productName = productName;
      }

      const result = await getOrders({
        ...queryParams,
        ...paginationParam
      });

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar pedidos');
      }

      // Si es una nueva carga, reemplaza; si es paginación, añade
      if (resetPagination) {
        setOrders(result.data);
      } else {
        setOrders(prev => [...prev, ...result.data]);
      }

      // Actualizar estado de paginación
      setLastDoc(result.lastDoc);
      setHasMore(result.data.length === filters.pageSize);

    } catch (err) {
      console.error('Error en useAdminOrders.loadOrders:', err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: err.message
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, lastDoc, dispatch]);

  /**
   * Cargar más pedidos (paginación)
   */
  const loadMoreOrders = useCallback(() => {
    if (hasMore && !loading) {
      loadOrders(false);
    }
  }, [hasMore, loading, loadOrders]);

  /**
   * Actualizar filtros y recargar
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Obtener un pedido por su ID
   */
  const fetchOrderById = useCallback(async (orderId) => {
    if (!orderId) return;

    setSelectedOrderLoading(true);
    setError(null);

    try {
      const result = await getOrderById(orderId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar detalles del pedido');
      }

      setSelectedOrder(result.data);
      return result.data;

    } catch (err) {
      console.error(`Error en useAdminOrders.fetchOrderById:`, err);
      setError(err.message);
      dispatch(addMessage({
        type: 'error',
        text: err.message
      }));
      return null;
    } finally {
      setSelectedOrderLoading(false);
    }
  }, [dispatch]);

  /**
   * Cambiar el estado de un pedido
   */
  const changeOrderStatus = useCallback(async (orderId, newStatus, notes = '') => {
    console.log('useAdminOrders: Iniciando cambio de estado', { orderId, newStatus, notes, uid });

    if (!orderId || !newStatus || !uid) {
      dispatch(addMessage({
        type: 'error',
        text: 'Faltan datos para actualizar el estado'
      }));
      return { ok: false };
    }

    setIsProcessing(true);

    try {
      const result = await updateOrderStatus(orderId, newStatus, uid, notes);

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar estado');
      }

      // Actualizar la vista si el pedido está seleccionado
      if (selectedOrder && selectedOrder.id === orderId) {
        await fetchOrderById(orderId);
      }

      // Actualizar la lista de pedidos
      loadOrders();

      dispatch(addMessage({
        type: 'success',
        text: `Estado actualizado a: ${newStatus}`
      }));

      return { ok: true };

    } catch (err) {
      console.error('Error en useAdminOrders.changeOrderStatus:', err);
      dispatch(addMessage({
        type: 'error',
        text: err.message
      }));
      return { ok: false, error: err.message };
    } finally {
      setIsProcessing(false);
    }
  }, [uid, selectedOrder, fetchOrderById, loadOrders, dispatch]);

  /**
   * Añadir una nota a un pedido
   */
  const addNote = useCallback(async (orderId, noteText) => {
    if (!orderId || !noteText || !uid) {
      dispatch(addMessage({
        type: 'error',
        text: 'Faltan datos para añadir la nota'
      }));
      return { ok: false };
    }

    setIsProcessing(true);

    try {
      const result = await addOrderNote(orderId, noteText, uid);

      if (!result.ok) {
        throw new Error(result.error || 'Error al añadir la nota');
      }

      // Actualizar la vista si el pedido está seleccionado
      if (selectedOrder && selectedOrder.id === orderId) {
        await fetchOrderById(orderId);
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Nota añadida correctamente'
      }));

      return { ok: true };

    } catch (err) {
      console.error('Error en useAdminOrders.addNote:', err);
      dispatch(addMessage({
        type: 'error',
        text: err.message
      }));
      return { ok: false, error: err.message };
    } finally {
      setIsProcessing(false);
    }
  }, [uid, selectedOrder, fetchOrderById, dispatch]);

  /**
   * Cargar estadísticas de pedidos
   */
  const loadStatistics = useCallback(async () => {
    setStatsLoading(true);

    try {
      const result = await getOrderStatistics();

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar estadísticas');
      }

      setStatistics(result.data);

    } catch (err) {
      console.error('Error en useAdminOrders.loadStatistics:', err);
      dispatch(addMessage({
        type: 'error',
        text: 'Error al cargar estadísticas de pedidos'
      }));
    } finally {
      setStatsLoading(false);
    }
  }, [dispatch]);

  /**
   * Formatear fecha de pedido para mostrar
   */
  const formatOrderDate = useCallback((timestamp) => {
    if (!timestamp) return 'Fecha no disponible';

    try {
      // Determinar el tipo de timestamp y convertirlo a Date
      let date;
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Es un Timestamp de Firestore
        date = timestamp.toDate();
      } else if (timestamp.seconds && timestamp.nanoseconds) {
        // Es un objeto tipo Timestamp pero sin método toDate
        date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      } else {
        // Intentar convertir desde string o número
        date = new Date(timestamp);
      }

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', timestamp);
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formateando fecha:', err, timestamp);
      return 'Fecha no disponible';
    }
  }, []);

  /**
   * Formatear precio con formato de moneda
   */
  const formatPrice = useCallback((amount) => {
    if (amount === undefined || amount === null) return '$0.00';

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }, []);

  // Cargar pedidos al inicializar o cambiar filtros
  useEffect(() => {
    loadOrders(true);
  }, [filters]);

  // Retornar todas las funciones y estados necesarios
  return {
    // Estados
    orders,
    loading,
    error,
    filters,
    hasMore,
    selectedOrder,
    selectedOrderLoading,
    statistics,
    statsLoading,
    isProcessing,

    // Funciones para pedidos
    loadOrders,
    loadMoreOrders,
    updateFilters,
    fetchOrderById,
    changeOrderStatus,
    addNote,

    // Estadísticas
    loadStatistics,

    // Utilidades
    formatOrderDate,
    formatPrice
  };
};