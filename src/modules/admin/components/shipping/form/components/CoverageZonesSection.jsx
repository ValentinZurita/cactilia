import React from 'react';
import PropTypes from 'prop-types';
import { FormInput } from './index';

/**
 * Componente para configurar las zonas de cobertura de un tipo de envío
 */
const CoverageZonesSection = ({ 
  coverageZones = [], 
  onChange, 
  errors = {} 
}) => {
  // Añadir una nueva zona de cobertura
  const handleAddZone = () => {
    const newZones = [
      ...coverageZones,
      {
        name: `Zona ${coverageZones.length + 1}`,
        states: '',
        cities: '',
        zipCodes: ''
      }
    ];
    
    onChange(newZones);
  };
  
  // Eliminar una zona de cobertura
  const handleRemoveZone = (index) => {
    const newZones = [...coverageZones];
    newZones.splice(index, 1);
    onChange(newZones);
  };
  
  // Actualizar una zona de cobertura
  const handleZoneChange = (index, field, value) => {
    const newZones = [...coverageZones];
    newZones[index] = {
      ...newZones[index],
      [field]: value
    };
    onChange(newZones);
  };

  return (
    <div className="coverage-zones-section mt-4">
      <h5 className="mb-3">Zonas de Cobertura</h5>
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Define las zonas donde este servicio estará disponible. Deja todo en blanco si aplica para todo el país.
      </div>
      
      {coverageZones.map((zone, index) => (
        <div key={index} className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">{zone.name}</h6>
            {coverageZones.length > 1 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleRemoveZone(index)}
              >
                <i className="bi bi-trash me-1"></i>
                Eliminar
              </button>
            )}
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-12">
                <FormInput
                  label="Nombre de la zona"
                  id={`zone-name-${index}`}
                  name={`zone-name-${index}`}
                  value={zone.name}
                  onChange={(e) => handleZoneChange(index, 'name', e.target.value)}
                  placeholder="Ej: Zona Norte, CDMX, etc."
                  error={errors[`coverageZones.${index}.name`]}
                />
              </div>
              
              <div className="col-md-12">
                <FormInput
                  label="Estados"
                  id={`zone-states-${index}`}
                  name={`zone-states-${index}`}
                  value={zone.states}
                  onChange={(e) => handleZoneChange(index, 'states', e.target.value)}
                  placeholder="Ej: Jalisco, Nuevo León, Yucatán"
                  helpText="Separados por comas. Dejar en blanco para todos los estados."
                  error={errors[`coverageZones.${index}.states`]}
                />
              </div>
              
              <div className="col-md-12">
                <FormInput
                  label="Ciudades"
                  id={`zone-cities-${index}`}
                  name={`zone-cities-${index}`}
                  value={zone.cities}
                  onChange={(e) => handleZoneChange(index, 'cities', e.target.value)}
                  placeholder="Ej: Guadalajara, Monterrey, Mérida"
                  helpText="Separadas por comas. Dejar en blanco para todas las ciudades."
                  error={errors[`coverageZones.${index}.cities`]}
                />
              </div>
              
              <div className="col-md-12">
                <FormInput
                  label="Códigos Postales"
                  id={`zone-zipcodes-${index}`}
                  name={`zone-zipcodes-${index}`}
                  value={zone.zipCodes}
                  onChange={(e) => handleZoneChange(index, 'zipCodes', e.target.value)}
                  placeholder="Ej: 45000-45999, 44100, 44200"
                  helpText="Individuales o rangos separados por comas. Ej: 10000-20000, 30500, 40100"
                  error={errors[`coverageZones.${index}.zipCodes`]}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="d-grid">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleAddZone}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Zona
        </button>
      </div>
    </div>
  );
};

CoverageZonesSection.propTypes = {
  coverageZones: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      states: PropTypes.string,
      cities: PropTypes.string,
      zipCodes: PropTypes.string
    })
  ),
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object
};

export default CoverageZonesSection; 