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
                               handleAddressSelect,
                               handleNewAddressSelect,
                               handleNewAddressDataChange,
                               handleAddressAdded,

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
                               handlePaymentSelect,
                               handleNewCardSelect,
                               handleOxxoSelect,
                               handleNewCardDataChange,
                               handlePaymentMethodAdded,

                               // Facturación
                               requiresInvoice,
                               fiscalData,
                               handleInvoiceChange,
                               handleFiscalDataChange,

                               // Notas
                               orderNotes,
                               handleNotesChange,
                               cartItems = [],
                               onCombinationsCalculated
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
        onAddressSelect={(id, type) => {
          console.log('onAddressSelect llamado en CheckoutForm con:', { 
            id, 
            type, 
            handleAddressSelect: typeof handleAddressSelect,
            handleAddressSelectValue: handleAddressSelect
          });
          if (typeof handleAddressSelect === 'function') {
            handleAddressSelect(id, type);
          } else {
            console.error('handleAddressSelect no es una función en CheckoutForm:', handleAddressSelect);
          }
        }}
        onNewAddressSelect={() => {
          console.log('onNewAddressSelect llamado en CheckoutForm');
          if (typeof handleAddressSelect === 'function') {
            handleAddressSelect(null, 'new');
          } else {
            console.error('handleAddressSelect no es una función en CheckoutForm al seleccionar nueva dirección:', handleAddressSelect);
          }
        }}
        onNewAddressDataChange={handleNewAddressDataChange}
        onAddAddress={handleAddressAdded}
      />

      {/* Sección: Opciones de Envío */}
      <ShippingOptionsSection
        shippingOptions={shippingOptions}
        selectedOptionId={selectedShippingOptionId}
        onOptionSelect={handleShippingOptionSelect}
        loading={loadingShippingOptions}
        addressSelected={!!(selectedAddressId || (newAddressData?.street && newAddressData?.city))}
        selectedAddressType={selectedAddressType}
        newAddressData={newAddressData}
        savedAddressData={addresses?.find(addr => addr.id === selectedAddressId)}
        error={shippingError}
        onCombinationsCalculated={onCombinationsCalculated}
      />

      {/* Sección: Método de pago */}
      <PaymentSection
        paymentMethods={paymentMethods}
        selectedPaymentId={selectedPaymentId}
        selectedPaymentType={selectedPaymentType}
        loading={loadingPayments}
        onPaymentSelect={handlePaymentSelect}
        onNewCardSelect={handleNewCardSelect}
        onOxxoSelect={handleOxxoSelect}
        onNewCardDataChange={handleNewCardDataChange}
        fiscalData={fiscalData}
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