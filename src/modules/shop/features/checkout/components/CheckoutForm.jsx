import { useStockValidation } from '../hooks/useStockValidation';
import { StockValidationBanner } from './StockValidationBanner';
import { 
  AddressSection, 
  ShippingOptionsSection, 
  BillingSection, 
  NotesSection, 
  PaymentSection 
} from './sections/index.js'

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

                               // Opciones de envío
                               shippingOptions = [],
                               selectedShippingOptionId,
                               loadingShippingOptions = false,
                               handleShippingOptionSelect,
                               newAddressData,
                               shippingError,

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
                               cartItems = []
                             }) => {

  // Hook para validación de stock
  const { isValidatingStock } = useStockValidation(cartItems);

  return (
    <div className="col-lg-8">
      {/* Banner de validación de stock */}
      <StockValidationBanner isValidating={isValidatingStock} />

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

      {/* Sección: Opciones de Envío */}
      <ShippingOptionsSection
        shippingOptions={shippingOptions}
        selectedOptionId={selectedShippingOptionId}
        onOptionSelect={handleShippingOptionSelect}
        loading={loadingShippingOptions}
        addressSelected={!!selectedAddressId}
        selectedAddressType={selectedAddressType}
        newAddressData={newAddressData}
        error={shippingError}
      />

      {/* Sección: Metodo de Pago */}
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

    </div>
  );
};