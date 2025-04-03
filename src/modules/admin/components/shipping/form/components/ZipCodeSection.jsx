import React, { useState } from 'react';
import { PREFIJOS_ESTADOS } from '../../../../utils/shippingRuleResolver';

// Convertir el objeto de prefijos a una lista para el select
const ESTADOS_MEXICO = Object.keys(PREFIJOS_ESTADOS).map(code => ({
  value: code,
  label: `${code} - ${getStateNameFromCode(code)}`
}));

// Función auxiliar para obtener el nombre del estado a partir del código
function getStateNameFromCode(code) {
  const stateNames = {
    'AGU': 'Aguascalientes',
    'BCN': 'Baja California Norte',
    'BCS': 'Baja California Sur',
    'CAM': 'Campeche',
    'CHP': 'Chiapas',
    'CHH': 'Chihuahua',
    'CMX': 'Ciudad de México',
    'COA': 'Coahuila',
    'COL': 'Colima',
    'DUR': 'Durango',
    'GUA': 'Guanajuato',
    'GRO': 'Guerrero',
    'HID': 'Hidalgo',
    'JAL': 'Jalisco',
    'MEX': 'Estado de México',
    'MIC': 'Michoacán',
    'MOR': 'Morelos',
    'NAY': 'Nayarit',
    'NLE': 'Nuevo León',
    'OAX': 'Oaxaca',
    'PUE': 'Puebla',
    'QUE': 'Querétaro',
    'ROO': 'Quintana Roo',
    'SLP': 'San Luis Potosí',
    'SIN': 'Sinaloa',
    'SON': 'Sonora',
    'TAB': 'Tabasco',
    'TAM': 'Tamaulipas',
    'TLA': 'Tlaxcala',
    'VER': 'Veracruz',
    'YUC': 'Yucatán',
    'ZAC': 'Zacatecas'
  };
  return stateNames[code] || code;
}

// Tipos de cobertura
const TIPOS_COBERTURA = {
  NACIONAL: 'nacional',
  ESTATAL: 'estatal',
  ESPECIFICO: 'especifico'
};

const ZipCodeSection = ({ zipCodes = [], setZipCodes, setValue }) => {
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [coberturaTipo, setCoberturaTipo] = useState(
    zipCodes.includes('nacional') 
      ? TIPOS_COBERTURA.NACIONAL 
      : zipCodes.some(code => code.startsWith('estado_')) 
        ? TIPOS_COBERTURA.ESTATAL 
        : TIPOS_COBERTURA.ESPECIFICO
  );
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  // Maneja el cambio de tipo de cobertura
  const handleCoberturaChange = (e) => {
    const tipo = e.target.value;
    setCoberturaTipo(tipo);
    
    // Resetear errores
    setErrorMsg('');
    
    // Si cambiamos a cobertura nacional, limpiar todos los demás códigos
    if (tipo === TIPOS_COBERTURA.NACIONAL) {
      setZipCodes(['nacional']);
      setValue('zipcodes', ['nacional']);
    } 
    // Si cambiamos desde nacional a otro tipo, limpiar 'nacional'
    else if (zipCodes.includes('nacional')) {
      setZipCodes([]);
      setValue('zipcodes', []);
    }
  };

  // Configura cobertura nacional
  const handleSetNacional = () => {
    setZipCodes(['nacional']);
    setValue('zipcodes', ['nacional']);
    setErrorMsg('');
  };

  // Agrega un estado a la cobertura
  const handleAddEstado = () => {
    if (!estadoSeleccionado) {
      setErrorMsg('Seleccione un estado');
      return;
    }

    const estadoCode = `estado_${estadoSeleccionado}`;
    
    // Verificar si ya existe este estado
    if (zipCodes.includes(estadoCode)) {
      setErrorMsg(`El estado ${getStateNameFromCode(estadoSeleccionado)} ya está en la lista`);
      return;
    }
    
    // Verificar si hay códigos postales que pertenecen a este estado
    // Esto requeriría validar cada código postal, lo cual es complejo para este ejemplo
    // Idealmente, implementaríamos una función completa de validación
    
    const updatedZipCodes = [...zipCodes, estadoCode];
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
    setEstadoSeleccionado('');
    setErrorMsg('');
  };

  // Maneja la adición de códigos postales específicos
  const handleAddZipCode = () => {
    if (!inputValue.trim()) {
      setErrorMsg('Ingrese al menos un código postal');
      return;
    }
    
    // Dividir la entrada por comas y procesar cada código postal
    const newCodes = inputValue.split(',').map(code => code.trim());
    let hasErrors = false;
    let addedCodes = 0;
    let errorMessages = [];
    
    // Validar y agregar cada código postal
    for (const code of newCodes) {
      // Validar formato (5 dígitos o "nacional")
      if (!/^\d{5}$/.test(code) && code !== 'nacional') {
        errorMessages.push(`"${code}" no es un código postal válido (debe tener 5 dígitos)`);
        hasErrors = true;
        continue;
      }
      
      // Verificar si ya existe
      if (zipCodes.includes(code)) {
        errorMessages.push(`El código postal "${code}" ya está en la lista`);
        hasErrors = true;
        continue;
      }
      
      // Si llegamos aquí, el código es válido
      zipCodes.push(code);
      addedCodes++;
    }
    
    // Actualizar el estado
    if (addedCodes > 0) {
      setZipCodes([...zipCodes]);
      setValue('zipcodes', [...zipCodes]);
    }
    
    // Mostrar errores si los hay
    if (hasErrors) {
      setErrorMsg(errorMessages.join('. '));
    } else {
      setErrorMsg('');
    }
    
    // Limpiar el input
    setInputValue('');
  };

  // Maneja la tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (coberturaTipo === TIPOS_COBERTURA.ESPECIFICO) {
        handleAddZipCode();
      } else if (coberturaTipo === TIPOS_COBERTURA.ESTATAL) {
        handleAddEstado();
      }
    }
  };

  // Elimina un código postal
  const handleRemoveZipCode = (zipCodeToRemove) => {
    const updatedZipCodes = zipCodes.filter((code) => code !== zipCodeToRemove);
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
  };

  // Obtiene el nombre para mostrar y clase para el badge según el tipo de código
  const getZipCodeDisplay = (zipCode) => {
    let displayText = zipCode;
    let badgeClass = 'bg-light text-dark';
    let iconClass = 'bi-geo-alt';
    
    if (zipCode === 'nacional') {
      displayText = 'Cobertura Nacional';
      badgeClass = 'bg-primary text-white';
      iconClass = 'bi-globe';
    } else if (zipCode.startsWith('estado_')) {
      const estadoCode = zipCode.replace('estado_', '');
      displayText = `Estado: ${getStateNameFromCode(estadoCode)}`;
      badgeClass = 'bg-info text-dark';
      iconClass = 'bi-map';
    }
    
    return { displayText, badgeClass, iconClass };
  };

  return (
    <div className="zip-code-section mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label text-secondary fw-medium mb-0">
          Zonas de cobertura 
          {zipCodes.length > 0 && (
            <span className="badge bg-success rounded-pill ms-2">
              {zipCodes.length}
            </span>
          )}
        </label>
        
        <span className="text-muted" style={{ cursor: 'help' }} title="Las zonas de cobertura determinan en qué lugares se aplicará esta regla de envío">
          <i className="bi bi-info-circle"></i>
        </span>
      </div>

      <div className="btn-group mb-3 w-100" role="group">
        <input 
          type="radio" 
          className="btn-check" 
          name="coberturaTipo" 
          id="tipo-nacional" 
          value={TIPOS_COBERTURA.NACIONAL}
          checked={coberturaTipo === TIPOS_COBERTURA.NACIONAL}
          onChange={handleCoberturaChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="tipo-nacional">
          <i className="bi bi-globe me-1"></i> Nacional
        </label>
        
        <input 
          type="radio" 
          className="btn-check" 
          name="coberturaTipo" 
          id="tipo-estatal" 
          value={TIPOS_COBERTURA.ESTATAL}
          checked={coberturaTipo === TIPOS_COBERTURA.ESTATAL}
          onChange={handleCoberturaChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="tipo-estatal">
          <i className="bi bi-map me-1"></i> Por Estado
        </label>
        
        <input 
          type="radio" 
          className="btn-check" 
          name="coberturaTipo" 
          id="tipo-especifico" 
          value={TIPOS_COBERTURA.ESPECIFICO}
          checked={coberturaTipo === TIPOS_COBERTURA.ESPECIFICO}
          onChange={handleCoberturaChange}
        />
        <label className="btn btn-outline-secondary" htmlFor="tipo-especifico">
          <i className="bi bi-geo-alt me-1"></i> Códigos específicos
        </label>
      </div>

      {coberturaTipo === TIPOS_COBERTURA.NACIONAL && (
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="alert-heading mb-1"><i className="bi bi-globe me-2"></i>Cobertura Nacional</h6>
            <p className="mb-0 small">Esta regla se aplicará en todo el país, a menos que exista otra regla más específica (por estado o código postal).</p>
          </div>
          {!zipCodes.includes('nacional') && (
            <button 
              type="button" 
              className="btn btn-sm btn-primary" 
              onClick={handleSetNacional}
            >
              Configurar Nacional
            </button>
          )}
        </div>
      )}

      {coberturaTipo === TIPOS_COBERTURA.ESTATAL && (
        <div className="d-flex mb-3 gap-2">
          <select
            className="form-select"
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
          >
            <option value="">Seleccione un estado...</option>
            {ESTADOS_MEXICO.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
          <button 
            type="button" 
            className="btn btn-primary d-flex align-items-center" 
            onClick={handleAddEstado}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Agregar
          </button>
        </div>
      )}

      {coberturaTipo === TIPOS_COBERTURA.ESPECIFICO && (
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Ingrese códigos postales separados por comas (ej: 86610, 86612)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            type="button" 
            className="btn btn-primary d-flex align-items-center" 
            onClick={handleAddZipCode}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Agregar
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger py-2 mb-3 small">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMsg}
        </div>
      )}

      {zipCodes.length > 0 && (
        <>
          <div className="mt-3 mb-2">
            <span className="text-secondary small fw-medium">Zonas configuradas</span>
            <hr className="mt-1 mb-3" />
          </div>
          
          <div className="d-flex flex-wrap gap-2 mb-3">
            {zipCodes.map((zipCode, index) => {
              const { displayText, badgeClass, iconClass } = getZipCodeDisplay(zipCode);
              return (
                <div 
                  key={index} 
                  className={`badge ${badgeClass} d-flex align-items-center px-3 py-2`}
                >
                  <i className={`bi ${iconClass} me-1`}></i>
                  <span>{displayText}</span>
                  <button 
                    type="button" 
                    className="btn-close ms-2" 
                    style={{ fontSize: '0.65rem' }} 
                    onClick={() => handleRemoveZipCode(zipCode)}
                    aria-label="Eliminar"
                  ></button>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="text-muted small mt-2">
        <i className="bi bi-info-circle me-1"></i>
        Las reglas de prioridad son: 1) Código postal específico, 2) Estado, 3) Nacional
      </div>
    </div>
  );
};

export default ZipCodeSection; 