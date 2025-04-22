import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { 
  ServiceBasicInfo, 
  DeliveryDetails, 
  PackageConfiguration 
} from '../components';
import { DataTable } from '../../../../common/components/DataTable';
import { ActionButtonsContainer } from '../../../../common/components/ActionButtonsContainer';
import { ActionButton } from '../../../../common/components/ActionButton';

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
      id: uuidv4(),
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
  
  // Elimina un tipo de envío (usar useCallback)
  const handleRemoveShippingType = useCallback((id) => {
    const currentTypes = watch('shippingTypes') || [];
    const updatedTypes = currentTypes.filter(type => type.id !== id);
    setValue('shippingTypes', updatedTypes, { shouldValidate: true }); // Opcional: validar si la eliminación afecta algo
  }, [setValue, watch]); // Dependencias para useCallback

  // --- Configuración de Columnas para DataTable (usar useMemo) --- 
  const columns = useMemo(() => [
    {
      key: 'carrier',
      header: 'Servicio',
      renderCell: (type) => type.carrier || 'N/A'
    },
    {
      key: 'label',
      header: 'Nombre',
      renderCell: (type) => <span className="fw-medium">{type.label || 'N/A'}</span>
    },
    {
      key: 'price',
      header: 'Precio',
      headerClassName: 'text-end',
      cellClassName: 'text-end',
      renderCell: (type) => type.price != null ? `$${parseFloat(type.price).toFixed(2)}` : 'N/A'
    },
    {
      key: 'deliveryDays',
      header: 'Entrega',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      renderCell: (type) => `${type.minDays || '-'}-${type.maxDays || '-'} días`
    },
    {
      key: 'packageConfig',
      header: 'Config. paquete',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      renderCell: (type) => (
        <span className="badge bg-light text-dark border">
          <i className="bi bi-box me-1"></i>
          {type.maxPackageWeight || '-'} kg / {type.maxProductsPerPackage || '-'} u.
        </span>
      )
    },
    {
      key: 'actions',
      header: '', // Sin título para acciones
      cellClassName: 'text-end',
      renderCell: (type) => (
        <ActionButtonsContainer size="sm">
          <ActionButton
            iconClass="bi bi-trash"
            title="Eliminar método"
            onClick={() => handleRemoveShippingType(type.id)}
            variant="light"
            textColor="secondary"
            hoverTextColor="danger"
            isLast={true}
          />
        </ActionButtonsContainer>
      )
    }
  ], [handleRemoveShippingType]); // Dependencia para que el botón use la última versión del callback

  return (
    <div className="py-3"> 

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="text-dark mb-0">Opciones de envío disponibles</h6>
        <button 
          type="button" 
          className={`btn btn-sm ${showAddForm ? 'btn-outline-secondary' : 'btn-outline-dark'}`} 
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) setValidationErrors({});
          }}
        >
          <i className={`bi bi-${showAddForm ? 'x-lg' : 'plus-lg'}`}></i>
          {showAddForm ? ' Cancelar' : ' Añadir opción'}
        </button>
      </div>
      
      {showAddForm && (
        <div className="border rounded p-3 mb-4 bg-light">
          <h6 className="mb-3">Nuevo Método de Envío</h6>
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
          <div className="d-flex justify-content-end mt-3">
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleAddShippingType}
            >
              Guardar Método
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <DataTable
          data={shippingTypes}
          columns={columns}
          keyExtractor={(type) => type.id}
          emptyStateTitle="No hay opciones de envío configuradas"
          emptyStateMessage="Añade tu primera opción de envío usando el botón de arriba."
        />
      </div>

      {formErrors?.shippingTypes && (
        <div className="alert alert-danger mt-3 mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {formErrors.shippingTypes.message}
        </div>
      )}
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