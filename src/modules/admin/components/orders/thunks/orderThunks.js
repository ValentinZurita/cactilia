import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  addOrderNote,
  getOrderStatistics
} from '../services/orderAdminService.js';
import { addMessage } from '../../../../../store/messages/messageSlice.js'
import { serializeFirestoreData } from '../utils/firestoreUtils';
import { getFunctions, httpsCallable } from 'firebase/functions'
import { callFunction } from '../utils/firebaseFunctions';

/**
 * Thunk para obtener pedidos con filtros y paginación
 */
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      // Extraer si es paginación o no
      const { append = false, ...customFilters } = params;

      // Obtener los filtros actuales del estado
      const { orders: { filters, lastDoc } } = getState();

      // Mezclar los filtros actuales con los nuevos
      const queryParams = { ...filters, ...customFilters };

      // Si es para paginación, añadir lastDoc
      const paginationParams = append && lastDoc ? { lastDoc } : {};

      console.log('Fetching orders with params:', {
        append,
        customFilters,
        queryParams,
        paginationParams
      });

      // Realizar la petición al servicio
      const result = await getOrders({
        ...queryParams,
        ...paginationParams
      });

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar pedidos');
      }

      // Importante: Devolvemos también el parámetro append para que sea accesible en el reducer
      return {
        ...result,
        // Serializar datos para evitar problemas de circularidad
        data: serializeFirestoreData(result.data),
        append // Incluir explícitamente el valor de append en el resultado
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk para obtener un pedido por su ID
 */
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue, dispatch }) => {
    try {
      if (!orderId) {
        throw new Error('ID de pedido no proporcionado');
      }

      const result = await getOrderById(orderId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar detalles del pedido');
      }

      // Serializar el resultado para evitar problemas con objetos no serializables
      return {
        ...result,
        data: serializeFirestoreData(result.data)
      };
    } catch (error) {
      dispatch(addMessage({
        type: 'error',
        text: error.message
      }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk para actualizar el estado de un pedido
 */
export const updateOrderStatusThunk = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, newStatus, adminId, notes = '' }, { rejectWithValue, dispatch }) => {
    try {
      if (!orderId || !newStatus || !adminId) {
        throw new Error('Faltan datos requeridos');
      }

      const result = await updateOrderStatus(orderId, newStatus, adminId, notes);

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar estado');
      }

      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: `Estado actualizado a: ${newStatus}`,
        autoHide: true,
        duration: 3000
      }));

      // Disparar una recarga de la lista de pedidos para actualizar contadores
      dispatch(fetchOrders());

      return result;
    } catch (error) {
      dispatch(addMessage({
        type: 'error',
        text: error.message
      }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk para añadir una nota a un pedido
 */
export const addOrderNoteThunk = createAsyncThunk(
  'orders/addOrderNote',
  async ({ orderId, noteText, adminId }, { rejectWithValue, dispatch }) => {
    try {
      if (!orderId || !noteText || !adminId) {
        throw new Error('Faltan datos requeridos');
      }

      const result = await addOrderNote(orderId, noteText, adminId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al añadir nota');
      }

      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Nota añadida correctamente',
        autoHide: true,
        duration: 3000
      }));

      return result;
    } catch (error) {
      dispatch(addMessage({
        type: 'error',
        text: error.message
      }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk para obtener estadísticas de pedidos
 */
export const fetchOrderStatistics = createAsyncThunk(
  'orders/fetchStatistics',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const result = await getOrderStatistics();

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar estadísticas');
      }

      return result;
    } catch (error) {
      dispatch(addMessage({
        type: 'error',
        text: 'Error al cargar estadísticas de pedidos'
      }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk para enviar facturas por email
 */
export const sendInvoiceEmailThunk = createAsyncThunk(
  'orders/sendInvoiceEmail',
  async ({ orderId }, { rejectWithValue, dispatch }) => {
    try {
      console.log('Preparando envío de factura para pedido:', orderId);
      
      // Usar la función auxiliar para usar Firebase real
      const result = await callFunction('sendInvoiceEmail', { orderId });
      
      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Facturas enviadas correctamente',
        autoHide: true,
        duration: 3000
      }));

      // No necesitamos recargar el pedido completo si manejamos correctamente
      // el estado en el reducer, pero por seguridad podemos actualizarlo
      dispatch(fetchOrderById(orderId));
      
      if (!result.success) {
        return rejectWithValue(result.message || 'Error al enviar el correo de factura');
      }
      
      return result;
    } catch (error) {
      console.error('Error enviando facturas:', error);

      dispatch(addMessage({
        type: 'error',
        text: error.message || 'Error al enviar facturas',
        autoHide: true,
        duration: 3000
      }));
      
      return rejectWithValue(error.message || 'Error al enviar el correo de factura');
    }
  }
);

export const fetchOrderWorkflowInfo = createAsyncThunk(
  'orders/fetchOrderWorkflowInfo',
  async (orderId, { rejectWithValue, dispatch }) => {
    try {
      // Podrías implementar un servicio específico que devuelva
      // solo los campos relacionados con el flujo de trabajo
      const result = await getOrderWorkflowInfo(orderId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar información del flujo');
      }

      // Actualizar solo los campos específicos
      dispatch(updateOrderFieldsOptimistic({
        orderId,
        fields: result.data
      }));

      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
