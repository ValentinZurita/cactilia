import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para la configuración de métodos de envío disponibles
 */
const DeliverySection = ({ control, errors, watch, setValue }) => {
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
  
  // Estado para el formulario de añadir tipo de envío
  const [newShippingType, setNewShippingType] = useState({
    carrier: '',
    label: '',
    price: '',
    minDays: '1',
    maxDays: '3'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Maneja el cambio en los campos del nuevo tipo de envío
  const handleNewTypeChange = (e) => {
    const { name, value } = e.target;
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
  
  // Añade un nuevo tipo de envío
  const handleAddShippingType = () => {
    if (!newShippingType.carrier || !newShippingType.label || !newShippingType.price) {
      return; // Validación básica
    }
    
    // Validar rango de días
    const minDays = parseInt(newShippingType.minDays) || 1;
    const maxDays = parseInt(newShippingType.maxDays) || minDays;
    
    if (maxDays < minDays) {
      alert('El máximo de días debe ser mayor o igual al mínimo');
      return;
    }
    
    // Generar código único
    const code = generateUniqueCode(newShippingType.carrier, newShippingType.label);
    
    const updatedTypes = [
      ...shippingTypes,
      {
        id: Date.now().toString(), // ID único
        carrier: newShippingType.carrier,
        name: code,
        label: newShippingType.label,
        price: parseFloat(newShippingType.price),
        minDays,
        maxDays
      }
    ];
    
    setValue('shippingTypes', updatedTypes);
    
    // Resetear el formulario manteniendo el carrier seleccionado
    setNewShippingType({
      carrier: newShippingType.carrier,
      label: '',
      price: '',
      minDays: '1',
      maxDays: '3'
    });
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
              <div className="mb-3">
                <label className="form-label fw-medium mb-2">1. Servicio de mensajería</label>
                <select
                  className="form-select"
                  name="carrier"
                  value={newShippingType.carrier}
                  onChange={handleNewTypeChange}
                >
                  <option value="">Seleccionar servicio...</option>
                  {availableCarriers.map(carrier => (
                    <option key={carrier} value={carrier}>{carrier}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-medium mb-2">2. Nombre para el cliente</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Envío Express 24h"
                  name="label"
                  value={newShippingType.label}
                  onChange={handleNewTypeChange}
                />
                <div className="form-text">
                  Nombre mostrado al cliente en checkout
                </div>
              </div>
              
              <div className="row g-4 mb-4">
                <div className="col-md-5">
                  <label className="form-label fw-medium mb-2">3. Precio</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Ej: 99.90"
                      name="price"
                      value={newShippingType.price}
                      onChange={handleNewTypeChange}
                    />
                    <span className="input-group-text">MXN</span>
                  </div>
                </div>
                <div className="col-md-7">
                  <label className="form-label fw-medium mb-2">4. Tiempo de entrega</label>
                  <div className="row g-2">
                    <div className="col-sm-5">
                      <div className="input-group">
                        <span className="input-group-text">De</span>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="1"
                          name="minDays"
                          value={newShippingType.minDays}
                          onChange={handleNewTypeChange}
                        />
                      </div>
                    </div>
                    <div className="col-sm-7">
                      <div className="input-group">
                        <span className="input-group-text">a</span>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="3"
                          name="maxDays"
                          value={newShippingType.maxDays}
                          onChange={handleNewTypeChange}
                        />
                        <span className="input-group-text">días</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
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
            <div>
              {shippingTypes.length === 0 ? (
                <div className="text-center text-muted py-4 bg-light rounded">
                  <i className="bi bi-box me-2"></i>
                  No hay opciones de envío configuradas
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover bg-white">
                    <thead className="table-light">
                      <tr>
                        <th>Servicio</th>
                        <th>Nombre</th>
                        <th className="text-end">Precio</th>
                        <th className="text-center">Entrega</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shippingTypes.map(type => (
                        <tr key={type.id}>
                          <td>{type.carrier}</td>
                          <td>{type.label}</td>
                          <td className="text-end">${type.price.toFixed(2)}</td>
                          <td className="text-center">
                            {type.minDays === type.maxDays
                              ? `${type.minDays} día${type.minDays !== 1 ? 's' : ''}`
                              : `${type.minDays}-${type.maxDays} días`}
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleRemoveShippingType(type.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Mensaje informativo */}
              {shippingTypes.length > 0 && (
                <div className="form-text mt-2">
                  <i className="bi bi-info-circle me-1"></i>
                  Los clientes podrán elegir entre estas opciones durante el checkout.
                </div>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default DeliverySection; 