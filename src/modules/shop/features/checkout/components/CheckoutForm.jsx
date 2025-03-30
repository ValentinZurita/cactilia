import React from 'react';
import { CheckoutSection } from './CheckoutSection';
import { AddressSelector } from './address/index.js';
import { PaymentMethodSelector } from './payment/index.js';
import { BillingInfoForm } from './billing/index.js';
import { LoadingSpinner } from '../../../components/ui/index.js'

/**
 * Componente que muestra el formulario completo de checkout
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element}
 */
export const CheckoutForm = ({
                               // Datos de dirección
                               addresses,
                               selectedAddressId,
                               selectedAddressType,
                               loadingAddresses,
                               handleAddressChange,
                               handleNewAddressSelect,
                               handleNewAddressDataChange,

                               // Datos de pago
                               paymentMethods,
                               selectedPaymentId,
                               selectedPaymentType,
                               loadingPayments,
                               handlePaymentChange,
                               handleNewCardSelect,
                               handleOxxoSelect,
                               handleNewCardDataChange,

                               // Datos de facturación
                               requiresInvoice,
                               fiscalData,
                               handleInvoiceChange,
                               handleFiscalDataChange,

                               // Notas
                               orderNotes,
                               handleNotesChange
                             }) => {
  return (
    <div className="col-lg-8">
      {/* Sección: Dirección de Envío */}
      <CheckoutSection
        title="Dirección de Envío"
        stepNumber={1}
      >
        {loadingAddresses ? (
          <LoadingSpinner size="sm" text="Cargando direcciones..." />
        ) : (
          <AddressSelector
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            selectedAddressType={selectedAddressType}
            onAddressSelect={handleAddressChange}
            onNewAddressSelect={handleNewAddressSelect}
            onNewAddressDataChange={handleNewAddressDataChange}
          />
        )}
      </CheckoutSection>

      {/* Sección: Método de Pago */}
      <CheckoutSection
        title="Método de Pago"
        stepNumber={2}
      >
        {loadingPayments ? (
          <LoadingSpinner size="sm" text="Cargando métodos de pago..." />
        ) : (
          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            selectedPaymentId={selectedPaymentId}
            selectedPaymentType={selectedPaymentType}
            onPaymentSelect={handlePaymentChange}
            onNewCardSelect={handleNewCardSelect}
            onOxxoSelect={handleOxxoSelect}
            onNewCardDataChange={handleNewCardDataChange}
          />
        )}
      </CheckoutSection>

      {/* Sección: Información Fiscal (opcional) */}
      <CheckoutSection
        title="Información Fiscal"
        stepNumber={3}
      >
        <BillingInfoForm
          requiresInvoice={requiresInvoice}
          onRequiresInvoiceChange={handleInvoiceChange}
          fiscalData={fiscalData}
          onFiscalDataChange={handleFiscalDataChange}
        />
      </CheckoutSection>

      {/* Sección: Notas adicionales */}
      <CheckoutSection
        title="Notas Adicionales"
        stepNumber={4}
      >
        <div className="form-group">
          <textarea
            className="form-control"
            rows="3"
            placeholder="Instrucciones especiales para la entrega (opcional)"
            value={orderNotes}
            onChange={handleNotesChange}
          ></textarea>
          <small className="form-text text-muted">
            Por ejemplo: "Dejar con el portero" o "Llamar antes de entregar".
          </small>
        </div>
      </CheckoutSection>
    </div>
  );
};