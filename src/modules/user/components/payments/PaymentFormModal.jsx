// src/modules/user/package/payments/PaymentFormModal.jsx
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage } from '../../../../store/messages/messageSlice'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import '../../styles/paymentFormModal.css'

/**
 * Modal simplificado para añadir métodos de pago con Stripe
 */
export const PaymentFormModal = ({ isOpen, onClose, onSuccess }) => {
  // Local states
  const [cardHolder, setCardHolder] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cardComplete, setCardComplete] = useState(false)

  // References for safe cleanup
  const isSubmittingRef = useRef(false)
  const formRef = useRef(null)
  const { uid } = useSelector(state => state.auth)

  // Get Firebase Functions instance
  const functionsRef = useRef(null)

  // Initialize functions only once
  useEffect(() => {
    functionsRef.current = getFunctions(app)
    // Connect to emulator if in development
    // if (import.meta.env.DEV) {
    //   try {
    //     connectFunctionsEmulator(functionsRef.current, 'localhost', 5001)
    //     console.log('Connected to Functions emulator in PaymentFormModal')
    //   } catch (e) {
    //     console.error('Error connecting to Functions emulator:', e)
    //   }
    // }
  }, [])

  // Stripe hooks
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useDispatch()

  // Clean form when opened
  useEffect(() => {
    if (isOpen) {
      setCardHolder('')
      setIsDefault(false)
      setError(null)
      setCardComplete(false)
      isSubmittingRef.current = false
    }
  }, [isOpen])

  // Handle Escape key to close
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

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // If modal is not open, render nothing
  if (!isOpen) return null

  // Handle card element changes
  const handleCardChange = (event) => {
    setCardComplete(event.complete)
    setError(event.error ? event.error.message : null)
  }

  // Handle form submission safely
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Avoid duplicate submissions
    if (isSubmittingRef.current || loading) {
      return
    }

    // Initial validations
    if (!stripe || !elements) {
      setError('Stripe no está inicializado. Por favor, espera un momento e intenta de nuevo.')
      return
    }

    if (!cardComplete) {
      setError('Por favor, completa los datos de tu tarjeta')
      return
    }

    if (!cardHolder.trim()) {
      setError('Por favor, ingresa el nombre del titular de la tarjeta')
      return
    }

    // Get the CardElement - must be done BEFORE changing state
    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Could not access card form. Please try again.')
      return
    }

    setLoading(true)
    setError(null)
    isSubmittingRef.current = true

    try {
      // Create SetupIntent via Cloud Function
      const createSetupIntent = httpsCallable(functionsRef.current, 'createSetupIntent')
      const setupResponse = await createSetupIntent({})

      if (!setupResponse.data?.clientSecret) {
        throw new Error('Error al crear la intención de configuración')
      }

      // Confirm the setup with Stripe
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(
        setupResponse.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardHolder,
            },
          },
        },
      )

      if (setupError) {
        throw new Error(setupError.message)
      }

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error('La configuración falló. Por favor, intenta de nuevo.')
      }

      // Save the payment method via Cloud Function
      const savePaymentMethod = httpsCallable(functionsRef.current, 'savePaymentMethod')
      await savePaymentMethod({
        setupIntentId: setupIntent.id,
        paymentMethodId: setupIntent.payment_method,
        isDefault: isDefault,
        cardHolder: cardHolder,
      })

      // Show success message
      dispatch(addMessage({
        type: 'success',
        text: 'Método de pago añadido correctamente',
      }))

      // Clear the form
      setCardHolder('')
      setIsDefault(false)

      // Call onSuccess and close modal
      if (onSuccess) {
        onSuccess()
      }

      // Safe to close now
      onClose()
    } catch (err) {
      console.error('Error al añadir método de pago:', err)
      setError(err.message || 'Ocurrió un error al procesar la tarjeta')

      dispatch(addMessage({
        type: 'error',
        text: 'Hubo un problema al añadir tu método de pago',
      }))

      // Allow a new attempt
      isSubmittingRef.current = false
    } finally {
      // Reset these states even if there's an error
      setLoading(false)
    }
  }

  // Prevent modal from closing when clicking inside
  const handleModalContentClick = (e) => {
    e.stopPropagation()
  }

  // Only close if not in submission process
  const handleSafeClose = () => {
    if (!loading && !isSubmittingRef.current) {
      onClose()
    }
  }

  // Enhanced options for card element
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
        iconColor: '#66bb6a',
      },
    },
    hidePostalCode: true,
  }

  return ReactDOM.createPortal(
    <div
      className="payment-modal-backdrop"
      onClick={handleSafeClose}
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
          <h5 className="payment-modal-title" id="payment-modal-title">Añadir Método de Pago</h5>
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
          <form onSubmit={handleSubmit} ref={formRef}>
            {/* Error message */}
            {error && (
              <div className="payment-alert-error" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Cardholder name */}
            <div className="payment-form-group">
              <label htmlFor="cardHolder">Nombre del titular</label>
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

            {/* Stripe card element */}
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
                Ingresa el número de tarjeta, fecha de expiración y CVC.
              </small>
              {cardComplete && (
                <div className="payment-card-complete">
                  <i className="bi bi-check-circle-fill"></i> Información de la tarjeta completa
                </div>
              )}
            </div>

            {/* Default payment checkbox */}
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

            {/* Test card info for development */}
            <div className="payment-test-cards">
              <p className="payment-text-muted">
                <strong>Tarjeta de prueba:</strong> Usa 4242 4242 4242 4242, cualquier fecha futura y 3 dígitos para el
                CVC
              </p>
            </div>

            {/* Form actions */}
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
                  'Añadir Método de Pago'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  )
}