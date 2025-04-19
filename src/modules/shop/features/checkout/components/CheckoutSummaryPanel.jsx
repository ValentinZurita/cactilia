import { CheckoutButton } from './CheckoutButton';
import { CheckoutSummary } from './summary/index.js'
import { useEffect, useState, useCallback } from 'react';

/**
 * Panel de resumen y pago para checkout
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element}
 */
export const CheckoutSummaryPanel = ({
                                       // Datos del carrito
                                       cartItems,
                                       cartSubtotal,
                                       cartTaxes,
                                       cartShipping,
                                       cartTotal,
                                       isFreeShipping,

                                       // Estado del proceso
                                       isProcessing,
                                       isButtonDisabled,
                                       hasStockIssues,

                                       // Tipo de pago
                                       selectedPaymentType,
                                       
                                       // Información de envío 
                                       selectedShippingOption,
                                       shippingTotal,

                                       // Manejadores
                                       processOrderWithChecks,

                                       // Paso actual
                                       step,

                                       // Manejadores
                                       setIsFreeShipping
                                     }) => {
  // Log para debugging
  console.log('🧾 [CheckoutSummaryPanel] Props recibidas:', {
    cartShipping,
    isFreeShipping,
    selectedShippingOptionId: selectedShippingOption?.id,
    selectedShippingOptionCost: selectedShippingOption?.totalCost || selectedShippingOption?.calculatedCost || 0,
    selectedShippingOptionIsFree: selectedShippingOption?.isFree,
    selectedShippingOptionIsFreeShipping: selectedShippingOption?.isFreeShipping
  });

  // Obtener texto del botón según el método de pago
  const getButtonText = () => {
    if (isProcessing) return "Procesando...";

    if (hasStockIssues) {
      return "Revisar problemas de stock";
    }

    if (selectedPaymentType === 'oxxo') {
      return "Generar voucher OXXO";
    }

    return "Completar Compra";
  };

  // Extraer ids de productos no disponibles de la opción de envío seleccionada
  const unavailableProductIds = selectedShippingOption?.unavailableProductIds || [];
  const hasPartialCoverage = selectedShippingOption?.hasPartialCoverage || false;

  // Procesar datos de envío para el panel de resumen
  const processShippingData = (shippingOptions, shippingData, shippingCost) => {
    // Log para diagnóstico de datos recibidos
    console.log('🚚 [SummaryPanel] Procesando datos de envío:', {
      opcionesDisponibles: shippingOptions?.length || 0,
      datosProcesados: shippingData ? 'Presente' : 'No presente',
      costoEnvio: shippingCost,
      isFreeShipping: isFreeShipping
    });

    // Asegurar que si hay un costo de envío > 0, nunca se considere como gratis
    const actualShippingCost = shippingCost > 0 ? shippingCost : 0;
    const actualIsFreeShipping = actualShippingCost <= 0 && isFreeShipping;

    // Si hay datos de envío procesados, usarlos directamente
    if (shippingData) {
      console.log('🚚 [SummaryPanel] Usando datos de envío procesados:', {
        costoTotal: shippingData.totalCost,
        esGratis: shippingData.isFree,
        productosNoDisponibles: shippingData.unavailableProductIds?.length || 0
      });
      
      // Calcular si realmente es gratis basado en el costo real
      const finalCost = shippingData.isFree ? 0 : (shippingData.totalCost || 0);
      const finalIsFree = finalCost <= 0 && shippingData.isFree;
      
      // Establecer el estado de envío gratuito basado explícitamente en los datos recibidos
      setIsFreeShipping(finalIsFree);
      
      return {
        shippingCost: finalCost,
        unavailableProductIds: shippingData.unavailableProductIds || [],
        isFreeShipping: finalIsFree
      };
    }

    // Si hay opciones pero no datos procesados, usar la primera opción
    if (shippingOptions && shippingOptions.length > 0) {
      const firstOption = shippingOptions[0];
      console.log('🚚 [SummaryPanel] Usando primera opción disponible:', {
        nombre: firstOption.name,
        costo: firstOption.price || firstOption.totalCost || 0,
        esGratis: firstOption.isFree || firstOption.isFreeShipping
      });
      
      // Calcular costo real
      const optionCost = parseFloat(firstOption.price || firstOption.totalCost || 0);
      
      // Establecer estado de envío gratuito basado en el costo real
      const optionIsFree = optionCost <= 0 && (firstOption.isFree || firstOption.isFreeShipping);
      setIsFreeShipping(optionIsFree);
      
      return {
        shippingCost: optionIsFree ? 0 : optionCost,
        unavailableProductIds: firstOption.unavailableProductIds || [],
        isFreeShipping: optionIsFree
      };
    }

    // Si no hay opciones o datos, usar el valor por defecto
    console.log('🚚 [SummaryPanel] Sin datos de envío, usando valores por defecto:', {
      costoEnvio: actualShippingCost,
      esGratis: actualIsFreeShipping
    });
    
    return {
      shippingCost: actualIsFreeShipping ? 0 : actualShippingCost,
      unavailableProductIds: [],
      isFreeShipping: actualIsFreeShipping
    };
  };

  const [shippingData, setShippingData] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);

  const [currentSummaryData, setCurrentSummaryData] = useState({
    items: cartItems,
    subtotal: cartSubtotal,
    taxes: cartTaxes,
    shipping: cartShipping,
    total: cartSubtotal + cartTaxes + (isFreeShipping ? 0 : cartShipping),
    isFreeShipping,
    unavailableProductIds
  });

  useEffect(() => {
    // Si hay datos de envío procesados, usarlos
    if (shippingData) {
      const processedData = processShippingData(shippingOptions, shippingData, cartShipping);
      
      // Pasar datos procesados al componente de resumen
      setCurrentSummaryData({
        items: cartItems,
        subtotal: cartSubtotal,
        taxes: cartTaxes,
        shipping: processedData.shippingCost,
        total: cartSubtotal + cartTaxes + (processedData.isFreeShipping ? 0 : processedData.shippingCost),
        isFreeShipping: processedData.isFreeShipping,
        unavailableProductIds: processedData.unavailableProductIds
      });
    } else {
      // Si no hay datos procesados, usar valores por defecto
      setCurrentSummaryData({
        items: cartItems,
        subtotal: cartSubtotal,
        taxes: cartTaxes,
        shipping: cartShipping,
        total: cartSubtotal + cartTaxes + (isFreeShipping ? 0 : cartShipping),
        isFreeShipping,
        unavailableProductIds
      });
    }
  }, [cartItems, cartSubtotal, cartTaxes, cartShipping, shippingData, shippingOptions, isFreeShipping, unavailableProductIds]);

  // Wrapper para llamar a processOrderWithChecks
  const handleCheckoutClick = useCallback(() => {
    if (!selectedShippingOption) {
      console.error("[CheckoutSummaryPanel] Intento de procesar sin opción de envío seleccionada.");
      return;
    }
    // === INICIO CAMBIO ===
    // Pasar la opción seleccionada y el costo total recibido como prop
    console.log(`🅿️ [CheckoutSummaryPanel] handleCheckoutClick - Pasando a processOrder:`, {
      optionId: selectedShippingOption?.id,
      optionName: selectedShippingOption?.name,
      optionInternalCost: selectedShippingOption?.price ?? selectedShippingOption?.totalCost ?? selectedShippingOption?.calculatedCost,
      shippingTotalProp: shippingTotal // Loggear el costo recibido
    });
    processOrderWithChecks(selectedShippingOption, shippingTotal);
    // === FIN CAMBIO ===
  }, [processOrderWithChecks, selectedShippingOption, shippingTotal]); // <-- Añadir shippingTotal a dependencias

  return (
    <div className="col-lg-4">
      <div className="checkout-summary-container">

        {/* Resumen del carrito */}
        <CheckoutSummary
          items={currentSummaryData.items}
          subtotal={currentSummaryData.subtotal}
          taxes={currentSummaryData.taxes}
          shipping={currentSummaryData.shipping}
          total={currentSummaryData.total}
          isFreeShipping={currentSummaryData.isFreeShipping}
          unavailableProductIds={currentSummaryData.unavailableProductIds}
        />

        {/* Mensaje para envío parcial */}
        {hasPartialCoverage && currentSummaryData.unavailableProductIds.length > 0 && (
          <div className="shipping-actions px-3 mb-3">
            <button 
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => window.scrollTo(0, 0)} // Scroll hasta arriba para cambiar dirección
            >
              <i className="bi bi-geo-alt me-1"></i>
              Cambiar dirección de envío
            </button>
          </div>
        )}

        {/* Botón para procesar la compra */}
        <div className="px-3">
          <CheckoutButton
            onCheckout={handleCheckoutClick}
            isProcessing={isProcessing}
            disabled={isButtonDisabled}
            buttonText={getButtonText()}
            paymentType={selectedPaymentType}
            hasStockIssues={hasStockIssues}
          />

          {/* Términos y condiciones */}
          <div className="checkout-terms">
            <small className="text-muted">
              Al completar tu compra, aceptas nuestros{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
            </small>
          </div>

          {/* Detalles según el método de pago seleccionado */}
          {selectedPaymentType === 'oxxo' && !isProcessing && (
            <div className="payment-info-box mt-3 p-3 bg-light border rounded">
              <p className="small mb-2">
                <i className="bi bi-info-circle-fill me-2 text-primary"></i>
                Al hacer clic en "Generar voucher OXXO", crearemos un voucher de pago que podrás presentar en cualquier tienda OXXO en México.
              </p>
              <p className="small mb-0">
                El voucher tiene validez de 24 horas y tu pedido será procesado una vez que recibamos la confirmación del pago.
              </p>
            </div>
          )}

          {/* Indicadores de procesamiento - Mostrar durante el paso 2 */}
          {step === 2 && (
            <div className="processing-indicators mt-4 p-3 border rounded">
              <div className="processing-step mb-2">
                <i className="bi bi-arrow-repeat spin me-2"></i>
                <span>
                  {selectedPaymentType === 'oxxo'
                    ? 'Generando voucher de pago...'
                    : 'Procesando tu pago...'}
                </span>
              </div>
              <small className="text-muted d-block">
                Espera un momento mientras procesamos tu solicitud. No cierres esta ventana.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};