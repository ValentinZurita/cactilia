import { CartTotal } from './CartTotal.jsx';
//import CartShippingGroupInfo from './CartShippingGroupInfo.jsx';

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

  // Determine if the disabled state is specifically due to stock issues
  const isDisabledByStock = isDisabled && !isValidating;

  return (
    <>
      {/* Resumen del carrito */}
      <CartTotal items={items} />
      
      {/* Información de grupos de envío - TEMPORALMENTE OCULTO */}
      {/* <CartShippingGroupInfo cartItems={items} /> */}

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

        {/* Mensaje de advertencia si está deshabilitado por stock */}
        {isDisabledByStock && (
          <div className="alert alert-warning text-center small mt-2 py-1 px-2" role="alert">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Ajusta los productos que exceden el stock disponible para continuar.
          </div>
        )}

      </div>
    </>
  );
};
