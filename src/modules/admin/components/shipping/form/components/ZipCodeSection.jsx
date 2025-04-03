import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para manejar la entrada y visualización de códigos postales
 */
export const ZipCodeSection = ({ control, zipCodes, setZipCodes, setValue, errors }) => {
  const [newZipCode, setNewZipCode] = useState('');
  const [error, setError] = useState(null);

  // Manejar la adición de un nuevo código postal
  const handleAddZipCode = () => {
    if (!newZipCode) return;
    
    // Dividir la entrada por comas y eliminar espacios en blanco
    const zipCodeInputs = newZipCode.split(',').map(zip => zip.trim()).filter(zip => zip);
    
    if (zipCodeInputs.length === 0) return;
    
    let hasError = false;
    let duplicateFound = false;
    const validZipCodes = [];
    
    // Validar cada código postal
    zipCodeInputs.forEach(zipToValidate => {
      // Validar formato del código postal
      if (!/^\d{5}$|^nacional$/.test(zipToValidate)) {
        setError(`"${zipToValidate}" no es un código postal válido. Debe tener 5 dígitos o ser "nacional"`);
        hasError = true;
        return;
      }
      
      // Verificar si ya existe
      if (zipCodes.includes(zipToValidate) || validZipCodes.includes(zipToValidate)) {
        duplicateFound = true;
        return;
      }
      
      // Añadir a la lista de códigos válidos
      validZipCodes.push(zipToValidate);
    });
    
    // Si hay errores, detener el proceso
    if (hasError) return;
    
    // Si no hay códigos válidos (porque todos estaban duplicados), mostrar mensaje
    if (validZipCodes.length === 0) {
      setError('Todos los códigos postales ingresados ya existen en la lista');
      return;
    }
    
    // Agregar los nuevos códigos postales válidos
    const updatedZipCodes = [...zipCodes, ...validZipCodes];
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
    setNewZipCode('');
    
    // Si algunos códigos fueron ignorados por ser duplicados, mostrar un mensaje
    if (duplicateFound) {
      setError('Algunos códigos postales fueron ignorados por estar duplicados');
    } else {
      setError(null);
    }
  };

  // Manejar la tecla Enter en el input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir el envío del formulario
      handleAddZipCode();
    }
  };

  // Eliminar un código postal
  const handleRemoveZipCode = (zipToRemove) => {
    const updatedZipCodes = zipCodes.filter(zip => zip !== zipToRemove);
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label text-secondary fw-medium mb-0">Códigos Postales</label>
        {zipCodes.length > 0 && (
          <span className="badge bg-secondary rounded-pill">
            {zipCodes.length} {zipCodes.length === 1 ? 'código' : 'códigos'} definido{zipCodes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {error && (
        <div className="alert alert-danger py-1 mb-2 small">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      <div className="input-group mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Ej: 72000 o nacional (separar múltiples con comas)"
          value={newZipCode}
          onChange={(e) => setNewZipCode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          type="button" 
          className="btn btn-outline-secondary" 
          onClick={handleAddZipCode}
        >
          <i className="bi bi-plus-lg"></i> Agregar
        </button>
      </div>
      <small className="text-muted">Agrega uno o más códigos postales separados por comas (Ej: 86610, 86612)</small>
      
      {/* Lista de códigos postales */}
      {zipCodes.length > 0 && (
        <div className="mt-3">
          <div className="d-flex flex-wrap gap-2">
            {zipCodes.map((zip, index) => (
              <div key={index} className="badge bg-light text-dark border d-flex align-items-center p-2">
                <span>{zip}</span>
                <button 
                  type="button" 
                  className="btn-close ms-2" 
                  onClick={() => handleRemoveZipCode(zip)}
                  aria-label="Eliminar código postal"
                ></button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Campo oculto para almacenar los códigos postales */}
      <Controller
        name="zipcodes"
        control={control}
        rules={{
          validate: value => value.length > 0 || 'Agrega al menos un código postal'
        }}
        render={({ field }) => (
          <input type="hidden" {...field} value={JSON.stringify(field.value)} />
        )}
      />
      {errors.zipcodes && (
        <div className="text-danger small mt-1">{errors.zipcodes.message}</div>
      )}
    </>
  );
}; 