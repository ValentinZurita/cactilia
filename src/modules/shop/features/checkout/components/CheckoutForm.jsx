// src/modules/shop/features/checkout/components/CheckoutForm.jsx
import React from 'react';
import { useStockValidation } from '../hooks/useStockValidation';
import { CheckoutSection } from './sections/CheckoutSection';
import { StockValidationBanner } from './StockValidationBanner';
import { ErrorSummary } from './ErrorSummary';
import { AddressSection } from './sections/AddressSection';
import { PaymentSection } from './sections/PaymentSection';
import { BillingSection } from './sections/BillingSection';
import { NotesSection } from './sections/NotesSection';
import { StockStatusSummary } from './StockStatusSummary';

/**
 * Componente que muestra el formulario completo de checkout
 *
 * Implementa un enfoque modular con componentes especializados
 * para cada sección del proceso de checkout
 *
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Formulario completo de checkout
 */
export const CheckoutForm = ({
                               // Direcciones
                               addresses,
                               selectedAddressId,
                               selectedAddressType,
                               loadingAddresses,
                               handleAddressChange,
                               handleNewAddressSelect,
                               handleNewAddressDataChange,

                               // Métodos de pago
                               paymentMethods,
                               selectedPaymentId,
                               selectedPaymentType,
                               loadingPayments,
                               handlePaymentChange,
                               handleNewCardSelect,
                               handleOxxoSelect,
                               handleNewCardDataChange,

                               // Facturación
                               requiresInvoice,
                               fiscalData,
                               handleInvoiceChange,
                               handleFiscalDataChange,

                               // Notas
                               orderNotes,
                               handleNotesChange,

                               // Estado y errores
                               error,
                               setError,
                               cartItems = []
                             }) => {
  // Hook para validación de stock
  const {
    isValidatingStock,
    stockValidationResult,
    validationError,
    setValidationError
  } = useStockValidation(cartItems);

  return (
    <div className="col-lg-8">
      {/* Banner de validación de stock */}
      <StockValidationBanner isValidating={isValidatingStock} />

      {/* Mostrar errores */}
      <ErrorSummary
        error={error}
        validationError={validationError}
        onClearError={() => setError(null)}
        onClearValidationError={() => setValidationError(null)}
      />

      {/* Sección: Dirección de Envío */}
      <AddressSection
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        selectedAddressType={selectedAddressType}
        loading={loadingAddresses}
        onAddressSelect={handleAddressChange}
        onNewAddressSelect={handleNewAddressSelect}
        onNewAddressDataChange={handleNewAddressDataChange}
      />

      {/* Sección: Método de Pago */}
      <PaymentSection
        paymentMethods={paymentMethods}
        selectedPaymentId={selectedPaymentId}
        selectedPaymentType={selectedPaymentType}
        loading={loadingPayments}
        onPaymentSelect={handlePaymentChange}
        onNewCardSelect={handleNewCardSelect}
        onOxxoSelect={handleOxxoSelect}
        onNewCardDataChange={handleNewCardDataChange}
      />

      {/* Sección: Información Fiscal */}
      <BillingSection
        requiresInvoice={requiresInvoice}
        onRequiresInvoiceChange={handleInvoiceChange}
        fiscalData={fiscalData}
        onFiscalDataChange={handleFiscalDataChange}
      />

      {/* Sección: Notas adicionales */}
      <NotesSection
        notes={orderNotes}
        onNotesChange={handleNotesChange}
      />

      {/* Información sobre validación de stock */}
      <StockStatusSummary
        validationResult={stockValidationResult}
        isValidating={isValidatingStock}
      />
    </div>
  );
};