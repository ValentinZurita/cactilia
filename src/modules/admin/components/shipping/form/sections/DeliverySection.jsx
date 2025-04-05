import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { 
  ServiceBasicInfo, 
  DeliveryDetails, 
  PackageConfiguration, 
  ShippingTypesList 
} from '../components';

/**
 * Componente para la entrada de datos con validación y mensajes de error
 */
const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  prefix, 
  suffix,
  min,
  max,
  step,
  error,
  helpText,
  required = false
}) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-medium mb-2">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <div className={`input-group ${error ? 'has-validation' : ''}`}>
        {prefix && <span className="input-group-text">{prefix}</span>}
        <input
          type={type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="input-group-text">{suffix}</span>}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
      {helpText && <div className="form-text">{helpText}</div>}
    </div>
  );
};

/**
 * Componente para la selección de valores con validación y mensajes de error
 */
const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  error, 
  helpText,
  required = false
}) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-medium mb-2">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <select
        className={`form-select ${error ? 'is-invalid' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">Seleccionar...</option>
        {options.map(option => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
      {helpText && <div className="form-text">{helpText}</div>}
    </div>
  );
};

/**
 * Componente para la configuración de métodos de envío disponibles
 */
const DeliverySection = ({ control, errors: formErrors, watch, setValue }) => {
  // Obtener los valores actuales
  const shippingTypes = watch('shippingTypes') || [];
  
  // Lista de servicios de mensajería disponibles
  const availableCarriers = [
    'DHL', 
    'Estafeta', 
    'FedEx', 
    'Redpack', 
    'Correos de México',
    'Entrega local',
    'Otros'
  ];
  
  // Estado de errores para el formulario de nueva opción
  const [validationErrors, setValidationErrors] = useState({});
  
  // Estado para el formulario de añadir tipo de envío
  const [newShippingType, setNewShippingType] = useState({
    carrier: '',
    label: '',
    price: '',
    minDays: '1',
    maxDays: '3',
    maxPackageWeight: '20',
    extraWeightCost: '10',
    maxProductsPerPackage: '10'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Maneja el cambio en los campos del nuevo tipo de envío
  const handleNewTypeChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar mensaje de error para el campo cuando se modifica
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setNewShippingType(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Genera un código único basado en el servicio y el nombre
  const generateUniqueCode = (carrier, label) => {
    if (!carrier || !label) return '';
    
    // Crear un código simple basado en el carrier y el label
    const carrierPrefix = carrier.substring(0, 3).toLowerCase();
    const labelPrefix = label.trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 10);
    
    // Añadir timestamp para garantizar unicidad
    const timestamp = Date.now().toString().slice(-4);
    
    return `${carrierPrefix}_${labelPrefix}_${timestamp}`;
  };
  
  // Validar todos los campos
  const validateShippingType = () => {
    const errors = {};
    
    // Validaciones básicas para campos requeridos
    if (!newShippingType.carrier) errors.carrier = 'El servicio es requerido';
    if (!newShippingType.label) errors.label = 'El nombre es requerido';
    if (!newShippingType.price) errors.price = 'El precio es requerido';
    
    // Validar números
    if (newShippingType.price && (isNaN(parseFloat(newShippingType.price)) || parseFloat(newShippingType.price) < 0)) {
      errors.price = 'El precio debe ser un número positivo';
    }
    
    // Validar rangos de días
    const minDays = parseInt(newShippingType.minDays) || 1;
    const maxDays = parseInt(newShippingType.maxDays) || minDays;
    
    if (minDays < 0) errors.minDays = 'Debe ser positivo';
    if (maxDays < minDays) errors.maxDays = 'Debe ser mayor o igual al mínimo';
    
    // Validar configuración de paquetes
    if (newShippingType.maxPackageWeight && parseFloat(newShippingType.maxPackageWeight) < 0) {
      errors.maxPackageWeight = 'Debe ser positivo';
    }
    
    if (newShippingType.extraWeightCost && parseFloat(newShippingType.extraWeightCost) < 0) {
      errors.extraWeightCost = 'Debe ser positivo';
    }
    
    if (newShippingType.maxProductsPerPackage && parseInt(newShippingType.maxProductsPerPackage) < 0) {
      errors.maxProductsPerPackage = 'Debe ser positivo';
    }
    
    return errors;
  };
  
  // Añade un nuevo tipo de envío
  const handleAddShippingType = () => {
    // Validar todos los campos
    const errors = validateShippingType();
    
    // Si hay errores, mostrarlos y no continuar
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Generar código único
    const code = generateUniqueCode(newShippingType.carrier, newShippingType.label);
    
    // Convertir valores de texto a números
    const newType = {
      id: Date.now().toString(), // ID único
      carrier: newShippingType.carrier,
      name: code,
      label: newShippingType.label,
      price: parseFloat(newShippingType.price) || 0,
      minDays: parseInt(newShippingType.minDays) || 1,
      maxDays: parseInt(newShippingType.maxDays) || parseInt(newShippingType.minDays) || 1,
      maxPackageWeight: parseFloat(newShippingType.maxPackageWeight) || 20,
      extraWeightCost: parseFloat(newShippingType.extraWeightCost) || 10,
      maxProductsPerPackage: parseInt(newShippingType.maxProductsPerPackage) || 10
    };
    
    // Actualizar la lista de opciones
    const updatedTypes = [...shippingTypes, newType];
    setValue('shippingTypes', updatedTypes);
    
    // Resetear el formulario manteniendo el carrier seleccionado y valores por defecto
    setNewShippingType({
      carrier: newShippingType.carrier,
      label: '',
      price: '',
      minDays: '1',
      maxDays: '3',
      maxPackageWeight: '20',
      extraWeightCost: '10',
      maxProductsPerPackage: '10'
    });
    
    // Limpiar errores
    setValidationErrors({});
  };
  
  // Elimina un tipo de envío
  const handleRemoveShippingType = (id) => {
    const updatedTypes = shippingTypes.filter(type => type.id !== id);
    setValue('shippingTypes', updatedTypes);
  };
  
  return (
    <div className="py-3">
      {/* Métodos de envío */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="text-dark mb-0">Opciones de envío disponibles</h6>
          <button 
            type="button" 
            className="btn btn-outline-dark px-3"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className={`bi bi-${showAddForm ? 'x' : 'plus'}`}></i>
            {showAddForm ? ' Cancelar' : ' Añadir opción'}
          </button>
        </div>
        
        {/* Formulario para añadir un tipo de envío */}
        {showAddForm && (
          <div className="card bg-light mb-4">
            <div className="card-body">
              {/* Componentes modularizados para cada sección */}
              <ServiceBasicInfo 
                shippingType={newShippingType}
                onShippingTypeChange={handleNewTypeChange}
                availableCarriers={availableCarriers}
                errors={validationErrors}
              />
              
              <DeliveryDetails 
                shippingType={newShippingType}
                onShippingTypeChange={handleNewTypeChange}
                errors={validationErrors}
              />
              
              <PackageConfiguration 
                shippingType={newShippingType}
                onShippingTypeChange={handleNewTypeChange}
                errors={validationErrors}
              />
              
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-dark px-4"
                  onClick={handleAddShippingType}
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Lista de tipos de envío */}
        <Controller
          name="shippingTypes"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <ShippingTypesList 
              shippingTypes={shippingTypes}
              onRemoveShippingType={handleRemoveShippingType}
            />
          )}
        />
        
        {/* Mensajes de error */}
        {formErrors?.shippingTypes && (
          <div className="alert alert-danger mt-3 mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {formErrors.shippingTypes.message}
          </div>
        )}
      </div>
    </div>
  );
};

DeliverySection.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired
};

export default DeliverySection; 