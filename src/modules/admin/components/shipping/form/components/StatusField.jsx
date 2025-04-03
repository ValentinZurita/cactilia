import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Campo para el estado activo/inactivo de la regla de envío
 */
const StatusField = ({ control, errors = {} }) => {
  return (
    <div className="mb-3">
      <label className="form-label d-block">Estado de la regla</label>
      <Controller
        name="activo"
        control={control}
        render={({ field }) => (
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              id="activo"
              checked={field.value || false}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="activo">
              {field.value ? 'Regla activa' : 'Regla inactiva'}
            </label>
          </div>
        )}
      />
      <div className="form-text">
        {errors && errors.activo ? (
          <span className="text-danger">{errors.activo.message}</span>
        ) : (
          'Desactive la regla para suspender temporalmente su aplicación'
        )}
      </div>
    </div>
  );
};

export default StatusField; 