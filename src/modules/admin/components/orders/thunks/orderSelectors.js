/**
 * Selectores para obtener datos del slice de pedidos
 * Permite centralizar la lógica para obtener información
 */

// Selector para obtener la lista de pedidos
export const selectOrders = (state) => state.orders.orders;

// Selector para verificar si hay más pedidos para cargar
export const selectHasMoreOrders = (state) => state.orders.hasMore;

// Selector para obtener filtros actuales
export const selectOrderFilters = (state) => state.orders.filters;

// Selector para obtener el pedido seleccionado
export const selectSelectedOrder = (state) => state.orders.selectedOrder;

// Selector para obtener la pestaña activa - NUEVO
export const selectActiveTab = (state) => state.orders.activeTab;

// Selector para obtener las estadísticas
export const selectOrderStatistics = (state) => state.orders.statistics;

// Selectores para estados de carga
export const selectOrdersLoading = (state) => state.orders.loading.orders;
export const selectOrderDetailsLoading = (state) => state.orders.loading.orderDetails;
export const selectStatisticsLoading = (state) => state.orders.loading.statistics;
export const selectActionProcessing = (state) => state.orders.loading.action;

// Selectores para estados específicos de procesamiento - NUEVO
export const selectSendingInvoice = (state) => state.orders.processingActions.sendingInvoice;
export const selectChangingStatus = (state) => state.orders.processingActions.changingStatus;
export const selectAddingNote = (state) => state.orders.processingActions.addingNote;

// Selectores para errores
export const selectOrdersError = (state) => state.orders.errors.orders;
export const selectOrderDetailsError = (state) => state.orders.errors.orderDetails;
export const selectStatisticsError = (state) => state.orders.errors.statistics;
export const selectActionError = (state) => state.orders.errors.action;

// Selectores combinados
export const selectStatisticsWithCounts = (state) => {
  const statistics = state.orders.statistics;

  if (!statistics) return null;

  return {
    ...statistics,
    counts: {
      all: statistics.totalOrders,
      pending: statistics.pendingOrders,
      processing: statistics.processingOrders,
      shipped: statistics.shippedOrders,
      delivered: statistics.deliveredOrders,
      cancelled: statistics.cancelledOrders
    }
  };
};