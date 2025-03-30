import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../../firebase/firebaseConfig.js';
import { addMessage } from '../../../../../../store/messages/messageSlice.js';

/**
 * Simulador temporal que actualiza directamente Firestore
 * ADVERTENCIA: Solo para pruebas en desarrollo
 */
export const TempOxxoSimulator = ({ orderId, paymentIntentId }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleSimulatePayment = async () => {
    if (!orderId) {
      dispatch(addMessage({
        type: 'error',
        text: 'No hay ID de orden para simular'
      }));
      return;
    }

    setProcessing(true);
    try {
      // Actualizar directamente la orden en Firestore
      const orderRef = doc(FirebaseDB, 'orders', orderId);

      await updateDoc(orderRef, {
        status: 'processing',
        'payment.status': 'succeeded',
        updatedAt: serverTimestamp()
      });

      // Actualizar payment_intent si hay ID
      if (paymentIntentId) {
        const piRef = doc(FirebaseDB, 'payment_intents', paymentIntentId);
        try {
          await updateDoc(piRef, {
            status: 'succeeded',
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.warn('No se pudo actualizar el payment intent, pero no es crítico:', e);
        }
      }

      setSuccess(true);
      dispatch(addMessage({
        type: 'success',
        text: 'Pago OXXO simulado correctamente',
        autoHide: true
      }));

      // Recargar la página después de 2 segundos para ver los cambios
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error simulando pago:', error);
      dispatch(addMessage({
        type: 'error',
        text: error.message || 'Error al simular el pago'
      }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="alert alert-warning">
        <div className="d-flex align-items-start">
          <i className="bi bi-exclamation-triangle-fill mt-1 me-2"></i>
          <div>
            <h6 className="alert-heading">Simulador temporal (SOLO DESARROLLO)</h6>
          </div>
        </div>
      </div>

      <button
        className="btn btn-warning w-100"
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
            <i className="bi bi-exclamation-triangle me-2"></i>
            Simular pago (método alternativo)
          </>
        )}
      </button>
    </div>
  );
};