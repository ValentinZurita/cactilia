import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Campo para la zona o nombre descriptivo de la regla de envío
 */
const ZoneField = ({ control, errors }) => {
  return (
    <div className="mb-3">
      <label htmlFor="zona" className="form-label">
        Nombre de la zona <span className="text-danger">*</span>
      </label>
      <Controller
        name="zona"
        control={control}
        rules={{
          required: 'El nombre de la zona es obligatorio',
          minLength: {
            value: 3,
            message: 'El nombre debe tener al menos 3 caracteres'
          }
        }}
        render={({ field }) => (
          <input
            type="text"
            id="zona"
            className={`form-control ${errors.zona ? 'is-invalid' : ''}`}
            placeholder="Ej: Zona Centro, Envíos Locales, etc."
            {...field}
          />
        )}
      />
      {errors.zona && (
        <div className="invalid-feedback d-block">{errors.zona.message}</div>
      )}
      <div className="form-text">
        Nombre descriptivo para identificar esta regla de envío
      </div>
    </div>
  );
};

export default ZoneField; 