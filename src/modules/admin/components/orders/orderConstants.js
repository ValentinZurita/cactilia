// Garantizar consistencia de colores entre componentes
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'warning',
    icon: 'hourglass-split'
  },
  processing: {
    label: 'Procesando',
    color: 'primary',
    icon: 'gear'
  },
  shipped: {
    label: 'Enviado',
    color: 'info', // Asegurando que sea siempre 'info'
    icon: 'truck'
  },
  delivered: {
    label: 'Entregado',
    color: 'success',
    icon: 'check-circle'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'danger',
    icon: 'x-circle'
  }
};

// Usar los mismos colores definidos arriba para mantener consistencia
export const ORDER_TRANSITIONS = {
  pending: [
    { value: 'processing', label: 'Procesar pedido', icon: 'gear' },
    { value: 'cancelled', label: 'Cancelar pedido', icon: 'x-circle', isDanger: true }
  ],
  processing: [
    { value: 'shipped', label: 'Marcar como enviado', icon: 'truck' },
    { value: 'cancelled', label: 'Cancelar pedido', icon: 'x-circle', isDanger: true }
  ],
  shipped: [
    { value: 'delivered', label: 'Marcar como entregado', icon: 'check-circle' },
    { value: 'cancelled', label: 'Cancelar pedido', icon: 'x-circle', isDanger: true }
  ],
  delivered: [],
  cancelled: []
};