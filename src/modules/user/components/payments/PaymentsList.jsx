import { PaymentItem } from './PaymentItem';
import { EmptyState } from '../shared/index.js'

/**
 * Componente que muestra la lista de métodos de pago
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.payments - Lista de métodos de pago
 * @param {Function} props.onSetDefault - Función para establecer como predeterminado
 * @param {Function} props.onDelete - Función para eliminar
 * @param {Function} props.onEdit - Función para editar
 * @param {boolean} props.loading - Indica si está cargando
 * @returns {JSX.Element}
 */
export const PaymentsList = ({ payments, onSetDefault, onDelete, onEdit, loading = false }) => {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No hay métodos de pago"
        message="Aún no has agregado ningún método de pago"
      />
    );
  }

  return (
    <ul className="payment-list">
      {payments.map(payment => (
        <PaymentItem
          key={payment.id}
          payment={payment}
          onSetDefault={onSetDefault}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};