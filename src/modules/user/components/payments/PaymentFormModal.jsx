// src/modules/user/components/payments/PaymentFormModal.jsx
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage } from '../../../../store/messages/messageSlice'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { FirebaseApp } from '../../../../config/firebase/firebaseConfig.js'
// Importa el logo de Stripe desde los assets
import stripeLogo from '../../../../shared/assets/stripe.svg'; // <-- Corregido: quitando /icons
import '../../styles/paymentFormModal.css'

/**
 * Modal para añadir métodos de pago utilizando Stripe.
 * Renderiza usando React Portal.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSuccess
 */
export const PaymentFormModal = ({ isOpen, onClose, onSuccess }) => {
  // --- Hooks ---
  const dispatch = useDispatch()
  const { uid } = useSelector(state => state.auth)
  const stripe = useStripe()
  const elements = useElements()

  // --- Referencias ---
  const functionsRef = useRef(null)
  const isSubmittingRef = useRef(false) // Evita envíos múltiples
  const formRef = useRef(null)

  // --- Estados Locales ---
  const [cardHolder, setCardHolder] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cardComplete, setCardComplete] = useState(false) // True si Stripe CardElement está completo

  // --- Efectos ---

  // Inicializar Firebase Functions (solo al montar)
  useEffect(() => {
    functionsRef.current = getFunctions(FirebaseApp)
    // TODO: Conectar al emulador si es necesario en desarrollo
  }, [])

  // Limpiar estado del formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setCardHolder('')
      setIsDefault(false)
      setError(null)
      setCardComplete(false)
      isSubmittingRef.current = false
      elements?.getElement(CardElement)?.clear(); // Limpia el campo de tarjeta Stripe
    }
  }, [isOpen, elements])

  // Listener para cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, loading, onClose])

  // Controlar scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // --- Manejadores de Eventos ---

  // Actualiza estado basado en la validez del CardElement
  const handleCardChange = (event) => {
    setCardComplete(event.complete)
    setError(event.error ? event.error.message : null)
  }

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmittingRef.current || loading || !stripe || !elements || !cardComplete || !cardHolder.trim()) {
        // Realiza validaciones básicas antes de continuar
        if (!stripe || !elements) setError('Stripe no está listo.');
        else if (!cardComplete) setError('Completa los datos de tu tarjeta.');
        else if (!cardHolder.trim()) setError('Ingresa el nombre del titular.');
        else console.warn('Envío bloqueado (en progreso o inválido).')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('No se pudo acceder al formulario de la tarjeta.')
      return
    }

    setLoading(true)
    setError(null)
    isSubmittingRef.current = true

    try {
      // 1. Crear SetupIntent vía Cloud Function
      // Un SetupIntent prepara la intención de guardar un método de pago para uso futuro.
      const createSetupIntent = httpsCallable(functionsRef.current, 'createSetupIntent')
      const setupResponse = await createSetupIntent({ customerId: uid }) // Idealmente, asociar al customerId de Stripe
      const clientSecret = setupResponse.data?.clientSecret

      if (!clientSecret) {
        throw new Error('No se pudo obtener el clientSecret para configurar la tarjeta.')
      }

      // 2. Confirmar la configuración de la tarjeta con Stripe (Frontend)
      // Se envía la info del CardElement (seguro, no la ves tú) junto al clientSecret.
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardHolder.trim(),
            },
          },
        },
      )

      if (setupError) {
        // Error durante la confirmación (tarjeta inválida, rechazada, etc.)
        throw new Error(setupError.message || 'Error al confirmar la tarjeta con Stripe.')
      }

      const paymentMethodId = setupIntent?.payment_method
      if (!paymentMethodId) {
        throw new Error('La configuración de la tarjeta falló (no se obtuvo ID de método de pago).')
      }

      // 3. Guardar el ID del método de pago (pm_xxx) en tu backend (Cloud Function)
      // Este ID es seguro y representa la tarjeta guardada en Stripe.
      const savePaymentMethod = httpsCallable(functionsRef.current, 'savePaymentMethod')
      await savePaymentMethod({
        paymentMethodId: paymentMethodId,
        isDefault: isDefault,
        cardHolder: cardHolder.trim(),
        // customerId: uid, // Asegúrate que la función sepa a qué usuario pertenece
      })

      // --- Éxito ---
      dispatch(addMessage({ type: 'success', text: 'Método de pago añadido.' }))
      if (onSuccess) onSuccess(); // Callback de éxito
      onClose(); // Cierra el modal

    } catch (err) {
      // --- Manejo de Errores ---
      console.error('Error al añadir método de pago:', err)
      setError(err.message || 'Ocurrió un error inesperado.')
      dispatch(addMessage({ type: 'error', text: 'No se pudo añadir el método de pago.' }))
      isSubmittingRef.current = false // Permitir reintento tras error

    } finally {
      setLoading(false) // Siempre desactivar carga
    }
  }

  // Evita cierre al hacer clic dentro del modal
  const handleModalContentClick = (e) => {
    e.stopPropagation()
  }

  // Cierre seguro (no cierra si está cargando)
  const handleSafeClose = () => {
    if (!loading && !isSubmittingRef.current) {
      onClose()
    }
  }

  // --- Configuración y Renderizado ---
  const cardElementOptions = {
    style: {
      base: { /* Estilos base */ },
      invalid: { /* Estilos si hay error */ },
      complete: { /* Estilos si está completo */ },
    },
    hidePostalCode: true,
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div
      className="payment-modal-backdrop"
      onClick={handleSafeClose}
      role="dialog" aria-modal="true" aria-labelledby="payment-modal-title"
    >
      <div
        className="payment-modal-content"
        onClick={handleModalContentClick}
        role="document"
      >
        {/* Encabezado */}
        <div className="payment-modal-header">
          <h5 className="payment-modal-title" id="payment-modal-title">Añadir Método de Pago</h5>
          <button type="button" className="payment-modal-close" onClick={handleSafeClose} aria-label="Cerrar modal" disabled={loading}>&times;</button>
        </div>

        {/* Cuerpo (Formulario) */}
        <div className="payment-modal-body">
          <form onSubmit={handleSubmit} ref={formRef} noValidate>
            {/* Mensaje de Error */}
            {error && (
              <div className="payment-alert-error alert alert-danger small p-2" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
              </div>
            )}

            {/* Nombre del titular */}
            <div className="payment-form-group mb-3">
              <label htmlFor="cardHolder" className="form-label">Nombre del titular</label>
              <input
                type="text" id="cardHolder" value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Nombre como aparece en la tarjeta" required
                className={`payment-form-input form-control ${!cardHolder.trim() && error ? 'is-invalid' : ''}`}
                disabled={loading} autoComplete="cc-name"
              />
            </div>

            {/* Datos de la tarjeta (Stripe Element) */}
            <div className="payment-form-group mb-3">
              <label className="form-label">Datos de la tarjeta</label>
              <div className={`payment-card-element form-control ${error && !cardComplete ? 'is-invalid' : ''}`}>
                <CardElement options={cardElementOptions} onChange={handleCardChange} disabled={loading} />
              </div>
              <small className="payment-text-muted form-text">Número, expiración y CVC.</small>
              {/* Indicador visual de tarjeta completa */}
              {cardComplete && !error && (
                 <div className="payment-card-complete text-success mt-1 small">
                   <i className="bi bi-check-circle-fill me-1"></i> Completo
                 </div>
              )}
            </div>

            {/* Checkbox Predeterminado */}
            <div className="payment-form-check form-check mb-3">
              <input
                type="checkbox" id="defaultPayment" checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="payment-form-checkbox form-check-input" disabled={loading}
              />
              <label htmlFor="defaultPayment" className="form-check-label">Establecer como predeterminado</label>
            </div>

            {/* Tarjeta de prueba (solo en desarrollo) */}
            {import.meta.env.DEV && (
              <div className="payment-test-cards alert alert-info small p-2">
                <i className="bi bi-info-circle me-1"></i>
                <strong>Prueba:</strong> 4242..., fecha futura, CVC.
              </div>
            )}

            {/* Acciones (Botones) */}
            <div className="payment-form-actions d-flex justify-content-end gap-2">
              <button type="button" className="payment-btn-cancel btn btn-secondary" onClick={handleSafeClose} disabled={loading}>Cancelar</button>
              <button type="submit" className="payment-btn-save btn btn-primary" disabled={!stripe || loading || !cardComplete}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando...</>
                ) : (
                  'Añadir Método de Pago'
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Nuevo Footer del Modal */}
        <div className="payment-modal-footer bg-light border-top">
          <div className="payment-security-ribbon text-center text-muted small py-3"> {/* Padding vertical */}
              {/* Texto de seguridad */}
              <p className="mb-2"> 
                  Pagos seguros procesado por Stripe. Nunca almacenamos los datos de tu tarjeta.
              </p>
              {/* Logo de Stripe */}
              <img 
                  src={stripeLogo} 
                  alt="Procesado por Stripe" 
                  style={{ height: '30px' }} 
                  className="mt-2" 
              />
          </div>
        </div>

      </div>
    </div>,
    document.body
  )
}