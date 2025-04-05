import React from 'react';
import PropTypes from 'prop-types';
import FormInput from './FormInput';

/**
 * Componente para la configuración de paquetes y sobrepeso
 */
const PackageConfiguration = ({ 
  shippingType, 
  onShippingTypeChange, 
  errors 
}) => {
  return (
    <div className="mt-4 mb-3">
      <h6 className="text-dark d-flex align-items-center mb-3">
        5. Configuración de paquetes y sobrepeso
        <span 
          className="ms-2 text-muted" 
          data-bs-toggle="tooltip" 
          data-bs-placement="top" 
          title="Define los límites de peso y productos para este servicio de mensajería"
        >
          <i className="bi bi-info-circle-fill"></i>
        </span>
      </h6>

      <div className="row g-3">
        <div className="col-md-4">
          <FormInput
            label="Peso máximo por paquete"
            name="maxPackageWeight"
            type="number"
            value={shippingType.maxPackageWeight}
            onChange={onShippingTypeChange}
            placeholder="Ej: 20"
            suffix="kg"
            step="0.01"
            min="0"
            error={errors.maxPackageWeight}
            helpText="Peso máximo sin recargos"
            tooltip="Si el peso total supera este límite, se aplicará un recargo por kg adicional"
          />
        </div>
        
        <div className="col-md-4">
          <FormInput
            label="Costo por kg extra"
            name="extraWeightCost"
            type="number"
            value={shippingType.extraWeightCost}
            onChange={onShippingTypeChange}
            placeholder="Ej: 10.00"
            prefix="$"
            suffix="MXN"
            step="0.01"
            min="0"
            error={errors.extraWeightCost}
            helpText="Recargo por kg excedente"
            tooltip="Monto que se cobrará por cada kg que exceda el peso máximo"
          />
        </div>
        
        <div className="col-md-4">
          <FormInput
            label="Máximo productos por paquete"
            name="maxProductsPerPackage"
            type="number"
            value={shippingType.maxProductsPerPackage}
            onChange={onShippingTypeChange}
            placeholder="Ej: 10"
            suffix="unidades"
            step="1"
            min="0"
            error={errors.maxProductsPerPackage}
            helpText="Límite de productos por paquete"
            tooltip="Si el pedido excede este número de productos, se dividirá en múltiples paquetes"
          />
        </div>
      </div>
    </div>
  );
};

PackageConfiguration.propTypes = {
  shippingType: PropTypes.object.isRequired,
  onShippingTypeChange: PropTypes.func.isRequired,
  errors: PropTypes.object
};

export default PackageConfiguration; 