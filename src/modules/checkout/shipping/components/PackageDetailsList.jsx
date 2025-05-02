import React from 'react';

/**
 * Muestra la lista detallada de paquetes físicos dentro de una opción de envío.
 * @param {Object} props
 * @param {Array} props.packages - Array de objetos de paquete (resultado de getDisplayPackages)
 * @param {number} props.actualPackagesCount - Número total de paquetes
 */
export const PackageDetailsList = ({ packages = [], actualPackagesCount }) => {
  if (!packages || packages.length === 0) {
    return null; // No mostrar nada si no hay paquetes
  }

  return (
    <div className="packages-info-list">
      {packages.map((pkg, index) => {
        const formattedPackagePrice = pkg.price === 0
          ? 'GRATIS'
          : new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
          }).format(pkg.price);

        // Mostrar precio individual solo si hay más de un paquete
        const showIndividualPrice = actualPackagesCount > 1;

        return (
          <div key={`pkg_info_${pkg.id || index}`} className="package-info-item">
            <div className="package-info-header">
              <div className="package-info-title">
                Paquete {index + 1}
                {pkg.weight !== undefined &&
                  <span className="package-weight-badge">
                    {pkg.weight.toFixed(2)} kg
                  </span>
                }
              </div>
              {showIndividualPrice &&
                <div className="package-info-price">{formattedPackagePrice}</div>
              }
            </div>
            <div className="package-info-products">
              {/* Asegurarse de que pkg.products sea un array antes de mapear */}
              {Array.isArray(pkg.products) && pkg.products.length > 0 ? (
                pkg.products.map((product, pidx) => (
                  <span key={`info_prod_${pkg.id || index}_${product.id}_${pidx}`} className="package-info-product">
                    {product.name}{product.quantity > 1 ? ` (x${product.quantity})` : ''}
                    {pidx < pkg.products.length - 1 ? ', ' : ''}
                  </span>
                ))
              ) : (
                <span className="package-info-empty">No hay productos en este paquete</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
};

// PackageDetailsList.propTypes = { ... }; 