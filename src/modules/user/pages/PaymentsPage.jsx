import { SectionTitle, AddItemButton } from '../components/shared/index.js';
import { usePayments } from '../hooks/usePayments.js';
import '../styles/profilePayments.css';
import '../styles/sharedComponents.css';
import { PaymentsList, SecurityNote } from '../components/payments/index.js'

/**
 * PaymentsPage - Página rediseñada de métodos de pago
 * Versión modular y fácil de leer
 */
export const PaymentsPage = () => {
  // Obtener métodos y estado del hook personalizado
  const {
    paymentMethods,
    setDefaultPayment,
    deletePayment,
    editPayment,
    addPayment
  } = usePayments();

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Métodos de Pago" />

      {/* Lista de métodos de pago */}
      <PaymentsList
        payments={paymentMethods}
        onSetDefault={setDefaultPayment}
        onDelete={deletePayment}
        onEdit={editPayment}
      />

      {/* Botón para agregar método de pago */}
      <AddItemButton
        onClick={addPayment}
        label="Agregar método de pago"
        icon="plus"
      />

      {/* Nota de seguridad */}
      <SecurityNote />
    </div>
  );
};