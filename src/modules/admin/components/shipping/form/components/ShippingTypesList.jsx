import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para listar los tipos de envío configurados
 */
const ShippingTypesList = ({ 
  shippingTypes, 
  onRemoveShippingType 
}) => {
  if (shippingTypes.length === 0) {
    return (
      <div className="text-center text-muted py-4 bg-light rounded">
        <i className="bi bi-box me-2"></i>
        No hay opciones de envío configuradas
      </div>
    );
  }
  
  return (
    <div className="table-responsive">
      <table className="table table-hover bg-white">
        <thead className="table-light">
          <tr>
            <th>Servicio</th>
            <th>Nombre</th>
            <th className="text-end">Precio</th>
            <th className="text-center">Entrega</th>
            <th className="text-center">Config. paquete</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {shippingTypes.map(type => (
            <tr key={type.id}>
              <td>{type.carrier}</td>
              <td>{type.label}</td>
              <td className="text-end">${parseFloat(type.price).toFixed(2)}</td>
              <td className="text-center">{type.minDays}-{type.maxDays} días</td>
              <td className="text-center">
                <span className="badge bg-light text-dark border">
                  <i className="bi bi-box me-1"></i>
                  {type.maxPackageWeight || 20} kg / {type.maxProductsPerPackage || 10} u.
                </span>
              </td>
              <td className="text-end">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onRemoveShippingType(type.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ShippingTypesList.propTypes = {
  shippingTypes: PropTypes.array.isRequired,
  onRemoveShippingType: PropTypes.func.isRequired
};

export default ShippingTypesList; 