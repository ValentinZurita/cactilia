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
                               onCombinationsCalculated,
                               
                               // Componente personalizado de envío
                               customShippingComponent,
                               
                               // Otros props
                               error,
                               setError
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
        onAddressSelect={handleAddressSelect}
        onNewAddressSelect={handleNewAddressSelect}
        onNewAddressDataChange={handleNewAddressDataChange}
        onAddAddress={handleAddressAdded}
      />

      {/* Componente personalizado de envío si existe */}
      {customShippingComponent && typeof customShippingComponent === 'function' && (
        customShippingComponent({
          shippingOptions,
          selectedOptionId: selectedShippingOptionId,
          onOptionSelect: handleShippingOptionSelect,
          loading: loadingShippingOptions,
          addressSelected: !!(selectedAddressId || (newAddressData?.street && newAddressData?.city)),
          selectedAddressType,
          newAddressData,
          savedAddressData: addresses?.find(addr => addr.id === selectedAddressId),
          error: shippingError,
          onCombinationsCalculated
        })
      )}

      {/* Sección: Opciones de Envío (original) */}
      {!customShippingComponent && (
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
      )}

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