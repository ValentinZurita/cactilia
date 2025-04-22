import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Importar los componentes del formulario que necesita
import { 
  ServiceBasicInfo, 
  DeliveryDetails, 
  PackageConfiguration 
} from './index'; // Asume que index.js exporta estos

// Importar la función para generar códigos únicos (si se usa aquí)
// import { generateUniqueCode } from '../../utils/shippingUtils'; // Ajusta la ruta si existe

const AddShippingMethodManualModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  availableCarriers // Recibe los carriers disponibles
}) => {

  // Estado interno para el formulario y errores
  const [validationErrors, setValidationErrors] = useState({});
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

  // Limpiar formulario y errores cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      // Resetear al cerrar
      setNewShippingType({
        carrier: '', label: '', price: '', minDays: '1', maxDays: '3',
        maxPackageWeight: '20', extraWeightCost: '10', maxProductsPerPackage: '10'
      });
      setValidationErrors({});
    } else {
      // Opcional: Enfocar primer campo al abrir (requiere ref)
    }
  }, [isOpen]);

  // Maneja el cambio en los campos del formulario
  const handleNewTypeChange = (e) => {
    const { name, value } = e.target;
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    setNewShippingType(prev => ({ ...prev, [name]: value }));
  };

  // Función simple para generar código único (ajustar si es necesario)
  const generateUniqueCode = (carrier, label) => {
    if (!carrier || !label) return '_';
    const carrierPrefix = carrier.substring(0, 3).toLowerCase();
    const labelPrefix = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').substring(0, 10);
    return `${carrierPrefix}_${labelPrefix}`;
  };

  // Validar campos (misma lógica que antes)
  const validateShippingType = () => {
    const errors = {};
    if (!newShippingType.carrier) errors.carrier = 'El servicio es requerido';
    if (!newShippingType.label) errors.label = 'El nombre es requerido';
    if (!newShippingType.price) errors.price = 'El precio es requerido';
    if (newShippingType.price && (isNaN(parseFloat(newShippingType.price)) || parseFloat(newShippingType.price) < 0)) {
      errors.price = 'El precio debe ser un número positivo';
    }
    const minDays = parseInt(newShippingType.minDays) || 1;
    const maxDays = parseInt(newShippingType.maxDays) || minDays;
    if (minDays < 0) errors.minDays = 'Debe ser positivo';
    if (maxDays < minDays) errors.maxDays = 'Debe ser mayor o igual al mínimo';
    if (newShippingType.maxPackageWeight && parseFloat(newShippingType.maxPackageWeight) < 0) errors.maxPackageWeight = 'Debe ser positivo';
    if (newShippingType.extraWeightCost && parseFloat(newShippingType.extraWeightCost) < 0) errors.extraWeightCost = 'Debe ser positivo';
    if (newShippingType.maxProductsPerPackage && parseInt(newShippingType.maxProductsPerPackage) < 0) errors.maxProductsPerPackage = 'Debe ser positivo';
    return errors;
  };

  // Maneja el guardado interno
  const handleInternalSave = () => {
    const errors = validateShippingType();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Preparar datos para enviar a DeliverySection (sin el ID)
    const dataToSave = {
      carrier: newShippingType.carrier,
      // Generar el nombre único aquí
      name: generateUniqueCode(newShippingType.carrier, newShippingType.label),
      label: newShippingType.label,
      price: parseFloat(newShippingType.price) || 0,
      minDays: parseInt(newShippingType.minDays) || 1,
      maxDays: parseInt(newShippingType.maxDays) || parseInt(newShippingType.minDays) || 1,
      maxPackageWeight: parseFloat(newShippingType.maxPackageWeight) || 20,
      extraWeightCost: parseFloat(newShippingType.extraWeightCost) || 10,
      maxProductsPerPackage: parseInt(newShippingType.maxProductsPerPackage) || 10
    };

    onSave(dataToSave); // Llama al onSave de DeliverySection
    // El reset se hace en el useEffect al cambiar isOpen
  };

  // --- Renderizado del Modal Manual ---
  if (!isOpen) return null; // No renderizar nada si está cerrado

  return (
    <>
      <div 
        className={`modal fade ${isOpen ? 'show' : ''}`}
        tabIndex="-1" 
        style={{ display: isOpen ? 'block' : 'none' }} 
        aria-modal="true" 
        role="dialog"
      >
        <div className="modal-dialog modal-lg"> {/* Tamaño del modal */}
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nuevo Método de Envío</h5>
              <button 
                type="button" 
                className="btn-close" 
                aria-label="Close" 
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {/* Componentes del formulario */}
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
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={onClose}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-dark" 
                onClick={handleInternalSave}
              >
                Guardar Método
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Backdrop (fondo oscuro) */}
      {isOpen && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

AddShippingMethodManualModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  availableCarriers: PropTypes.array.isRequired,
};

export default AddShippingMethodManualModal; 