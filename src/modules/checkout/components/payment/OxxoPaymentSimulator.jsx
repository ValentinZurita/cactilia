import React, { useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useDispatch } from 'react-redux'
import { addMessage } from '@store/messages/messageSlice.js'

/**
 * Componente para simular el pago de OXXO en entorno de desarrollo
 * Solo se debe usar para pruebas, no incluir en producción
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.orderId - ID del pedido a simular como pagado
 * @param {string} props.paymentIntentId - ID del PaymentIntent a confirmar
 */
export const OxxoPaymentSimulator = ({ orderId, paymentIntentId }) => {
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const dispatch = useDispatch()

  // Solo mostrar en entorno de desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const handleSimulatePayment = async () => {
    if (!orderId || !paymentIntentId) {
      dispatch(addMessage({
        type: 'error',
        text: 'Faltan datos del pedido para simular el pago',
      }))
      return
    }

    setProcessing(true)
    try {
      const functions = getFunctions()
      const simulateOxxoPayment = httpsCallable(functions, 'simulateOxxoPayment')

      const result = await simulateOxxoPayment({
        orderId,
        paymentIntentId,
      })

      if (result.data && result.data.success) {
        setSuccess(true)
        dispatch(addMessage({
          type: 'success',
          text: 'Pago OXXO simulado correctamente',
          autoHide: true,
          duration: 5000,
        }))
      } else {
        throw new Error(result.data?.error || 'Error al simular el pago')
      }
    } catch (error) {
      console.error('Error simulando pago OXXO:', error)
      dispatch(addMessage({
        type: 'error',
        text: error.message || 'Error al simular el pago',
      }))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="oxxo-payment-simulator mt-4">
      <div className="alert alert-info">
        <div className="d-flex align-items-start">
          <i className="bi bi-info-circle-fill mt-1 me-2"></i>
          <div>
            <h6 className="alert-heading">Simulador de Pago (Solo desarrollo)</h6>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary w-100"
        onClick={handleSimulatePayment}
        disabled={processing || success}
      >
        {processing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Procesando...
          </>
        ) : success ? (
          <>
            <i className="bi bi-check-circle-fill me-2"></i>
            Pago simulado correctamente
          </>
        ) : (
          <>
            <i className="bi bi-cash-coin me-2"></i>
            Simular pago en OXXO
          </>
        )}
      </button>
    </div>
  )
}