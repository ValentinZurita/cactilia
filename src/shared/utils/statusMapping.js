/**
 * Mapea los estados técnicos del pago a etiquetas amigables y clases de badge.
 * @param {string} status - El estado técnico del pago (ej. 'requires_capture').
 * @param {string} context - El contexto donde se mostrará ('user' o 'admin').
 * @returns {{label: string, badgeClass: string}}
 */
export const getFriendlyPaymentStatus = (status, context = 'user') => {
  const defaultLabel = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Desconocido';
  const defaultResponse = { label: defaultLabel, badgeClass: 'bg-secondary' };

  switch (status) {
    case 'requires_capture':
      return {
        label: context === 'admin' ? 'Requiere Captura' : 'Procesando Orden',
        badgeClass: 'bg-warning text-dark'
      };
    case 'pending': // Usado principalmente para OXXO antes del pago
      return { label: 'Esperando Pago', badgeClass: 'bg-info' };
    case 'succeeded':
      return { label: 'Pago Exitoso', badgeClass: 'bg-success' };
    case 'processing': // A veces Stripe pasa por este estado
       return { label: 'Procesando Pago', badgeClass: 'bg-primary' };
    case 'failed':
      return { label: 'Pago Fallido', badgeClass: 'bg-danger' };
    case 'canceled': // Nota: Firestore podría tener 'cancelled'
      return { label: 'Pago Cancelado', badgeClass: 'bg-secondary' };
    case 'requires_action': // Para 3D Secure, etc.
      return { label: context === 'admin' ? 'Requiere Acción Cliente' : 'Acción Requerida', badgeClass: 'bg-warning text-dark' };
    case 'requires_payment_method':
      return { label: context === 'admin' ? 'Falta Método Pago' : 'Error en Pago', badgeClass: 'bg-danger' };
    default:
      console.warn(`Unknown payment status: ${status}`);
      return defaultResponse;
  }
};

/**
 * Mapea los estados técnicos de la orden a etiquetas amigables y clases de badge.
 * @param {string} status - El estado técnico de la orden (ej. 'processing').
 * @param {string} context - El contexto donde se mostrará ('user' o 'admin').
 * @returns {{label: string, badgeClass: string}}
 */
export const getFriendlyOrderStatus = (status, context = 'user') => {
  const defaultLabel = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Desconocido';
  const defaultResponse = { label: defaultLabel, badgeClass: 'bg-secondary' };

  switch (status) {
    case 'pending': // Orden recién creada, pago pendiente o por capturar
      return {
        label: context === 'admin' ? 'Pendiente' : 'Orden Recibida',
        badgeClass: 'bg-info'
      };
    case 'processing': // Pago completado, en preparación
      return { label: 'Procesando Envío', badgeClass: 'bg-primary' };
    case 'shipped':
      return { label: 'Enviado', badgeClass: 'bg-info' }; // Podría ser otro color
    case 'delivered':
      return { label: 'Entregado', badgeClass: 'bg-success' };
    case 'cancelled': // O 'canceled'
      return { label: 'Cancelado', badgeClass: 'bg-secondary' };
    case 'payment_failed':
      return { label: 'Error en el Pago', badgeClass: 'bg-danger' };
    // Puedes añadir más estados personalizados si los usas
    default:
      console.warn(`Unknown order status: ${status}`);
      return defaultResponse;
  }
}; 