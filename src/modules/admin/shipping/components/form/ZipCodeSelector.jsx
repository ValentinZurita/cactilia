import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { FormField } from '../ui';
import { MEXICAN_STATES } from '../../constants';
import { isValidMexicanZipcode } from '../../utils';

/**
 * Componente para seleccionar la cobertura geográfica de una regla
 * @param {object} control - Control de react-hook-form
 * @param {object} errors - Errores de validación
 * @param {object} watch - Función para observar valores
 * @param {function} setValue - Función para establecer valores
 */
const ZipCodeSelector = ({ control, errors, watch, setValue }) => {
  // Estados locales
  const [selectedTab, setSelectedTab] = useState('nacional');
  const [zipCode, setZipCode] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');
  
  // Valores actuales
  const zipcodes = watch('zipcodes') || [];
  
  // Verificar qué tipo de cobertura está seleccionada
  const hasNational = zipcodes.includes('nacional');
  const hasStates = zipcodes.some(z => z.startsWith('estado_'));
  const hasZipcodes = zipcodes.some(z => !z.startsWith('estado_') && z !== 'nacional');
  
  // Listas filtradas
  const selectedStates = zipcodes.filter(z => z.startsWith('estado_'));
  const selectedZipcodes = zipcodes.filter(z => !z.startsWith('estado_') && z !== 'nacional');
  
  /**
   * Actualizar los zipcodes
   * @param {Array} newZipcodes - Nueva lista de códigos
   */
  const updateZipcodes = (newZipcodes) => {
    setValue('zipcodes', newZipcodes);
  };
  
  /**
   * Manejar selección de cobertura nacional
   * @param {boolean} checked - Si está seleccionado
   */
  const handleNationalChange = (checked) => {
    if (checked) {
      // Al seleccionar nacional, eliminar otros tipos
      updateZipcodes(['nacional']);
    } else {
      // Al deseleccionar, eliminar nacional
      updateZipcodes(zipcodes.filter(z => z !== 'nacional'));
    }
  };
  
  /**
   * Manejar cambios en selección de estados
   * @param {string} state - Estado seleccionado
   * @param {boolean} checked - Si está seleccionado
   */
  const handleStateChange = (state, checked) => {
    const stateId = `estado_${state}`;
    
    if (checked) {
      // Eliminar nacional si existe
      const newZipcodes = zipcodes.filter(z => z !== 'nacional');
      // Agregar el estado
      updateZipcodes([...newZipcodes, stateId]);
    } else {
      // Eliminar el estado
      updateZipcodes(zipcodes.filter(z => z !== stateId));
    }
  };
  
  /**
   * Agregar un código postal
   */
  const addZipCode = () => {
    // Validar formato
    if (!isValidMexicanZipcode(zipCode)) {
      setZipCodeError('Ingrese un código postal válido de 5 dígitos');
      return;
    }
    
    // Verificar si ya existe
    if (zipcodes.includes(zipCode)) {
      setZipCodeError('Este código postal ya está en la lista');
      return;
    }
    
    // Eliminar nacional si existe
    const newZipcodes = zipcodes.filter(z => z !== 'nacional');
    
    // Agregar código postal
    updateZipcodes([...newZipcodes, zipCode]);
    
    // Limpiar campo y error
    setZipCode('');
    setZipCodeError('');
  };
  
  /**
   * Eliminar un código postal
   * @param {string} zip - Código postal a eliminar
   */
  const removeZipCode = (zip) => {
    updateZipcodes(zipcodes.filter(z => z !== zip));
  };
  
  /**
   * Eliminar un estado
   * @param {string} stateId - ID del estado a eliminar
   */
  const removeState = (stateId) => {
    updateZipcodes(zipcodes.filter(z => z !== stateId));
  };
  
  return (
    <div className="zipcode-selector mb-4">
      {/* Pestañas para tipo de cobertura */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${selectedTab === 'nacional' ? 'active' : ''}`}
            onClick={() => setSelectedTab('nacional')}
          >
            Nacional
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${selectedTab === 'estados' ? 'active' : ''}`}
            onClick={() => setSelectedTab('estados')}
          >
            Por estados
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${selectedTab === 'cp' ? 'active' : ''}`}
            onClick={() => setSelectedTab('cp')}
          >
            Por código postal
          </button>
        </li>
      </ul>
      
      {/* Contenido según pestaña seleccionada */}
      <div className="tab-content p-3 border border-top-0 rounded-bottom mb-4">
        {/* Pestaña Nacional */}
        {selectedTab === 'nacional' && (
          <div className="nacional-tab">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="coberturaNacional"
                checked={hasNational}
                onChange={(e) => handleNationalChange(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="coberturaNacional">
                Cobertura en todo México
              </label>
              <div className="form-text">
                La regla aplicará a todos los códigos postales del país.
                {(hasStates || hasZipcodes) && (
                  <div className="text-danger mt-1">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Al seleccionar cobertura nacional, se eliminarán los estados y códigos postales seleccionados.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Pestaña Estados */}
        {selectedTab === 'estados' && (
          <div className="estados-tab">
            <div className="row">
              {MEXICAN_STATES.map(state => {
                const stateId = `estado_${state}`;
                const isSelected = selectedStates.includes(stateId);
                
                return (
                  <div key={state} className="col-md-4 mb-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`state_${state}`}
                        checked={isSelected}
                        onChange={(e) => handleStateChange(state, e.target.checked)}
                        disabled={hasNational}
                      />
                      <label className="form-check-label" htmlFor={`state_${state}`}>
                        {state}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {hasNational && (
              <div className="alert alert-warning mt-3" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                La cobertura nacional está activada. Desactívala para seleccionar estados específicos.
              </div>
            )}
            
            {selectedStates.length > 0 && (
              <div className="mt-3">
                <h6 className="mb-2">Estados seleccionados:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {selectedStates.map(stateId => {
                    const stateName = stateId.replace('estado_', '');
                    
                    return (
                      <span key={stateId} className="badge bg-secondary rounded-pill d-flex align-items-center">
                        {stateName}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.5rem' }}
                          onClick={() => removeState(stateId)}
                          aria-label={`Eliminar ${stateName}`}
                        ></button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Pestaña Códigos Postales */}
        {selectedTab === 'cp' && (
          <div className="cp-tab">
            <div className="mb-3">
              <label htmlFor="zipCode" className="form-label">
                Código postal
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${zipCodeError ? 'is-invalid' : ''}`}
                  id="zipCode"
                  placeholder="Ej: 06700"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={hasNational}
                  maxLength={5}
                />
                <button
                  className="btn btn-dark"
                  type="button"
                  onClick={addZipCode}
                  disabled={hasNational || !zipCode}
                >
                  Agregar
                </button>
              </div>
              {zipCodeError && (
                <div className="invalid-feedback d-block">{zipCodeError}</div>
              )}
              <div className="form-text">
                Ingrese códigos postales de 5 dígitos uno por uno.
              </div>
            </div>
            
            {hasNational && (
              <div className="alert alert-warning" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                La cobertura nacional está activada. Desactívala para agregar códigos postales.
              </div>
            )}
            
            {selectedZipcodes.length > 0 && (
              <div className="mt-3">
                <h6 className="mb-2">Códigos postales:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {selectedZipcodes.map(zip => (
                    <span key={zip} className="badge bg-secondary rounded-pill d-flex align-items-center">
                      {zip}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        style={{ fontSize: '0.5rem' }}
                        onClick={() => removeZipCode(zip)}
                        aria-label={`Eliminar ${zip}`}
                      ></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Resumen de cobertura */}
      <div className="coverage-summary">
        <h6 className="mb-2">Resumen de cobertura:</h6>
        
        {hasNational && (
          <div className="alert alert-info mb-3" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Cobertura nacional (todo México)
          </div>
        )}
        
        {selectedStates.length > 0 && (
          <div className="alert alert-info mb-3" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Cobertura en {selectedStates.length} {selectedStates.length === 1 ? 'estado' : 'estados'}
          </div>
        )}
        
        {selectedZipcodes.length > 0 && (
          <div className="alert alert-info mb-3" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Cobertura en {selectedZipcodes.length} {selectedZipcodes.length === 1 ? 'código postal' : 'códigos postales'}
          </div>
        )}
        
        {zipcodes.length === 0 && (
          <div className="alert alert-warning mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            No has seleccionado ninguna área de cobertura
          </div>
        )}
      </div>
      
      {/* Campo oculto para react-hook-form */}
      <Controller
        name="zipcodes"
        control={control}
        rules={{ 
          validate: value => 
            (value && value.length > 0) || 
            'Debe seleccionar al menos un área de cobertura'
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
      {errors?.zipcodes && (
        <div className="alert alert-danger mt-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errors.zipcodes.message}
        </div>
      )}
    </div>
  );
};

ZipCodeSelector.propTypes = {
  /** Control de react-hook-form */
  control: PropTypes.object.isRequired,
  /** Errores de validación */
  errors: PropTypes.object,
  /** Función para observar valores */
  watch: PropTypes.func.isRequired,
  /** Función para establecer valores */
  setValue: PropTypes.func.isRequired
};

export default ZipCodeSelector; 