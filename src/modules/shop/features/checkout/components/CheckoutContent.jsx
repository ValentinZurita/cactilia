import React, { useCallback, useEffect, useState, useRef, lazy, Suspense } from 'react';
import { useCart } from '../../cart/hooks/useCart';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummaryPanel } from './CheckoutSummaryPanel';
import { useCheckout } from '../hooks/useCheckout';
import { useShippingOptions } from '../components/shipping/hooks/useShippingOptions';
import CheckoutDebugInfo from './CheckoutDebugInfo';
import { allProductsCovered } from '../services/shipping';
import Spinner from './common/Spinner';
import ShippingOptionsList from '../newShipping/components/ShippingOptionsList';
import NewShippingIntegration from './NewShippingIntegration';

// Lazy loading de componentes pesados de shipping
const ShippingSelector = lazy(() => import('../components/shipping/ShippingSelector'));
const ShippingGroupSelector = lazy(() => import('../components/shipping/ShippingGroupSelector'));

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
    isLoading: loadingShipping,
    error: shippingError,
    rawOptions: shippingOptions,
    optionGroups: calculatedShippingGroups,
    reloadOptions: updateShippingCombinations
  } = useShippingOptions(
    cartItems, 
    selectedAddress
  );
  
  // Estado local para la opción seleccionada
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  
  // Función para seleccionar una opción de envío
  const selectShippingOption = useCallback((option) => {
    setSelectedShippingOption(option);
  }, []);

  // Cuando se cargan las opciones, seleccionar automáticamente la más económica
  useEffect(() => {
    // Solo ejecutar si hay opciones disponibles, no está cargando y no hay opción seleccionada
    if (shippingOptions.length > 0 && !loadingShipping && !selectedShippingOption && selectShippingOption) {
      // Usar una referencia para evitar múltiples selecciones
      if (!checkoutInitialLoadRef.current) {
        console.log('🔄 CheckoutContent: Seleccionando automáticamente la opción más económica');
        checkoutInitialLoadRef.current = true;
        
        // Encontrar la opción más económica usando 'price'
        const cheapestOption = [...shippingOptions].sort((a, b) => 
          (a.price || 0) - (b.price || 0) // Use price field for sorting
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
      try {
        // Extraer el costo de la opción seleccionada
        let shippingCost = 0;
        
        // Intentar obtener el costo de diferentes propiedades (en orden de prioridad)
        if (typeof selectedShippingOption.totalCost === 'number') {
          shippingCost = selectedShippingOption.totalCost;
        } else if (typeof selectedShippingOption.calculatedCost === 'number') {
          shippingCost = selectedShippingOption.calculatedCost;
        } else if (typeof selectedShippingOption.price === 'number') {
          shippingCost = selectedShippingOption.price;
        } else if (typeof selectedShippingOption.cost === 'number') {
          shippingCost = selectedShippingOption.cost;
        }
        
        // Asegurar que sea un número
        shippingCost = parseFloat(shippingCost);
        
        // Verificar si es un número válido
        if (isNaN(shippingCost)) {
          console.warn('⚠️ Costo de envío no válido:', selectedShippingOption);
          shippingCost = 0;
        }
        
        console.log(`💸 [CheckoutContent] Actualizando costo de envío a $${shippingCost.toFixed(2)} [ID: ${selectedShippingOption.id}]`);
        console.log('🔍 [CheckoutContent] Opción seleccionada:', {
          id: selectedShippingOption.id,
          name: selectedShippingOption.name,
          totalCost: selectedShippingOption.totalCost,
          calculatedCost: selectedShippingOption.calculatedCost,
          price: selectedShippingOption.price,
          isFree: selectedShippingOption.isFree,
          isFreeShipping: selectedShippingOption.isFreeShipping
        });
        
        // Actualizar el costo de envío en el contexto del carrito
        updateShipping(shippingCost);
        
        // Actualizar la referencia
        shippingUpdateRef.current = shippingCost;
      } catch (error) {
        console.error('❌ Error al actualizar costo de envío:', error);
      }
    } else if (!selectedShippingOption && updateShipping) {
      // Si no hay opción seleccionada, establecer costo en 0
      console.log('🚫 No hay opción de envío seleccionada, estableciendo costo a $0');
      updateShipping(0);
      shippingUpdateRef.current = 0;
    }
  }, [selectedShippingOption, updateShipping]);

  // Manejo de efectos secundarios cuando cambia alguna dependencia
  useEffect(() => {
    // Log para diagnosticar cambios en el checkout
    console.log('🚨 CHECKOUT CONTENT LOADED 🚨');
    
    // Log avanzado para diagnóstico
    console.log('🚚 SHIPPING GROUPS:', calculatedShippingGroups?.length || 0);
    console.log('🚢 SHIPPING OPTIONS:', shippingOptions?.length || 0);
    
    // Al cambiar la dirección seleccionada, registrar el cambio para diagnóstico
    if (previousAddress && selectedAddress && previousAddress.id !== selectedAddress.id) {
      console.log('⚠️ La dirección ha cambiado:', {
        anterior: { id: previousAddress.id, cp: previousAddress.zip || previousAddress.zipcode },
        nueva: { id: selectedAddress.id, cp: selectedAddress.zip || selectedAddress.zipcode }
      });
      
      // Guardar info de la última opción seleccionada para esta dirección para facilitar reconexión
      if (selectedShippingOption) {
        const addressKey = previousAddress.id;
        const optionInfo = {
          id: selectedShippingOption.id,
          description: selectedShippingOption.description || selectedShippingOption.label,
          isFree: selectedShippingOption.isFreeShipping
        };
        
        // Guardar en el historial de opciones por dirección
        setShippingOptionsHistory(prev => ({
          ...prev,
          [addressKey]: optionInfo
        }));
        
        console.log('📝 Guardando preferencia de envío para dirección', addressKey, optionInfo);
      }
    }
    
    setPreviousAddress(selectedAddress);
  }, [selectedAddress, calculatedShippingGroups, shippingOptions, selectedShippingOption]);

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
    
    // Verificar que la opción de envío cubra todos los productos
    if (selectedShippingOption && 
        (selectedShippingOption.allProductsCovered === false || 
         (selectedShippingOption.selections && 
          !allProductsCovered(selectedShippingOption.selections, cartItems)))
    ) {
      console.log('⚠️ Botón deshabilitado: La opción de envío no cubre todos los productos');
      return true;
    }

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
    selectedShippingOption,
    cartItems
  ]);

  // Manejador para cuando se selecciona una opción de envío
  const handleShippingOptionSelect = (option) => {
    if (!option) {
      console.warn('⚠️ CheckoutContent: Intento de seleccionar una opción nula');
      return;
    }
    
    console.log('🚚 CheckoutContent: Seleccionando opción', option);
    
    // Guardar la opción seleccionada previamente para diagnóstico
    const prevOption = selectedShippingOption;
    
    // Registrar detalles para diagnóstico
    if (prevOption) {
      console.log('📝 Cambiando de opción:', {
        previa: {
          id: prevOption.id,
          precio: prevOption.totalCost || prevOption.calculatedCost || 0,
          esGratis: prevOption.isFreeShipping
        },
        nueva: {
          id: option.id,
          precio: option.totalCost || option.calculatedCost || option.totalPrice || 0,
          esGratis: option.isFreeShipping || option.isAllFree
        }
      });
    }
    
    // Verificar que la función selectShippingOption esté disponible
    if (typeof selectShippingOption === 'function') {
      // Actualizar el costo de envío
      selectShippingOption(option);
    } else {
      console.error('❌ Error: La función selectShippingOption no está disponible');
    }
  };

  // Manejador para actualizar las combinaciones de envío calculadas
  const handleCombinationsCalculated = (combinations) => {
    console.log('🔄 CheckoutContent: Recibidas combinaciones:', combinations.length);
    // Recargar opciones después de recibir nuevas combinaciones
    if (updateShippingCombinations) {
      updateShippingCombinations();
    }
  };

  // Estados locales
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Verificar si estamos en desarrollo para mostrar herramientas de diagnóstico
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Estado para almacenar la dirección anterior
  const [previousAddress, setPreviousAddress] = useState(null);

  // Historial de opciones seleccionadas por dirección
  const [shippingOptionsHistory, setShippingOptionsHistory] = useState({});

  // Antes de renderizar el CheckoutSummaryPanel, agregar log para verificar las props
  console.log('📌 [CheckoutContent] Props para CheckoutSummaryPanel:', {
    cartShipping,
    isFreeShipping,
    selectedShippingIsFree: selectedShippingOption?.isFree,
    passingAsFreeShipping: selectedShippingOption?.isFree || false
  });

  return (
    <div className="container checkout-page my-5">
      {/* The diagnostic panel and debug components have been removed */}

      <h1 className="checkout-title mb-4">Finalizar Compra</h1>

      <div className="row">

        {/* Formulario de checkout */}
        <CheckoutForm
          addresses={checkout.addresses}
          selectedAddressId={checkout.selectedAddressId}
          selectedAddressType={checkout.selectedAddressType}
          loadingAddresses={checkout.loadingAddresses}
          handleAddressSelect={checkout.handleAddressSelect}
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
          handlePaymentSelect={checkout.handlePaymentSelect}
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
          
          customShippingComponent={(props) => (
            checkout.selectedAddressType && 
            (checkout.selectedAddressType === 'saved' ? checkout.selectedAddressId : checkout.newAddressData) ? (
              <div className="shipping-options-container mb-4">
                <NewShippingIntegration 
                  cartItems={cartItems}
                  address={checkout.selectedAddressType === 'saved' ? 
                    checkout.addresses.find(addr => addr.id === checkout.selectedAddressId) : 
                    checkout.newAddressData
                  }
                  onShippingSelected={handleShippingOptionSelect}
                />
              </div>
            ) : null
          )}
        />

        {/* Resumen del pedido y botón de procesamiento */}
        <CheckoutSummaryPanel
          cartItems={cartItems}
          cartSubtotal={cartSubtotal}
          cartTaxes={cartTaxes}
          cartShipping={cartShipping}
          cartTotal={cartTotal}
          isFreeShipping={selectedShippingOption?.isFree || false}
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