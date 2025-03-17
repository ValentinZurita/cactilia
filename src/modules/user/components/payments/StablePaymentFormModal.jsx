import React, { useState, useEffect, useRef } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../../store/messages/messageSlice';
import '../../styles/paymentFormModal.css';

/**
 * Formulario modal mejorado para agregar métodos de pago con Stripe
 * Implementa un manejo estable del ciclo de vida para prevenir errores
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal debe estar abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función a llamar cuando se agrega el método de pago exitosamente
 * @returns {JSX.Element|null} Componente de formulario modal
 */
export const StablePaymentFormModal = ({ isOpen, onClose, onSuccess }) => {
  // Estados locales
  const [cardHolder, setCardHolder] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Referencias para manejar la limpieza segura
  const isSubmittingRef = useRef(false);
  const cardElementRef = useRef(null);
  const modalRef = useRef(null);

  // Hooks de Stripe
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  // Efecto para limpiar el formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setCardHolder('');
      setIsDefault(false);
      setError(null);
      setCardComplete(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  // Manejo de evento keydown para cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, onClose]);

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Si el modal no está abierto, renderizamos un contenedor oculto
  // pero mantenemos el CardElement montado para evitar errores
  if (!isOpen) {
    return (
      <div style={{ display: 'none' }}>
        <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
          <CardElement onChange={(e) => {
            // Mantenemos la referencia actualizada incluso cuando está oculto
            cardElementRef.current = e.complete ? elements.getElement(CardElement) : null;
          }} />
        </div>
      </div>
    );
  }

  // Manejar cambios en el elemento de tarjeta
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.complete) {
      cardElementRef.current = elements.getElement(CardElement);
    } else {
      cardElementRef.current = null;
    }

    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  // Manejar envío del formulario con seguridad
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Evitar envíos duplicados
    if (isSubmittingRef.current) {
      return;
    }

    // Validaciones iniciales
    if (!stripe || !elements) {
      setError("Stripe no está inicializado. Por favor, espere un momento e intente de nuevo.");
      return;
    }

    if (!cardComplete) {
      setError("Por favor, complete los datos de su tarjeta");
      return;
    }

    if (!cardHolder.trim()) {
      setError("Por favor, ingrese el nombre del titular de la tarjeta");
      return;
    }

    // Obtener el elemento CardElement actual
    const cardElement = cardElementRef.current || elements.getElement(CardElement);

    if (!cardElement) {
      setError("No se pudo acceder al formulario de tarjeta. Por favor, intente de nuevo.");
      return;
    }

    setLoading(true);
    setError(null);
    isSubmittingRef.current = true;

    try {
      // 1. Crear un Setup Intent desde Firebase Functions
      const functions = getFunctions();
      const createSetupIntent = httpsCallable(functions, 'createSetupIntent');
      const setupIntentResult = await createSetupIntent();

      if (!setupIntentResult.data) {
        throw new Error("No se pudo crear la intención de configuración");
      }

      const { clientSecret, setupIntentId } = setupIntentResult.data;

      // 2. Confirmar la configuración de la tarjeta con Stripe
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardHolder,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!setupIntent) {
        throw new Error('Ocurrió un problema con la configuración del pago');
      }

      // 3. Guardar el método de pago en Firestore
      const savePaymentMethod = httpsCallable(functions, 'savePaymentMethod');
      await savePaymentMethod({
        setupIntentId,
        paymentMethodId: setupIntent.payment_method,
        isDefault
      });

      // 4. Limpiar el formulario y mostrar mensaje de éxito
      if (cardElement) {
        cardElement.clear();
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Método de pago agregado correctamente'
      }));

      // 5. Llamar a onSuccess y luego cerrar el modal
      if (onSuccess) {
        onSuccess();
      }

      // Es seguro cerrar ahora
      onClose();
    } catch (err) {
      console.error('Error al agregar método de pago:', err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: 'Hubo un problema al agregar tu método de pago'
      }));

      // Permitir un nuevo intento
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Prevenir que el modal se cierre al hacer clic dentro
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  // Solo cerrar si no está en proceso de envío
  const handleSafeClose = () => {
    if (!loading && !isSubmittingRef.current) {
      onClose();
    }
  };

  // Configuración mejorada para el elemento de tarjeta
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
      complete: {
        iconColor: '#66bb6a'
      }
    },
    hidePostalCode: true
  };

  return (
    <div
      className="payment-modal-backdrop"
      onClick={handleSafeClose}
      ref={modalRef}
      // Eliminar aria-hidden para evitar problemas de accesibilidad
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        className="payment-modal-content"
        onClick={handleModalContentClick}
        role="document"
      >
        <div className="payment-modal-header">
          <h5 className="payment-modal-title" id="payment-modal-title">Agregar Método de Pago</h5>
          <button
            type="button"
            className="payment-modal-close"
            onClick={handleSafeClose}
            aria-label="Cerrar"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="payment-modal-body">
          <form onSubmit={handleSubmit}>
            {/* Mensaje de error */}
            {error && (
              <div className="payment-alert-error" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Nombre del titular */}
            <div className="payment-form-group">
              <label htmlFor="cardHolder">Nombre del titular de la tarjeta</label>
              <input
                type="text"
                id="cardHolder"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Nombre completo como aparece en la tarjeta"
                required
                className="payment-form-input"
                disabled={loading}
                autoComplete="cc-name"
              />
            </div>

            {/* Elemento de tarjeta de Stripe */}
            <div className="payment-form-group">
              <label>Datos de la tarjeta</label>
              <div className="payment-card-element">
                <CardElement
                  options={cardElementOptions}
                  onChange={handleCardChange}
                  disabled={loading}
                />
              </div>
              <small className="payment-text-muted">
                Ingrese el número de tarjeta, fecha de expiración y código CVC.
              </small>
              {cardComplete && (
                <div className="payment-card-complete">
                  <i className="bi bi-check-circle-fill"></i> Información de tarjeta completa
                </div>
              )}
            </div>

            {/* Checkbox para establecer como predeterminado */}
            <div className="payment-form-check">
              <input
                type="checkbox"
                id="defaultPayment"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="payment-form-checkbox"
                disabled={loading}
              />
              <label htmlFor="defaultPayment">
                Establecer como método de pago predeterminado
              </label>
            </div>

            {/* Info de tarjeta de prueba para desarrollo */}
            <div className="payment-test-cards">
              <p className="payment-text-muted">
                <strong>Tarjeta de prueba:</strong> Usa 4242 4242 4242 4242, cualquier fecha futura y 3 dígitos para el CVC
              </p>
            </div>

            {/* Acciones del formulario */}
            <div className="payment-form-actions">
              <button
                type="button"
                className="payment-btn-cancel"
                onClick={handleSafeClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="payment-btn-save"
                disabled={!stripe || loading || !cardComplete}
              >
                {loading ? (
                  <>
                    <span className="payment-spinner"></span>
                    Procesando...
                  </>
                ) : (
                  'Agregar Método de Pago'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};