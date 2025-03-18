import React from 'react';

/**
 * CheckoutButton - Botón para finalizar el proceso de compra
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onCheckout - Función que se ejecuta al hacer clic en el botón
 * @param {boolean} props.isProcessing - Indica si se está procesando el pago
 * @param {boolean} props.disabled - Inhabilita el botón si es true
 */
export const CheckoutButton = ({
                                 onCheckout,
                                 isProcessing = false,
                                 disabled = false
                               }) => {
  return (
    <button
      className="btn btn-green-checkout w-100 py-3"
      onClick={onCheckout}
      disabled={disabled || isProcessing}
    >
      {isProcessing ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Procesando pago...
        </>
      ) : (
        <>
          <i className="bi bi-credit-card-fill me-2"></i>
          Completar Compra
        </>
      )}
    </button>
  );
};