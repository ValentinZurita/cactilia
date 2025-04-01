import { CartHeader } from './CartHeader.jsx';
import { CartItemList } from './CartItemList.jsx';
import { CartSummaryPanel } from './CartSummaryPanel.jsx';
import { EmptyCart } from './EmptyCart.jsx';

/**
 * CartPageContainer - Contenedor principal para la página del carrito
 *
 * Estructura el layout y organiza todos los componentes de la página del carrito.
 *
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Contenedor completo de la página del carrito
 */
export const CartPageContainer = ({
                                    title,
                                    itemCount,
                                    onGoBack,
                                    onCheckout,
                                    isCheckoutDisabled,
                                    isValidating,
                                    items,
                                    onIncreaseQuantity,
                                    onDecreaseQuantity,
                                    onRemoveItem
                                  }) => {
  return (
    <div className="container cart-page pt-5 mt-5">
      {/* Encabezado del carrito */}
      <CartHeader
        title={title}
        itemCount={itemCount}
        onGoBack={onGoBack}
      />

      {/* Layout con dos columnas */}
      <div className="row">

        {/* Columna izquierda: Productos del carrito */}
        <div className="col-lg-8 cart-items-column">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <CartItemList
                items={items}
                onIncreaseQuantity={onIncreaseQuantity}
                onDecreaseQuantity={onDecreaseQuantity}
                onRemoveItem={onRemoveItem}
              />
            </div>
          </div>

        </div>

        {/* Columna derecha: Resumen y checkout */}
        <div className="col-lg-4 cart-summary-column">
          <CartSummaryPanel
            items={items}
            onCheckout={onCheckout}
            isDisabled={isCheckoutDisabled}
            isValidating={isValidating}
          />
        </div>

      </div>
    </div>
  );
};

// Componente EmptyCart como una propiedad estática para facilitar su uso
CartPageContainer.EmptyCart = EmptyCart;
