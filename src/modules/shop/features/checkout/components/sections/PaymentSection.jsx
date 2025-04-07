import { CheckoutSection } from './CheckoutSection';
import { LoadingSpinner } from '../../../../components/ui/index.js'
import { PaymentMethodSelector } from '../payment/index.js'


/**
 * Sección para selección de método de pago
 *
 * @param {Object} props - Props del componente
 * @param {Array} props.paymentMethods - Lista de métodos de pago disponibles
 * @param {string} props.selectedPaymentId - ID del método de pago seleccionado
 * @param {string} props.selectedPaymentType - Tipo de pago seleccionado
 * @param {boolean} props.loading - Si está cargando los métodos de pago
 * @param {Function} props.onPaymentSelect - Función para seleccionar método de pago
 * @param {Function} props.onNewCardSelect - Función para seleccionar nueva tarjeta
 * @param {Function} props.onOxxoSelect - Función para seleccionar OXXO
 * @param {Function} props.onNewCardDataChange - Función para actualizar datos de nueva tarjeta
 * @param {Object} props.fiscalData - Datos fiscales
 * @returns {JSX.Element} Sección de selección de método de pago
 */
export const PaymentSection = ({
                                 paymentMethods,
                                 selectedPaymentId,
                                 selectedPaymentType,
                                 loading,
                                 onPaymentSelect,
                                 onNewCardSelect,
                                 onOxxoSelect,
                                 onNewCardDataChange,
                                 fiscalData
                               }) => {
  return (
    <CheckoutSection title="Método de Pago" stepNumber={2}>
      {loading ? (
        <LoadingSpinner text="Cargando métodos de pago..." />
      ) : (
        <PaymentMethodSelector
          paymentMethods={paymentMethods}
          selectedPaymentId={selectedPaymentId}
          selectedPaymentType={selectedPaymentType}
          onPaymentSelect={onPaymentSelect}
          onNewCardSelect={onNewCardSelect}
          onOxxoSelect={onOxxoSelect}
          onNewCardDataChange={onNewCardDataChange}
          loading={loading}
        />
      )}
    </CheckoutSection>
  );
};