import { CartTotal } from './CartTotal.jsx';

/**
 * CartSummaryPanel - Panel de resumen y botón de checkout
 *
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Panel lateral de resumen
 */
export const CartSummaryPanel = ({
                                   items,
                                   onCheckout,
                                   isDisabled,
                                   isValidating
                                 }) => {
  return (
    <>

      {/* Resumen del carrito */}
      <CartTotal items={items} />

      {/* Botón de checkout */}
      <div className="d-grid mb-4">
        <button
          className="btn btn-green-checkout w-100"
          onClick={onCheckout}
          disabled={isDisabled}
        >
          {isValidating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Verificando disponibilidad...
            </>
          ) : (
            <>
              <i className="bi bi-credit-card me-2"></i>
              Proceder al pago
            </>
          )}
        </button>

      </div>
    </>
  );
};
