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
    // (implementación simplificada)
    
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

  // Obtiene el nombre para mostrar y estilo para cada código
  const getZipCodeDisplay = (zipCode) => {
    let displayText = zipCode;
    let badgeClass = '';
    let iconClass = 'geo-alt';
    let btnCloseClass = '';
    
    if (zipCode === 'nacional') {
      displayText = 'Todo México';
      badgeClass = 'bg-dark';
      iconClass = 'globe';
      btnCloseClass = 'btn-close-white';
    } else if (zipCode.startsWith('estado_')) {
      const estadoCode = zipCode.replace('estado_', '');
      displayText = `${getStateNameFromCode(estadoCode)}`;
      badgeClass = 'bg-secondary';
      iconClass = 'map';
      btnCloseClass = 'btn-close-white';
    } else {
      badgeClass = 'bg-light text-dark border';
      btnCloseClass = '';
    }
    
    return { displayText, badgeClass, iconClass, btnCloseClass };
  };

  return (
    <div className="mb-4">
      {/* Selector de tipo de cobertura */}
      <div className="card border-0 bg-light mb-4">
        <div className="card-body">
          <label className="form-label fw-medium mb-3">Tipo de cobertura:</label>
          
          <div className="d-flex flex-wrap gap-3 mb-3">
            <div className="form-check form-check-inline mb-0">
              <input 
                type="radio" 
                className="form-check-input" 
                name="coberturaTipo" 
                id="tipo-nacional" 
                value={TIPOS_COBERTURA.NACIONAL}
                checked={coberturaTipo === TIPOS_COBERTURA.NACIONAL}
                onChange={handleCoberturaChange}
              />
              <label className="form-check-label fw-medium" htmlFor="tipo-nacional">
                <i className="bi bi-globe me-1"></i> Nacional
              </label>
            </div>
            
            <div className="form-check form-check-inline mb-0">
              <input 
                type="radio" 
                className="form-check-input" 
                name="coberturaTipo" 
                id="tipo-estatal" 
                value={TIPOS_COBERTURA.ESTATAL}
                checked={coberturaTipo === TIPOS_COBERTURA.ESTATAL}
                onChange={handleCoberturaChange}
              />
              <label className="form-check-label fw-medium" htmlFor="tipo-estatal">
                <i className="bi bi-map me-1"></i> Por Estado
              </label>
            </div>
            
            <div className="form-check form-check-inline mb-0">
              <input 
                type="radio" 
                className="form-check-input" 
                name="coberturaTipo" 
                id="tipo-especifico" 
                value={TIPOS_COBERTURA.ESPECIFICO}
                checked={coberturaTipo === TIPOS_COBERTURA.ESPECIFICO}
                onChange={handleCoberturaChange}
              />
              <label className="form-check-label fw-medium" htmlFor="tipo-especifico">
                <i className="bi bi-geo-alt me-1"></i> Códigos específicos
              </label>
            </div>
            
            {zipCodes.length > 0 && (
              <span className="badge bg-dark rounded-pill ms-auto" title="Zonas configuradas">
                {zipCodes.length}
              </span>
            )}
          </div>

          {/* Controles específicos según el tipo de cobertura */}
          {coberturaTipo === TIPOS_COBERTURA.NACIONAL && (
            <div className="mb-3 text-center">
              {!zipCodes.includes('nacional') ? (
                <button 
                  type="button" 
                  className="btn btn-dark px-3" 
                  onClick={handleSetNacional}
                >
                  <i className="bi bi-globe me-1"></i>
                  Configurar cobertura nacional
                </button>
              ) : (
                <div className="text-success py-2">
                  <i className="bi bi-check-circle me-1"></i>
                  Cobertura nacional configurada
                </div>
              )}
            </div>
          )}

          {coberturaTipo === TIPOS_COBERTURA.ESTATAL && (
            <div className="input-group mb-3">
              <select
                className="form-select"
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
              >
                <option value="">Seleccionar estado</option>
                {ESTADOS_MEXICO.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                className="btn btn-dark" 
                onClick={handleAddEstado}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          )}

          {coberturaTipo === TIPOS_COBERTURA.ESPECIFICO && (
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Códigos postales (ej: 86610, 86612)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                type="button" 
                className="btn btn-dark" 
                onClick={handleAddZipCode}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="text-danger mb-3">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Listado de zonas configuradas */}
      {zipCodes.length > 0 && (
        <div>
          <label className="form-label fw-medium mb-2">Zonas configuradas:</label>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {zipCodes.map((zipCode, index) => {
              const { displayText, badgeClass, iconClass, btnCloseClass } = getZipCodeDisplay(zipCode);
              return (
                <span 
                  key={index} 
                  className={`badge ${badgeClass} d-flex align-items-center py-2 px-3`}
                >
                  <i className={`bi bi-${iconClass} me-2`}></i>
                  <span>{displayText}</span>
                  <button 
                    type="button" 
                    className={`btn-close ${btnCloseClass} ms-2`} 
                    style={{ fontSize: '0.7rem' }} 
                    onClick={() => handleRemoveZipCode(zipCode)}
                    aria-label="Eliminar"
                  ></button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZipCodeSection; 