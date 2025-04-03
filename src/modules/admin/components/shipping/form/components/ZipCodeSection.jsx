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
    
    // Validar formato del código postal
    if (!/^\d{5}$|^nacional$/.test(newZipCode)) {
      setError('Ingresa un código postal válido (5 dígitos) o "nacional"');
      return;
    }
    
    // Verificar si ya existe
    if (zipCodes.includes(newZipCode)) {
      setError('Este código postal ya ha sido agregado');
      return;
    }
    
    // Agregar el nuevo código postal
    const updatedZipCodes = [...zipCodes, newZipCode];
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
    setNewZipCode('');
    setError(null);
  };

  // Eliminar un código postal
  const handleRemoveZipCode = (zipToRemove) => {
    const updatedZipCodes = zipCodes.filter(zip => zip !== zipToRemove);
    setZipCodes(updatedZipCodes);
    setValue('zipcodes', updatedZipCodes);
  };

  return (
    <>
      <label className="form-label text-secondary fw-medium">Códigos Postales</label>
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
          placeholder="Ej: 72000 o nacional"
          value={newZipCode}
          onChange={(e) => setNewZipCode(e.target.value)}
        />
        <button 
          type="button" 
          className="btn btn-outline-secondary" 
          onClick={handleAddZipCode}
        >
          <i className="bi bi-plus-lg"></i> Agregar
        </button>
      </div>
      <small className="text-muted">Agrega uno o más códigos postales para esta regla de envío</small>
      
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