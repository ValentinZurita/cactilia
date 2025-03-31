import React, { useState, useEffect, useRef } from 'react';
import { CheckoutSection } from './CheckoutSection.jsx';
import { LoadingSpinner } from '../../../components/ui/index.js';
import { AddressSelector } from './address/index.js';
import { PaymentMethodSelector } from './payment/index.js';
import { BillingInfoForm } from './billing/index.js';
import { StockErrorAlert } from '../../../components/common/StockErrorAlert.jsx';
import { validateCartStock } from '../../../utils/stockValidation.js';
import '../../../styles/stockErrorAlert.css';

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
                               handleNotesChange,

                               // Error
                               error,
                               setError,

                               // Datos del carrito para validación
                               cartItems = []
                             }) => {
  const [isValidatingStock, setIsValidatingStock] = useState(false);
  const [stockValidationResult, setStockValidationResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Usar referencias para controlar validaciones
  const isComponentMounted = useRef(true);
  const validationTimerRef = useRef(null);
  const lastValidationRef = useRef(null);
  const itemsRefString = useRef(JSON.stringify(cartItems));
  const initialValidationDoneRef = useRef(false);

  // Limpiar referencias en desmontaje
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  // Validar stock solo al montar el componente o cuando cambian los items significativamente
  useEffect(() => {
    // Si no hay items, no hacer nada
    if (!cartItems || cartItems.length === 0) {
      return;
    }

    // Verificar si necesitamos validar por ser la primera vez
    if (!initialValidationDoneRef.current) {
      initialValidationDoneRef.current = true;
      performStockValidation();
      return;
    }

    // Convertir items a string para comparación
    const currentItemsString = JSON.stringify(cartItems);

    // Si los items no han cambiado, no revalidar
    if (currentItemsString === itemsRefString.current) {
      return;
    }

    // Actualizar referencia
    itemsRefString.current = currentItemsString;

    // Verificar si debemos validar (no más de cada 30 segundos)
    const shouldValidate = !lastValidationRef.current ||
      (Date.now() - lastValidationRef.current) > 30000;

    if (!shouldValidate) {
      console.log('Omitiendo validación por tiempo mínimo', new Date().toISOString());
      return;
    }

    // Realizar validación con retraso para evitar múltiples validaciones simultáneas
    performStockValidation();

  }, [cartItems, setError]);

  /**
   * Realiza la validación de stock con gestión de estado y errores
   */
  const performStockValidation = () => {
    // Cancelar validación anterior si existe
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    validationTimerRef.current = setTimeout(async () => {
      if (!isComponentMounted.current) {
        return;
      }

      setIsValidatingStock(true);
      try {
        console.log('Iniciando validación de stock en CheckoutForm', new Date().toISOString());
        const result = await validateCartStock(cartItems);

        // Guardar timestamp de última validación
        lastValidationRef.current = Date.now();

        if (!isComponentMounted.current) return;

        setStockValidationResult(result);

        // Si hay problemas de stock, mostrar error
        if (!result.valid && result.outOfStockItems && result.outOfStockItems.length > 0) {
          let errorMessage;

          if (result.outOfStockItems.length === 1) {
            const item = result.outOfStockItems[0];
            errorMessage = `"${item.name}" no está disponible en la cantidad solicitada. Solo hay ${item.actualStock} unidades disponibles.`;
          } else {
            errorMessage = 'Algunos productos no están disponibles en la cantidad solicitada:';
            // Limitar a mostrar máximo 3 productos para no sobrecargar la UI
            const itemsToShow = result.outOfStockItems.slice(0, 3);
            itemsToShow.forEach(item => {
              errorMessage += `\n- ${item.name}: Solicitados ${item.quantity}, Disponibles ${item.actualStock}`;
            });

            if (result.outOfStockItems.length > 3) {
              errorMessage += `\n... y ${result.outOfStockItems.length - 3} productos más.`;
            }
          }

          setValidationError(errorMessage);
          if (setError) {
            setError(errorMessage);
          }
        } else {
          setValidationError(null);
        }
      } catch (error) {
        console.error('Error validando stock:', error);
        if (isComponentMounted.current) {
          setValidationError('Error al verificar la disponibilidad de productos. Por favor, inténtalo de nuevo.');
        }
      } finally {
        if (isComponentMounted.current) {
          setIsValidatingStock(false);
        }
      }
    }, 1000);
  };

  return (
    <div className="col-lg-8">
      {/* Banner de validación de stock */}
      {isValidatingStock && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Validando...</span>
            </div>
            <span>Verificando disponibilidad de productos...</span>
          </div>
        </div>
      )}

      {/* Mostrar el error si existe usando nuestro componente personalizado */}
      {error && (
        <StockErrorAlert
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Mostrar error de validación si existe y es diferente del error general */}
      {validationError && !error && (
        <StockErrorAlert
          message={validationError}
          onClose={() => setValidationError(null)}
          className="mb-4"
        />
      )}

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

      {/* Sección: Información Fiscal */}
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

      {/* Información sobre validación de stock */}
      {stockValidationResult && stockValidationResult.valid && !isValidatingStock && (
        <div className="alert alert-success mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <span>Todos los productos están disponibles en las cantidades solicitadas.</span>
          </div>
        </div>
      )}
    </div>
  );
};