import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { AVAILABLE_CARRIERS, DELIVERY_TIME_OPTIONS } from '../../constants';
import { formatPrice } from '../../utils';

/**
 * Componente para configurar los métodos de envío disponibles
 * @param {object} control - Control de react-hook-form
 * @param {object} errors - Errores de validación
 * @param {object} watch - Función para observar valores
 * @param {function} setValue - Función para establecer valores
 */
const MethodsSection = ({ control, errors, watch, setValue }) => {
  // Obtener valores actuales
  const shippingOptions = watch('opciones_mensajeria') || [];
  const freeShipping = watch('freeShipping') || false;
  
  // Estado para formulario temporal de nueva opción
  const [newOption, setNewOption] = useState({
    nombre: '',
    tiempo: '',
    precio: '',
    mensajeria: ''
  });
  
  // Estado para mostrar/ocultar formulario de nueva opción
  const [showForm, setShowForm] = useState(false);
  
  // Manejar cambios en el formulario de nueva opción
  const handleNewOptionChange = (field, value) => {
    setNewOption(prev => ({ ...prev, [field]: value }));
  };
  
  // Validar nueva opción
  const validateNewOption = () => {
    const { nombre, tiempo, precio, mensajeria } = newOption;
    
    if (!nombre || nombre.length < 2) {
      return 'El nombre es obligatorio y debe tener al menos 2 caracteres';
    }
    
    if (!tiempo) {
      return 'El tiempo de entrega es obligatorio';
    }
    
    if (!mensajeria) {
      return 'La mensajería es obligatoria';
    }
    
    if (!freeShipping) {
      if (!precio || isNaN(precio) || parseFloat(precio) < 0) {
        return 'El precio debe ser un número válido mayor o igual a 0';
      }
    }
    
    return null; // Sin errores
  };
  
  // Agregar nueva opción
  const addShippingOption = () => {
    const error = validateNewOption();
    
    if (error) {
      alert(error);
      return;
    }
    
    // Crear nueva opción con precio como número
    const newShippingOption = {
      ...newOption,
      precio: parseFloat(newOption.precio) || 0
    };
    
    // Actualizar opciones de envío
    setValue('opciones_mensajeria', [...shippingOptions, newShippingOption]);
    
    // Reiniciar formulario
    setNewOption({
      nombre: '',
      tiempo: '',
      precio: '',
      mensajeria: ''
    });
    
    // Ocultar formulario
    setShowForm(false);
  };
  
  // Eliminar opción
  const removeShippingOption = (index) => {
    const updatedOptions = [...shippingOptions];
    updatedOptions.splice(index, 1);
    setValue('opciones_mensajeria', updatedOptions);
  };
  
  return (
    <section className="shipping-methods-section py-3">
      <h6 className="text-dark mb-4">Opciones de envío disponibles</h6>
      
      <div className="alert alert-light border small py-2 mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Configura los métodos de envío que estarán disponibles para esta zona durante el checkout.
        {freeShipping && (
          <div className="text-danger mt-1">
            <i className="bi bi-exclamation-triangle-fill me-1"></i>
            Esta zona tiene envío gratuito activado, por lo que el precio de los métodos será ignorado.
          </div>
        )}
      </div>
      
      {/* Lista de opciones de envío */}
      {shippingOptions.length > 0 ? (
        <div className="mb-4">
          <div className="list-group mb-3">
            {shippingOptions.map((option, index) => (
              <div 
                key={index} 
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 className="mb-1">{option.nombre}</h6>
                  <p className="mb-0 small text-muted">
                    <span className="me-3">
                      <i className="bi bi-truck me-1"></i>
                      {option.mensajeria}
                    </span>
                    <span className="me-3">
                      <i className="bi bi-clock me-1"></i>
                      {option.tiempo}
                    </span>
                    <span>
                      <i className="bi bi-tag me-1"></i>
                      {formatPrice(option.precio)}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-3"
                  onClick={() => removeShippingOption(index)}
                  aria-label={`Eliminar opción ${option.nombre}`}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          No hay opciones de envío configuradas. Añade al menos una opción.
        </div>
      )}
      
      {/* Mostrar formulario o botón para agregar */}
      {showForm ? (
        <div className="card border mb-4">
          <div className="card-header bg-light py-2">
            <h6 className="mb-0">Nueva opción de envío</h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {/* Nombre del servicio */}
              <div className="col-md-6">
                <label htmlFor="nombre" className="form-label">
                  Nombre del servicio <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  placeholder="ej: Estándar, Express, etc."
                  value={newOption.nombre}
                  onChange={(e) => handleNewOptionChange('nombre', e.target.value)}
                />
              </div>
              
              {/* Mensajería */}
              <div className="col-md-6">
                <label htmlFor="mensajeria" className="form-label">
                  Mensajería <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="mensajeria"
                  value={newOption.mensajeria}
                  onChange={(e) => handleNewOptionChange('mensajeria', e.target.value)}
                >
                  <option value="">Seleccionar mensajería...</option>
                  {AVAILABLE_CARRIERS.map(carrier => (
                    <option key={carrier} value={carrier}>
                      {carrier}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Tiempo de entrega */}
              <div className="col-md-6">
                <label htmlFor="tiempo" className="form-label">
                  Tiempo de entrega <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="tiempo"
                  value={newOption.tiempo}
                  onChange={(e) => handleNewOptionChange('tiempo', e.target.value)}
                >
                  <option value="">Seleccionar tiempo...</option>
                  {DELIVERY_TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Precio */}
              <div className="col-md-6">
                <label htmlFor="precio" className="form-label">
                  Precio {!freeShipping && <span className="text-danger">*</span>}
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    id="precio"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={newOption.precio}
                    onChange={(e) => handleNewOptionChange('precio', e.target.value)}
                    disabled={freeShipping}
                  />
                  <span className="input-group-text">MXN</span>
                </div>
                {freeShipping && (
                  <div className="form-text text-muted">
                    El envío es gratuito, el precio no se aplicará.
                  </div>
                )}
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="d-flex gap-2 mt-4">
              <button
                type="button"
                className="btn btn-dark"
                onClick={addShippingOption}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Agregar
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <button
            type="button"
            className="btn btn-outline-dark rounded-3"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Añadir opción
          </button>
        </div>
      )}
      
      {/* Input oculto para integración con react-hook-form */}
      <Controller
        control={control}
        name="opciones_mensajeria"
        rules={{ 
          validate: value => 
            (value && value.length > 0) || 
            'Debe configurar al menos una opción de envío'
        }}
        render={({ field }) => (
          <input 
            type="hidden" 
            {...field} 
            value={JSON.stringify(field.value || [])} 
          />
        )}
      />
      
      {/* Mostrar error de validación */}
      {errors?.opciones_mensajeria && (
        <div className="alert alert-danger mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errors.opciones_mensajeria.message}
        </div>
      )}
    </section>
  );
};

MethodsSection.propTypes = {
  /** Control de react-hook-form */
  control: PropTypes.object.isRequired,
  /** Errores de validación */
  errors: PropTypes.object,
  /** Función para observar valores */
  watch: PropTypes.func.isRequired,
  /** Función para establecer valores */
  setValue: PropTypes.func.isRequired
};

export default MethodsSection; 