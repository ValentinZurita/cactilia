/**
 * orderConstants.js
 *
 * Contiene las constantes y configuraciones relacionadas con los pedidos,
 * incluyendo mapas de estado y filtros.
 */

/**
 * Mapa de estados de pedido a estados de visualización.
 * Esto ayuda a traducir el estado interno de un pedido
 * a un estado más entendible para el usuario final.
 */
export const ORDER_STATUS_MAP = {
  pending: 'processing',
  payment_failed: 'cancelled',
  processing: 'processing',
  shipped: 'delivered',
  delivered: 'delivered',
  cancelled: 'cancelled',
  completed: 'delivered'
};

/**
 * Filtros disponibles para mostrar en la interfaz.
 * Cada filtro contiene un identificador y un ícono,
 * y debe corresponder a los estados en ORDER_STATUS_MAP (salvo 'all').
 */
export const ORDER_FILTERS = [
  { id: 'all', label: 'Todos', icon: 'bi-grid-fill' },
  { id: 'processing', label: 'En proceso', icon: 'bi-clock-fill' },
  { id: 'delivered', label: 'Entregados', icon: 'bi-check-circle-fill' },
  { id: 'cancelled', label: 'Cancelados', icon: 'bi-x-circle-fill' }
];
