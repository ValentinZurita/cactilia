import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useCart } from '../../cart/hooks/useCart';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummaryPanel } from './CheckoutSummaryPanel';
import { useCheckout } from '../hooks/useCheckout';
import { useShippingOptions } from '../hooks/useShippingOptions';
import CheckoutDebugInfo from './CheckoutDebugInfo';

/**
 * Componente principal del contenido de checkout
 * Conecta con el contexto de checkout y muestra el formulario y resumen
 *
 * @returns {JSX.Element} Contenido completo del proceso de checkout
 */
export const CheckoutContent = () => {

  // Obtener datos del contexto de checkout
  const checkout = useCheckout();

  // Obtener datos del carrito
  const {
    items: cartItems,
    subtotal: cartSubtotal,
    taxes: cartTaxes,
    shipping: cartShipping,
    finalTotal: cartTotal,
    isFreeShipping,
    hasStockIssues,
    shippingDetails,
    shippingGroups,
    shippingRules,
    isLoadingShipping,
    updateShipping
  } = useCart();

  // Buscar la dirección seleccionada en la lista de direcciones
  const selectedAddress = checkout.addresses && checkout.selectedAddressId 
    ? checkout.addresses.find(addr => addr.id === checkout.selectedAddressId) 
    : null;
  
  // Monitorear cambios en la dirección seleccionada
  useEffect(() => {
    if (selectedAddress) {
      console.log('🏠 Dirección seleccionada para opciones de envío:', selectedAddress);
      
      // Si ya había una opción seleccionada y cambia la dirección, mostrar mensaje
      if (selectedShippingOption) {
        console.log('⚠️ La dirección ha cambiado. Las opciones de envío se actualizarán en consecuencia.');
      }
    } else if (checkout.addresses && checkout.addresses.length > 0) {
      console.log('⚠️ Hay direcciones disponibles pero ninguna seleccionada');
    } else {
      console.log('⚠️ No hay direcciones disponibles');
    }
  }, [selectedAddress, checkout.addresses]);

  // Obtener opciones de envío
  const {
    loading: loadingShipping,
    options: shippingOptions,
    selectedOption: selectedShippingOption,
    selectShippingOption,
    shippingGroups: calculatedShippingGroups,
    shippingRules: calculatedShippingRules,
    excludedProducts,
    updateShippingCombinations,
    error: shippingError
  } = useShippingOptions(
    cartItems, 
    selectedAddress, 
    checkout.newAddressData, 
    checkout.selectedAddressType
  );

  // Cuando se cargan las opciones, seleccionar automáticamente la más económica
  useEffect(() => {
    // Solo ejecutar si hay opciones disponibles, no está cargando y no hay opción seleccionada
    if (shippingOptions.length > 0 && !loadingShipping && !selectedShippingOption && selectShippingOption) {
      // Usar una referencia para evitar múltiples selecciones
      if (!checkoutInitialLoadRef.current) {
        console.log('🔄 CheckoutContent: Seleccionando automáticamente la opción más económica');
        checkoutInitialLoadRef.current = true;
        
        // Encontrar la opción más económica
        const cheapestOption = [...shippingOptions].sort((a, b) => 
          (a.totalCost || 0) - (b.totalCost || 0)
        )[0];
        
        if (cheapestOption) {
          console.log(`🔄 CheckoutContent: Seleccionando opción ${cheapestOption.id}`);
          selectShippingOption(cheapestOption);
        }
      }
    } else if (shippingOptions.length === 0) {
      // Resetear la referencia si no hay opciones
      checkoutInitialLoadRef.current = false;
    }
  }, [shippingOptions, loadingShipping, selectedShippingOption, selectShippingOption]);

  // Referencia para controlar el log inicial
  const checkoutInitialLoadRef = useRef(true);
  // Referencia para controlar las actualizaciones del costo de envío
  const shippingUpdateRef = useRef(null);

  // Actualizar el costo de envío cuando cambia la opción seleccionada
  useEffect(() => {
    if (selectedShippingOption && updateShipping) {
      // Verificar si el costo de envío ya fue actualizado con este valor
      const shippingCost = selectedShippingOption.totalCost || selectedShippingOption.calculatedCost || 0;
      
      // Solo actualizar si el costo cambió realmente
      if (shippingUpdateRef.current !== shippingCost) {
        console.log(`💸 Costo de envío actualizado a $${shippingCost}`);
        shippingUpdateRef.current = shippingCost;
        updateShipping(shippingCost);
      }
    }
  }, [selectedShippingOption, updateShipping]);

  // Agregar Log de diagnóstico al cargar la vista
  useEffect(() => {
    // Limitar los logs a solo una vez por componente montado usando una referencia
    const isFirstRender = checkoutInitialLoadRef.current;
    if (isFirstRender) {
      console.warn('🚨 CHECKOUT CONTENT LOADED 🚨');
      
      // Solo loggear información esencial en el primer renderizado
      if (calculatedShippingGroups?.length > 0) {
        console.warn('🚚 SHIPPING GROUPS:', calculatedShippingGroups.length);
        console.warn('📏 SHIPPING RULES:', calculatedShippingRules.length);
        console.warn('🚢 SHIPPING OPTIONS:', shippingOptions?.length || 0);
      }
      
      // Marcar como ya renderizado
      checkoutInitialLoadRef.current = false;
    }
  }, [
    calculatedShippingGroups, 
    calculatedShippingRules,
    shippingOptions
  ]);

  /**
   * Determina si el botón de procesamiento debe estar deshabilitado
   * basado en el estado actual del checkout
   */
  const isButtonDisabled = useCallback(() => {
    // Si hay problemas de stock, deshabilitar
    if (hasStockIssues) return true;

    // Si está procesando, deshabilitar
    if (checkout.isProcessing) return true;

    // Verificar dirección según el tipo
    const hasValidAddress = (
      (checkout.selectedAddressType === 'saved' && checkout.selectedAddressId) ||
      (checkout.selectedAddressType === 'new' &&
        checkout.newAddressData?.street &&
        checkout.newAddressData?.city &&
        checkout.newAddressData?.state &&
        checkout.newAddressData?.zip)
    );

    if (!hasValidAddress) return true;

    // Verificar si hay opción de envío seleccionada
    if (!selectedShippingOption) return true;

    // Verificar según el tipo de pago
    switch (checkout.selectedPaymentType) {
      case 'card':
        return !checkout.selectedPaymentId;
      case 'new_card':
        return !checkout.newCardData?.cardholderName ||
          !checkout.newCardData?.isComplete;
      case 'oxxo':
        return false; // Para OXXO no se necesita información adicional
      default:
        return true; // Si no hay tipo seleccionado, deshabilitar
    }
  }, [
    hasStockIssues,
    checkout.isProcessing,
    checkout.selectedAddressType,
    checkout.selectedAddressId,
    checkout.newAddressData,
    checkout.selectedPaymentType,
    checkout.selectedPaymentId,
    checkout.newCardData,
    selectedShippingOption
  ]);

  // Manejador para cuando se selecciona una opción de envío
  const handleShippingOptionSelect = (optionId) => {
    if (!optionId) {
      console.warn('⚠️ CheckoutContent: Intento de seleccionar opción sin ID');
      return;
    }
    
    console.log(`🚚 CheckoutContent: Seleccionando opción ${optionId}`);
    selectShippingOption(optionId);
  };

  // Manejador para actualizar las combinaciones de envío calculadas
  const handleCombinationsCalculated = (combinations) => {
    console.log('🔄 CheckoutContent: Recibidas combinaciones:', combinations.length);
    if (updateShippingCombinations) {
      updateShippingCombinations(combinations);
    }
  };

  // Estados locales
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Verificar si estamos en desarrollo para mostrar herramientas de diagnóstico
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="container checkout-page my-5">
      {/* Alerta de Diagnóstico */}
      <div className="alert alert-danger mb-4 p-4 text-center">
        <h3 className="mb-3">PANEL DE DIAGNÓSTICO</h3>
        <p>Este panel aparece para diagnosticar problemas con el checkout</p>
        <hr/>
        <div className="row">
          <div className="col-md-6 text-start">
            <h5 className="mb-2">Información de envío:</h5>
            <ul className="list-unstyled">
              <li><strong>Direcciones disponibles:</strong> {checkout.addresses ? checkout.addresses.length : 0}</li>
              <li><strong>Dirección seleccionada:</strong> {checkout.selectedAddressId || 'Ninguna'}</li>
              <li><strong>Métodos de pago:</strong> {checkout.paymentMethods ? checkout.paymentMethods.length : 0}</li>
              <li><strong>Opciones de envío:</strong> {shippingOptions ? shippingOptions.length : 0}</li>
              <li><strong>Opción de envío seleccionada:</strong> {selectedShippingOption ? selectedShippingOption.label : 'Ninguna'}</li>
            </ul>
          </div>
          <div className="col-md-6 text-start">
            <h5 className="mb-2">Información del carrito:</h5>
            <ul className="list-unstyled">
              <li><strong>Productos en carrito:</strong> {cartItems ? cartItems.length : 0}</li>
              <li><strong>Subtotal:</strong> ${cartSubtotal?.toFixed(2) || '0.00'}</li>
              <li><strong>Envío:</strong> ${cartShipping?.toFixed(2) || '0.00'}</li>
              <li><strong>Total:</strong> ${cartTotal?.toFixed(2) || '0.00'}</li>
            </ul>
          </div>
        </div>
        <div className="mt-3">
          <button 
            className="btn btn-warning"
            onClick={() => {
              console.warn('DATOS COMPLETOS PARA DEBUGGING:', {
                cart: {
                  items: cartItems,
                  subtotal: cartSubtotal,
                  taxes: cartTaxes,
                  shipping: cartShipping,
                  total: cartTotal,
                  shippingGroups: calculatedShippingGroups,
                  shippingRules: calculatedShippingRules,
                  shippingOptions: shippingOptions,
                  selectedOption: selectedShippingOption
                },
                checkout: {
                  addresses: checkout.addresses,
                  selectedAddressId: checkout.selectedAddressId,
                  paymentMethods: checkout.paymentMethods,
                  selectedPaymentId: checkout.selectedPaymentId
                }
              });
              alert('Datos de diagnóstico enviados a la consola');
            }}
          >
            Mostrar Datos en Consola
          </button>
        </div>
      </div>

      {/* Añadir componente de debug bajo el panel de alerta */}
      <CheckoutDebugInfo 
        cartInfo={{
          items: cartItems,
          itemsCount: cartItems?.reduce((total, item) => total + item.quantity, 0) || 0,
          subtotal: cartSubtotal,
          taxes: cartTaxes,
          shipping: cartShipping,
          finalTotal: cartTotal,
          isFreeShipping,
          hasStockIssues,
          shippingDetails: shippingDetails || {},
          shippingGroups: calculatedShippingGroups || [],
          shippingRules: calculatedShippingRules || [],
          isLoadingShipping,
          shippingOptions: shippingOptions || [],
          selectedShippingOption: selectedShippingOption,
          excludedProducts: excludedProducts || []
        }}
        checkoutInfo={{
          addresses: checkout.addresses,
          selectedAddressId: checkout.selectedAddressId,
          selectedAddressType: checkout.selectedAddressType,
          paymentMethods: checkout.paymentMethods,
          selectedPaymentId: checkout.selectedPaymentId,
          selectedPaymentType: checkout.selectedPaymentType,
          step: checkout.step,
          error: checkout.error
        }}
      />

      {/* Panel de diagnóstico (solo en desarrollo) */}
      {isDevelopment && (
        <CheckoutDebugInfo 
          cart={{
            items: cartItems,
            itemsCount: cartItems?.reduce((total, item) => total + item.quantity, 0) || 0,
            subtotal: cartSubtotal,
            taxes: cartTaxes,
            shipping: cartShipping,
            finalTotal: cartTotal,
            isFreeShipping
          }}
          shippingDetails={shippingDetails}
          shippingGroups={calculatedShippingGroups}
          shippingRules={calculatedShippingRules}
          shippingOptions={shippingOptions}
          selectedShippingOption={selectedShippingOption}
          excludedProducts={excludedProducts}
        />
      )}

      <h1 className="checkout-title mb-4">Finalizar Compra</h1>

      <div className="row">

        {/* Formulario de checkout */}
        <CheckoutForm
          addresses={checkout.addresses}
          selectedAddressId={checkout.selectedAddressId}
          selectedAddressType={checkout.selectedAddressType}
          loadingAddresses={checkout.loadingAddresses}
          handleAddressChange={checkout.handleAddressChange}
          handleNewAddressSelect={checkout.handleNewAddressSelect}
          handleNewAddressDataChange={checkout.handleNewAddressDataChange}

          shippingOptions={shippingOptions}
          selectedShippingOptionId={selectedShippingOption?.id}
          loadingShippingOptions={loadingShipping}
          handleShippingOptionSelect={handleShippingOptionSelect}
          newAddressData={checkout.newAddressData}
          shippingError={shippingError}
          onCombinationsCalculated={handleCombinationsCalculated}

          paymentMethods={checkout.paymentMethods}
          selectedPaymentId={checkout.selectedPaymentId}
          selectedPaymentType={checkout.selectedPaymentType}
          loadingPayments={checkout.loadingPayments}
          handlePaymentChange={checkout.handlePaymentChange}
          handleNewCardSelect={checkout.handleNewCardSelect}
          handleOxxoSelect={checkout.handleOxxoSelect}
          handleNewCardDataChange={checkout.handleNewCardDataChange}

          requiresInvoice={checkout.requiresInvoice}
          fiscalData={checkout.fiscalData}
          handleInvoiceChange={checkout.handleInvoiceChange}
          handleFiscalDataChange={checkout.handleFiscalDataChange}

          orderNotes={checkout.orderNotes}
          handleNotesChange={checkout.handleNotesChange}

          error={checkout.error}
          setError={checkout.setError}
          cartItems={cartItems}
        />

        {/* Resumen del pedido y botón de procesamiento */}
        <CheckoutSummaryPanel
          cartItems={cartItems}
          cartSubtotal={cartSubtotal}
          cartTaxes={cartTaxes}
          cartShipping={cartShipping}
          cartTotal={cartTotal}
          isFreeShipping={isFreeShipping}
          selectedShippingOption={selectedShippingOption}

          isProcessing={checkout.isProcessing}
          isButtonDisabled={isButtonDisabled()}
          hasStockIssues={hasStockIssues}

          selectedPaymentType={checkout.selectedPaymentType}
          processOrderWithChecks={checkout.handleProcessOrder}
          step={checkout.step}
        />
      </div>
    </div>
  );
};