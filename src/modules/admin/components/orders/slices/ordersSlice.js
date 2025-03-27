import { createSlice } from '@reduxjs/toolkit';
import {
  fetchOrders,
  fetchOrderById,
  updateOrderStatusThunk,
  addOrderNoteThunk,
  fetchOrderStatistics
} from '../thunks/orderThunks.js';

// Importar la función de serialización directamente desde donde fue definida
import { serializeFirestoreData } from '../utils/firestoreUtils.js';

const initialState = {
  // Lista de pedidos
  orders: [],
  hasMore: false,
  lastDoc: null,

  // Filtros aplicados
  filters: {
    status: 'all',
    startDate: null,
    endDate: null,
    searchTerm: '',
    pageSize: 25,
    advancedFilters: {}
  },

  // Pedido seleccionado para detalles
  selectedOrder: null,

  // Estadísticas
  statistics: null,

  // Estados de carga y errores
  loading: {
    orders: false,
    orderDetails: false,
    statistics: false,
    action: false
  },
  errors: {
    orders: null,
    orderDetails: null,
    statistics: null,
    action: null
  }
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Actualizar filtros de búsqueda
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
      // Reiniciar paginación cuando cambian los filtros
      state.lastDoc = null;
    },

    // Limpiar pedido seleccionado (por ejemplo, al volver a la lista)
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },

    // Limpiar errores
    clearErrors: (state, action) => {
      if (action.payload && action.payload.type) {
        state.errors[action.payload.type] = null;
      } else {
        // Limpiar todos los errores si no se especifica tipo
        state.errors = {
          orders: null,
          orderDetails: null,
          statistics: null,
          action: null
        };
      }
    }
  },
  extraReducers: (builder) => {
    // Gestionar estados de fetchOrders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading.orders = true;
        state.errors.orders = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading.orders = false;

        // Verificar si debemos añadir o reemplazar los pedidos
        const shouldAppend = action.payload.append === true;

        // Si es primera carga o cambio de filtros, reemplazamos los pedidos
        if (!shouldAppend) {
          state.orders = action.payload.data || [];
        } else {
          // Sino, añadimos a los existentes (para paginación)
          state.orders = [...state.orders, ...(action.payload.data || [])];
        }

        state.hasMore = action.payload.hasMore;

        // Guardamos solo el ID del lastDoc para evitar problemas de serialización
        state.lastDoc = action.payload.lastDoc;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.errors.orders = action.error.message;
      })

      // Gestionar estados de fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.loading.orderDetails = true;
        state.errors.orderDetails = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading.orderDetails = false;
        // Guardar el pedido seleccionado ya serializado
        state.selectedOrder = action.payload.data;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading.orderDetails = false;
        state.errors.orderDetails = action.error.message;
      })

      // Gestionar estados de updateOrderStatusThunk
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.loading.action = true;
        state.errors.action = null;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.loading.action = false;

        // Actualizar el pedido seleccionado si coincide el ID
        if (state.selectedOrder && state.selectedOrder.id === action.meta.arg.orderId) {
          // Crear una actualización de estado de forma segura
          const statusChange = {
            from: state.selectedOrder.status,
            to: action.meta.arg.newStatus,
            changedAt: new Date().toISOString(), // Guardar como string
            changedBy: action.meta.arg.adminId,
            notes: action.meta.arg.notes || ''
          };

          // Actualizar de forma segura
          state.selectedOrder = {
            ...state.selectedOrder,
            status: action.meta.arg.newStatus,
            statusHistory: [
              ...(state.selectedOrder.statusHistory || []),
              statusChange
            ]
          };
        }

        // Actualizar el pedido en la lista si existe
        state.orders = state.orders.map(order =>
          order.id === action.meta.arg.orderId
            ? { ...order, status: action.meta.arg.newStatus }
            : order
        );
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.loading.action = false;
        state.errors.action = action.error.message;
      })

      // Gestionar estados de addOrderNoteThunk
      .addCase(addOrderNoteThunk.pending, (state) => {
        state.loading.action = true;
        state.errors.action = null;
      })
      .addCase(addOrderNoteThunk.fulfilled, (state, action) => {
        state.loading.action = false;

        // Actualizar el pedido seleccionado si coincide el ID
        if (state.selectedOrder && state.selectedOrder.id === action.meta.arg.orderId) {
          const newNote = {
            text: action.meta.arg.noteText,
            createdAt: new Date().toISOString(), // Guardar como string ISO
            createdBy: action.meta.arg.adminId
          };

          state.selectedOrder = {
            ...state.selectedOrder,
            adminNotes: [...(state.selectedOrder.adminNotes || []), newNote]
          };
        }
      })
      .addCase(addOrderNoteThunk.rejected, (state, action) => {
        state.loading.action = false;
        state.errors.action = action.error.message;
      })

      // Gestionar estados de fetchOrderStatistics
      .addCase(fetchOrderStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.errors.statistics = null;
      })
      .addCase(fetchOrderStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        // Si serializeFirestoreData no está disponible, usar el dato directamente
        // De lo contrario, serializar el resultado
        state.statistics = action.payload.data
          ? (typeof serializeFirestoreData === 'function'
            ? serializeFirestoreData(action.payload.data)
            : action.payload.data)
          : null;
      })
      .addCase(fetchOrderStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.errors.statistics = action.error.message;
      });
  }
});

// Exportar acciones
export const { updateFilters, clearSelectedOrder, clearErrors } = ordersSlice.actions;

// Exportar el reducer
export default ordersSlice.reducer;