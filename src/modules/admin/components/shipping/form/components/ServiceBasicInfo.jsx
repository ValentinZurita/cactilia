import React from 'react';
import PropTypes from 'prop-types';
import FormSelect from './FormSelect';
import FormInput from './FormInput';

/**
 * Componente para la configuración de servicios básicos
 */
const ServiceBasicInfo = ({ 
  shippingType, 
  onShippingTypeChange, 
  availableCarriers, 
  errors 
}) => {
  return (
    <>
      <FormSelect
        label="1. Servicio de mensajería"
        name="carrier"
        value={shippingType.carrier}
        onChange={onShippingTypeChange}
        options={availableCarriers}
        error={errors.carrier}
        required={true}
        tooltip="Selecciona la empresa de mensajería que ofrece este servicio"
      />
      
      <FormInput
        label="2. Nombre para el cliente"
        name="label"
        value={shippingType.label}
        onChange={onShippingTypeChange}
        placeholder="Ej: Envío Express 24h"
        error={errors.label}
        helpText="Nombre mostrado al cliente durante el checkout"
        required={true}
        tooltip="Este nombre es el que verá el cliente al elegir su método de envío"
      />
    </>
  );
};

ServiceBasicInfo.propTypes = {
  shippingType: PropTypes.object.isRequired,
  onShippingTypeChange: PropTypes.func.isRequired,
  availableCarriers: PropTypes.array.isRequired,
  errors: PropTypes.object
};

export default ServiceBasicInfo; 