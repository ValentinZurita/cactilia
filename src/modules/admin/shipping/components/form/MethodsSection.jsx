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
    mensajeria: '',
    usaRangosPeso: false,
    rangosPeso: []
  });
  
  // Estado para mostrar/ocultar formulario de nueva opción
  const [showForm, setShowForm] = useState(false);
  
  // Estado para edición de un rango de peso
  const [editingWeightRange, setEditingWeightRange] = useState({
    min: '',
    max: '',
    precio: ''
  });
  
  // Manejar cambios en el formulario de nueva opción
  const handleNewOptionChange = (field, value) => {
    setNewOption(prev => ({ ...prev, [field]: value }));
  };
  
  // Validar nueva opción
  const validateNewOption = () => {
    const { nombre, tiempo, precio, mensajeria, usaRangosPeso, rangosPeso } = newOption;
    
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
      if (usaRangosPeso) {
        // Validar que haya al menos un rango de peso configurado
        if (rangosPeso.length === 0) {
          return 'Debe configurar al menos un rango de peso';
        }
        
        // Validar que los rangos no se superpongan y cubran todo el espectro
        if (!validateWeightRanges(rangosPeso)) {
          return 'Los rangos de peso no son válidos. Verifica que no haya superposiciones ni huecos entre rangos.';
        }
      } else {
        // Validar precio base si no se usan rangos de peso
        if (!precio || isNaN(precio) || parseFloat(precio) < 0) {
          return 'El precio debe ser un número válido mayor o igual a 0';
        }
      }
    }
    
    return null; // Sin errores
  };
  
  // Validar que los rangos de peso sean válidos (sin superposiciones ni huecos)
  const validateWeightRanges = (ranges) => {
    if (ranges.length === 0) return false;
    
    // Ordenar los rangos por peso mínimo
    const sortedRanges = [...ranges].sort((a, b) => a.min - b.min);
    
    // Verificar que el primer rango empiece en 0
    if (sortedRanges[0].min !== 0) return false;
    
    // Verificar que no haya superposiciones ni huecos
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      if (sortedRanges[i].max !== sortedRanges[i + 1].min) {
        return false;
      }
    }
    
    return true;
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
      precio: parseFloat(newOption.precio) || 0,
      // Si no usa rangos de peso, asegurarse de que rangosPeso sea un array vacío
      rangosPeso: newOption.usaRangosPeso ? newOption.rangosPeso : []
    };
    
    // Actualizar opciones de envío
    setValue('opciones_mensajeria', [...shippingOptions, newShippingOption]);
    
    // Reiniciar formulario
    setNewOption({
      nombre: '',
      tiempo: '',
      precio: '',
      mensajeria: '',
      usaRangosPeso: false,
      rangosPeso: []
    });
    
    // Reiniciar formulario de rango de peso
    setEditingWeightRange({
      min: '',
      max: '',
      precio: ''
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
  
  // Agregar un rango de peso
  const addWeightRange = () => {
    const { min, max, precio } = editingWeightRange;
    
    // Validar el rango
    if (!min || !max || !precio || isNaN(min) || isNaN(max) || isNaN(precio)) {
      alert('Todos los campos son obligatorios y deben ser números válidos');
      return;
    }
    
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    const priceVal = parseFloat(precio);
    
    if (minVal < 0 || maxVal <= 0 || priceVal < 0) {
      alert('Los valores deben ser mayores a 0');
      return;
    }
    
    if (minVal >= maxVal) {
      alert('El peso mínimo debe ser menor que el peso máximo');
      return;
    }
    
    // Verificar que el nuevo rango no se superponga con los existentes
    const existingRanges = [...newOption.rangosPeso];
    for (const range of existingRanges) {
      if ((minVal >= range.min && minVal < range.max) || 
          (maxVal > range.min && maxVal <= range.max) ||
          (minVal <= range.min && maxVal >= range.max)) {
        alert('El rango se superpone con uno existente');
        return;
      }
    }
    
    // Agregar el nuevo rango
    const updatedRanges = [
      ...existingRanges,
      { min: minVal, max: maxVal, precio: priceVal }
    ];
    
    // Actualizar el estado
    setNewOption(prev => ({
      ...prev,
      rangosPeso: updatedRanges
    }));
    
    // Reiniciar formulario de rango
    setEditingWeightRange({
      min: '',
      max: '',
      precio: ''
    });
  };
  
  // Eliminar un rango de peso
  const removeWeightRange = (index) => {
    const updatedRanges = [...newOption.rangosPeso];
    updatedRanges.splice(index, 1);
    
    setNewOption(prev => ({
      ...prev,
      rangosPeso: updatedRanges
    }));
  };
  
  // Manejar cambios en el formulario de rango de peso
  const handleWeightRangeChange = (field, value) => {
    setEditingWeightRange(prev => ({
      ...prev,
      [field]: value
    }));
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
                    {option.usaRangosPeso ? (
                      <span>
                        <i className="bi bi-tag me-1"></i>
                        Precios por rango de peso ({option.rangosPeso?.length || 0} rangos)
                      </span>
                    ) : (
                      <span>
                        <i className="bi bi-tag me-1"></i>
                        {formatPrice(option.precio)}
                      </span>
                    )}
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
              
              {/* Precio base o por rangos de peso */}
              <div className="col-md-6">
                <label htmlFor="usaRangosPeso" className="form-label d-block">
                  Configuración de precio
                </label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="precioConfig"
                    id="precioPorServicio"
                    checked={!newOption.usaRangosPeso}
                    onChange={() => handleNewOptionChange('usaRangosPeso', false)}
                    disabled={freeShipping}
                  />
                  <label className="form-check-label" htmlFor="precioPorServicio">
                    Precio fijo
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="precioConfig"
                    id="precioPorPeso"
                    checked={newOption.usaRangosPeso}
                    onChange={() => handleNewOptionChange('usaRangosPeso', true)}
                    disabled={freeShipping}
                  />
                  <label className="form-check-label" htmlFor="precioPorPeso">
                    Precio por rangos de peso
                  </label>
                </div>
              </div>
              
              {/* Precio fijo (si no usa rangos de peso) */}
              {!newOption.usaRangosPeso && (
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
              )}
              
              {/* Configuración de rangos de peso (si usa rangos de peso) */}
              {newOption.usaRangosPeso && !freeShipping && (
                <div className="col-12">
                  <div className="card border bg-light mt-3">
                    <div className="card-header py-2">
                      <h6 className="mb-0">Rangos de peso</h6>
                    </div>
                    <div className="card-body">
                      {/* Lista de rangos configurados */}
                      {newOption.rangosPeso.length > 0 ? (
                        <div className="mb-3">
                          <div className="table-responsive">
                            <table className="table table-sm table-striped">
                              <thead>
                                <tr>
                                  <th>Peso mínimo (kg)</th>
                                  <th>Peso máximo (kg)</th>
                                  <th>Precio (MXN)</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {newOption.rangosPeso
                                  .sort((a, b) => a.min - b.min)
                                  .map((range, idx) => (
                                    <tr key={idx}>
                                      <td>{range.min.toFixed(2)}</td>
                                      <td>{range.max.toFixed(2)}</td>
                                      <td>${range.precio.toFixed(2)}</td>
                                      <td>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => removeWeightRange(idx)}
                                          aria-label="Eliminar rango"
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-warning mb-3">
                          No se han configurado rangos de peso. Agrega al menos uno.
                        </div>
                      )}
                      
                      {/* Formulario para agregar nuevo rango */}
                      <div className="row g-2">
                        <div className="col-md-3">
                          <label htmlFor="minWeight" className="form-label">Peso mínimo (kg)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="minWeight"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={editingWeightRange.min}
                            onChange={(e) => handleWeightRangeChange('min', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label htmlFor="maxWeight" className="form-label">Peso máximo (kg)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="maxWeight"
                            step="0.01"
                            min="0.01"
                            placeholder="5.00"
                            value={editingWeightRange.max}
                            onChange={(e) => handleWeightRangeChange('max', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label htmlFor="rangePrice" className="form-label">Precio (MXN)</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              type="number"
                              className="form-control"
                              id="rangePrice"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={editingWeightRange.precio}
                              onChange={(e) => handleWeightRangeChange('precio', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-outline-primary w-100"
                            onClick={addWeightRange}
                          >
                            <i className="bi bi-plus-circle me-1"></i>
                            Agregar rango
                          </button>
                        </div>
                      </div>
                      
                      <div className="form-text mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Configura rangos de peso consecutivos. Ejemplo: 0-1kg ($100), 1-5kg ($150), 5-10kg ($200).
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="d-flex gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowForm(false);
                  setNewOption({
                    nombre: '',
                    tiempo: '',
                    precio: '',
                    mensajeria: '',
                    usaRangosPeso: false,
                    rangosPeso: []
                  });
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addShippingOption}
              >
                Agregar opción
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setShowForm(true)}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Agregar opción de envío
        </button>
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