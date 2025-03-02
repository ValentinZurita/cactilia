import { SectionTitle } from '../components/shared/index.js';
import { PaymentsList } from '../components/payments/PaymentsList';
import { AddPaymentButton } from '../components/payments/AddPaymentButton';
import { SecurityNote } from '../components/payments/SecurityNote';
import { usePayments } from '../hooks/usePayments';
import '../styles/profilePayments.css';

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
      <AddPaymentButton onClick={addPayment} />

      {/* Nota de seguridad */}
      <SecurityNote />
    </div>
  );
};