/**
 * Utilidades para manejo de estados
 */

/**
 * Mapeo de estados internos a estados de visualización
 */
export const ORDER_STATUS_MAP = {
  'pending': 'processing',
  'payment_failed': 'cancelled',
  'processing': 'processing',
  'shipped': 'shipped',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'completed': 'delivered'
};

/**
 * Mapeo de estados a textos en español
 */
export const ORDER_STATUS_TEXT = {
  'processing': 'En procesamiento',
  'shipped': 'Enviado',
  'delivered': 'Entregado',
  'cancelled': 'Cancelado',
  'pending': 'Pendiente'
};

/**
 * Mapeo de estados a clases de estilos
 */
export const ORDER_STATUS_CLASSES = {
  'processing': 'warning',
  'shipped': 'info',
  'delivered': 'success',
  'cancelled': 'danger',
  'pending': 'secondary'
};

/**
 * Mapeo de estados a iconos
 */
export const ORDER_STATUS_ICONS = {
  'processing': 'bi-clock-fill',
  'shipped': 'bi-truck',
  'delivered': 'bi-check-circle-fill',
  'cancelled': 'bi-x-circle-fill',
  'pending': 'bi-hourglass-split'
};

/**
 * Convierte el estado interno a un estado para mostrar
 *
 * @param {string} status - Estado interno
 * @returns {string} - Estado para mostrar
 */
export const mapOrderStatus = (status) => {
  return ORDER_STATUS_MAP[status] || status;
};

/**
 * Obtiene el texto para un estado
 *
 * @param {string} status - Estado
 * @returns {string} - Texto del estado
 */
export const getStatusText = (status) => {
  const mappedStatus = mapOrderStatus(status);
  return ORDER_STATUS_TEXT[mappedStatus] || mappedStatus;
};

/**
 * Obtiene la clase de estilo para un estado
 *
 * @param {string} status - Estado
 * @returns {string} - Clase de estilo
 */
export const getStatusClass = (status) => {
  const mappedStatus = mapOrderStatus(status);
  return ORDER_STATUS_CLASSES[mappedStatus] || 'secondary';
};

/**
 * Obtiene el icono para un estado
 *
 * @param {string} status - Estado
 * @returns {string} - Clase del icono
 */
export const getStatusIcon = (status) => {
  const mappedStatus = mapOrderStatus(status);
  return ORDER_STATUS_ICONS[mappedStatus] || 'bi-circle-fill';
};

/**
 * Determina si un estado es final (no cambiará más)
 *
 * @param {string} status - Estado
 * @returns {boolean} - Si el estado es final
 */
export const isFinalStatus = (status) => {
  const mappedStatus = mapOrderStatus(status);
  return mappedStatus === 'delivered' || mappedStatus === 'cancelled';
};