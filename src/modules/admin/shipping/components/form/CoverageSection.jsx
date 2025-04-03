import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { FormField } from '../ui';

/**
 * Componente para la información básica y cobertura de una regla de envío
 * @param {object} control - Control de react-hook-form
 * @param {object} errors - Errores de validación
 * @param {object} watch - Función para observar valores
 */
const CoverageSection = ({ control, errors, watch }) => {
  // Obtener valores para renderizado condicional
  const zoneName = watch('zona') || '';
  
  return (
    <section className="coverage-section">
      <h6 className="text-dark mb-4">Información básica</h6>
      
      {/* Nombre de la zona */}
      <FormField
        id="zona"
        label="Nombre de la zona"
        error={errors?.zona?.message}
        helpText="Un nombre descriptivo para identificar esta área (ej: Centro del país, Frontera norte)"
        required
      >
        <Controller
          name="zona"
          control={control}
          rules={{ 
            required: 'El nombre de la zona es obligatorio',
            minLength: {
              value: 3,
              message: 'Debe tener al menos 3 caracteres'
            }
          }}
          render={({ field }) => (
            <input
              type="text"
              id="zona"
              className={`form-control ${errors?.zona ? 'is-invalid' : ''}`}
              placeholder="ej: Centro del país"
              {...field}
            />
          )}
        />
      </FormField>
      
      {/* Estado activo/inactivo */}
      <FormField id="activo" className="mb-4">
        <Controller
          name="activo"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div className="form-check form-switch">
              <input
                type="checkbox"
                id="activo"
                className="form-check-input"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              />
              <label htmlFor="activo" className="form-check-label">
                {value ? 'Regla activa' : 'Regla inactiva'}
              </label>
            </div>
          )}
        />
      </FormField>
      
      {/* Separador */}
      <div className="mb-4 mt-5">
        <h6 className="text-dark mb-4">Cobertura geográfica</h6>
        <p className="text-muted small mb-3">
          Selecciona el área donde aplicará esta regla de envío. Puedes elegir cobertura
          nacional, por estados, o códigos postales específicos.
        </p>
      </div>
      
      {/* Aquí iría el componente ZipCodeSelector que se renderizaría después */}
      {/* Este componente se ha separado por su complejidad */}
    </section>
  );
};

CoverageSection.propTypes = {
  /** Control de react-hook-form */
  control: PropTypes.object.isRequired,
  /** Errores de validación */
  errors: PropTypes.object,
  /** Función para observar valores */
  watch: PropTypes.func.isRequired
};

export default CoverageSection;
