const formatDate = (timestamp) => {
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
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Mapa de estados de orden a estados de visualización
 */
export const ORDER_STATUS_MAP = {
  'pending': 'processing',
  'payment_failed': 'cancelled',
  'processing': 'processing',
  'shipped': 'delivered',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'completed': 'delivered'
};

/**
 * Convierte el estado interno de la orden a un estado para mostrar al usuario
 * @param {string} status - Estado interno de la orden
 * @returns {string} - Estado para mostrar
 */
export const mapOrderStatusToDisplay = (status) => {
  return ORDER_STATUS_MAP[status] || status;
};

/**
 * Obtiene la clase CSS para la badge de estado
 * @param {string} status - Estado de la orden
 * @returns {string} - Clase CSS para el color del badge
 */
export const getStatusBadgeClass = (status) => {
  const displayStatus = mapOrderStatusToDisplay(status);
  const statusClasses = {
    'delivered': 'success',
    'processing': 'warning',
    'cancelled': 'danger'
  };

  return statusClasses[displayStatus] || 'info';
};

/**
 * Obtiene el texto para mostrar el estado
 * @param {string} status - Estado de la orden
 * @returns {string} - Texto traducido del estado
 */
export const getStatusText = (status) => {
  const displayStatus = mapOrderStatusToDisplay(status);

  const translations = {
    'delivered': 'Entregado',
    'processing': 'En proceso',
    'cancelled': 'Cancelado'
  };

  return translations[displayStatus] || status;
};

/**
 * Obtiene el icono de Bootstrap para el estado
 * @param {string} status - Estado de la orden
 * @returns {string} - Clase del icono de Bootstrap
 */
export const getStatusIconClass = (status) => {
  const displayStatus = mapOrderStatusToDisplay(status);

  const icons = {
    'delivered': 'bi-check-circle-fill',
    'processing': 'bi-clock-fill',
    'cancelled': 'bi-x-circle-fill'
  };

  return icons[displayStatus] || 'bi-circle-fill';
};

/**
 * Obtiene el elemento JSX del icono para el estado
 * @param {string} status - Estado de la orden
 * @returns {JSX.Element} - Elemento del icono
 */
export const getStatusIcon = (status) => {
  const iconClass = getStatusIconClass(status);
  return <i className={`${iconClass} me-1`}></i>;
};

/**
 * Determina si un estado es final (no cambiará más)
 * @param {string} status - Estado de la orden
 * @returns {boolean} - true si el estado es final
 */
export const isFinalStatus = (status) => {
  const displayStatus = mapOrderStatusToDisplay(status);
  return displayStatus === 'delivered' || displayStatus === 'cancelled';
};

/**
 * Obtiene el siguiente estado posible en el flujo normal
 * @param {string} currentStatus - Estado actual
 * @returns {string|null} - Siguiente estado o null si es estado final
 */
export const getNextStatus = (currentStatus) => {
  const statusFlow = {
    'pending': 'processing',
    'processing': 'shipped',
    'shipped': 'delivered'
  };

  return statusFlow[currentStatus] || null;
};

/**
 * Verifica si el estado actual puede cambiar al estado deseado
 * @param {string} currentStatus - Estado actual
 * @param {string} targetStatus - Estado objetivo
 * @returns {boolean} - true si el cambio es válido
 */
export const isValidStatusTransition = (currentStatus, targetStatus) => {
  // Estados finales no pueden cambiar
  if (isFinalStatus(currentStatus)) {
    return false;
  }

  // No se puede retroceder en el flujo
  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const targetIndex = statusOrder.indexOf(targetStatus);

  // Cancelado es un caso especial que siempre se puede establecer
  if (targetStatus === 'cancelled') {
    return true;
  }

  // Solo se puede avanzar al siguiente estado (no saltar estados)
  return targetIndex === currentIndex + 1;
};