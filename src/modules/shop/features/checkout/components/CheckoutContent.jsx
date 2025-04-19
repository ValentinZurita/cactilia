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

  const checkout = useCheckout();

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

  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [shippingTotal, setShippingTotal] = useState(0);

  const selectedAddress = checkout.addresses && checkout.selectedAddressId 
    ? checkout.addresses.find(addr => addr.id === checkout.selectedAddressId) 
    : null;
  
  useEffect(() => {
    if (selectedAddress) {
      console.log('🏠 Dirección seleccionada para opciones de envío:', selectedAddress);
      
      if (selectedShippingOption) {
        console.log('⚠️ La dirección ha cambiado. Las opciones de envío se actualizarán en consecuencia.');
      }
    } else if (checkout.addresses && checkout.addresses.length > 0) {
      console.log('⚠️ Hay direcciones disponibles pero ninguna seleccionada');
    } else {
      console.log('⚠️ No hay direcciones disponibles');
    }
  }, [selectedAddress, checkout.addresses]);

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

  const selectShippingOption = useCallback((option) => {
    setSelectedShippingOption(option);
  }, []);

  useEffect(() => {
    if (shippingOptions.length > 0 && !loadingShipping && !selectedShippingOption && selectShippingOption) {
      if (!checkoutInitialLoadRef.current) {
        console.log('🔄 CheckoutContent: Seleccionando automáticamente la opción más económica');
        checkoutInitialLoadRef.current = true;
        
        const cheapestOption = [...shippingOptions].sort((a, b) => 
          (a.price || 0) - (b.price || 0)
        )[0];
        
        if (cheapestOption) {
          console.log(`🔄 CheckoutContent: Seleccionando opción ${cheapestOption.id}`);
          selectShippingOption(cheapestOption);
        }
      }
    } else if (shippingOptions.length === 0) {
      checkoutInitialLoadRef.current = false;
    }
  }, [shippingOptions, loadingShipping, selectedShippingOption, selectShippingOption]);

  const checkoutInitialLoadRef = useRef(true);
  const shippingUpdateRef = useRef(null);

  const handleShippingTotalCostChange = useCallback((cost) => {
    console.log(`💲 [CheckoutContent] handleShippingTotalCostChange RECIBIÓ costo: ${cost} (tipo: ${typeof cost})`);
    const numericCost = Number(cost) || 0;
    console.log(`💲 [CheckoutContent] handleShippingTotalCostChange ESTABLECIENDO shippingTotal a: ${numericCost}`);
    setShippingTotal(numericCost);
  }, []);

  useEffect(() => {
    if (typeof updateShipping === 'function') {
      console.log(`💸 [CheckoutContent] Llamando a updateShipping del carrito con costo: $${shippingTotal}`);
      updateShipping(shippingTotal);
    } else {
      console.warn('[CheckoutContent] La función updateShipping no está disponible en useCart.');
    }
  }, [shippingTotal, updateShipping]);

  useEffect(() => {
    console.log('🚨 CHECKOUT CONTENT LOADED 🚨');
    
    console.log('🚚 SHIPPING GROUPS:', calculatedShippingGroups?.length || 0);
    console.log('🚢 SHIPPING OPTIONS:', shippingOptions?.length || 0);
    
    if (previousAddress && selectedAddress && previousAddress.id !== selectedAddress.id) {
      console.log('⚠️ La dirección ha cambiado:', {
        anterior: { id: previousAddress.id, cp: previousAddress.zip || previousAddress.zipcode },
        nueva: { id: selectedAddress.id, cp: selectedAddress.zip || selectedAddress.zipcode }
      });
      
      if (selectedShippingOption) {
        const addressKey = previousAddress.id;
        const optionInfo = {
          id: selectedShippingOption.id,
          description: selectedShippingOption.description || selectedShippingOption.label,
          isFree: selectedShippingOption.isFreeShipping
        };
        
        setShippingOptionsHistory(prev => ({
          ...prev,
          [addressKey]: optionInfo
        }));
        
        console.log('📝 Guardando preferencia de envío para dirección', addressKey, optionInfo);
      }
    }
    
    setPreviousAddress(selectedAddress);
  }, [selectedAddress, calculatedShippingGroups, shippingOptions, selectedShippingOption]);

  const isButtonDisabled = useCallback(() => {
    if (hasStockIssues) return true;

    if (checkout.isProcessing) return true;

    const hasValidAddress = (
      (checkout.selectedAddressType === 'saved' && checkout.selectedAddressId) ||
      (checkout.selectedAddressType === 'new' &&
        checkout.newAddressData?.street &&
        checkout.newAddressData?.city &&
        checkout.newAddressData?.state &&
        checkout.newAddressData?.zip)
    );

    if (!hasValidAddress) return true;

    if (!selectedShippingOption) return true;
    
    switch (checkout.selectedPaymentType) {
      case 'card':
        return !checkout.selectedPaymentId;
      case 'new_card':
        return !checkout.newCardData?.cardholderName ||
          !checkout.newCardData?.isComplete;
      case 'oxxo':
        return false;
      default:
        return true;
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

  const handleShippingOptionSelect = (option) => {
    if (!option) {
      console.warn('⚠️ CheckoutContent: Intento de seleccionar una opción nula');
      return;
    }
    
    console.log('🔍 [SECUENCIA FINAL] CheckoutContent recibe opción:', {
      id: option.id,
      name: option.name,
      unavailableProductIds: option.unavailableProductIds?.length || 0,
      hasPartialCoverage: option.hasPartialCoverage || false
    });
    
    const prevOption = selectedShippingOption;
    
    if (prevOption) {
      console.log('📝 Cambiando de opción:', {
        previa: {
          id: prevOption.id,
          precio: prevOption.totalCost || prevOption.calculatedCost || 0,
          esGratis: prevOption.isFreeShipping,
          productosNoDisponibles: prevOption.unavailableProductIds?.length || 0
        },
        nueva: {
          id: option.id,
          precio: option.totalCost || option.calculatedCost || option.totalPrice || 0,
          esGratis: option.isFreeShipping || option.isAllFree,
          productosNoDisponibles: option.unavailableProductIds?.length || 0
        }
      });
    }
    
    const sanitizedOption = {
      ...option,
      hasPartialCoverage: option.hasPartialCoverage || option.isPartial || false,
      unavailableProductIds: option.unavailableProductIds || [],
      coveredProductIds: option.coveredProductIds || []
    };
    
    if (sanitizedOption.hasPartialCoverage) {
      console.log('🔍 [SECUENCIA FINAL] Opción con cobertura parcial detectada:', {
        productosNoDisponibles: sanitizedOption.unavailableProductIds.length,
        idsNoDisponibles: sanitizedOption.unavailableProductIds
      });
    }
    
    console.log(`🔍 [SECUENCIA FINAL] DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA:`);
    console.log(`🔍 [SECUENCIA FINAL] - La opción tiene hasPartialCoverage? ${sanitizedOption.hasPartialCoverage}`);
    console.log(`🔍 [SECUENCIA FINAL] - Cantidad de unavailableProductIds: ${sanitizedOption.unavailableProductIds.length}`);
    console.log(`🔍 [SECUENCIA FINAL] - Antes del setState, los datos están correctos`);
    
    selectShippingOption(sanitizedOption);
    
    setTimeout(() => {
      if (selectedShippingOption) {
        console.log(`🔍 [SECUENCIA FINAL] Después de setState, verificando:`, {
          hasPartialCoverage: selectedShippingOption.hasPartialCoverage,
          unavailableCount: selectedShippingOption.unavailableProductIds?.length || 0
        });
      }
    }, 0);
  };

  const handleCombinationsCalculated = (combinations) => {
    console.log('🔄 CheckoutContent: Recibidas combinaciones:', combinations.length);
    if (updateShippingCombinations) {
      updateShippingCombinations();
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const isDevelopment = process.env.NODE_ENV === 'development';

  const [previousAddress, setPreviousAddress] = useState(null);

  const [shippingOptionsHistory, setShippingOptionsHistory] = useState({});

  console.log('📌 [CheckoutContent] Props para CheckoutSummaryPanel:', {
    cartShipping,
    isFreeShipping,
    selectedShippingIsFree: selectedShippingOption?.isFree,
    passingAsFreeShipping: selectedShippingOption?.isFree || false,
    shippingTotal: cartShipping,
    selectedShippingOption: selectedShippingOption ? {
      id: selectedShippingOption.id,
      name: selectedShippingOption.name,
      hasPartialCoverage: selectedShippingOption.hasPartialCoverage || false,
      unavailableProductIds: selectedShippingOption.unavailableProductIds || [],
      unavailableCount: selectedShippingOption.unavailableProductIds?.length || 0
    } : null
  });

  const enhancedSelectedOption = selectedShippingOption ? {
    ...selectedShippingOption,
    hasPartialCoverage: selectedShippingOption.hasPartialCoverage || selectedShippingOption.isPartial || false,
    unavailableProductIds: selectedShippingOption.unavailableProductIds || [],
    allProductsCovered: !(selectedShippingOption.hasPartialCoverage || selectedShippingOption.isPartial || false)
  } : null;
  
  if (enhancedSelectedOption?.hasPartialCoverage) {
    console.log(`⚠️ [SOLUCIÓN] ATENCIÓN: Hay ${enhancedSelectedOption.unavailableProductIds.length} productos no disponibles.`);
    console.log(`⚠️ [SOLUCIÓN] IDs: ${JSON.stringify(enhancedSelectedOption.unavailableProductIds)}`);
  }

  return (
    <div className="container checkout-page my-5">
      <h1 className="checkout-title mb-4">Finalizar Compra</h1>

      <div className="row">
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
                  onTotalCostChange={handleShippingTotalCostChange}
                />
              </div>
            ) : null
          )}
        />

        <CheckoutSummaryPanel
          cartItems={cartItems}
          cartSubtotal={cartSubtotal}
          cartTaxes={cartTaxes}
          cartShipping={cartShipping}
          cartTotal={cartTotal}
          isFreeShipping={cartShipping <= 0 && (selectedShippingOption?.isFree || false)}
          selectedShippingOption={enhancedSelectedOption}
          shippingTotal={shippingTotal}

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