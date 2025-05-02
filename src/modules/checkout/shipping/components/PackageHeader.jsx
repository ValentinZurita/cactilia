import React from 'react';

/**
 * Muestra la cabecera de una opción de envío.
 * @param {Object} props
 * @param {string} props.name - Nombre de la opción
 * @param {string} [props.carrier] - Nombre del transportista
 * @param {string} props.displayDeliveryTime - Texto del tiempo de entrega
 * @param {number} props.calculatedTotalCost - Costo total numérico
 * @param {string} props.formattedTotalCost - Costo total formateado
 * @param {Function} props.getShippingIcon - Función para obtener el icono
 * @param {number} props.packagesCount - Número de paquetes
 */
export const PackageHeader = ({
  name,
  carrier,
  displayDeliveryTime,
  calculatedTotalCost,
  formattedTotalCost,
  getShippingIcon,
  packagesCount
}) => {
  return (
    <div className="shipping-package-header d-flex align-items-center">
      <span className="me-2">{getShippingIcon()}</span>
      <div className="shipping-package-info flex-grow-1">
        <h3>{name} {carrier && `- ${carrier}`}</h3>
        <div className="shipping-package-details">
          {displayDeliveryTime ? (
            <div className="shipping-delivery-time">
              <i className="bi bi-clock"></i>
              <span>{displayDeliveryTime}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="shipping-package-price ms-auto">
        {calculatedTotalCost === 0 ? (
          <span className="free-shipping">GRATIS</span>
        ) : (
          <>
            {packagesCount > 1 ? (
              <div className="shipping-total-price">
                <span className="shipping-total-cost">{packagesCount} paquetes</span>
                <span>{formattedTotalCost}</span>
              </div>
            ) : (
              <span>{formattedTotalCost}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Podríamos añadir PropTypes si fuera necesario
// PackageHeader.propTypes = { ... }; 