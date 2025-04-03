import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Campo para el estado activo/inactivo de la regla de envío
 */
const StatusField = ({ control }) => {
  return (
    <div className="mb-0">
      <div className="d-flex align-items-center mb-0">
        <label className="form-label text-secondary small mb-1 me-2">
          Estado
        </label>
        
        <Controller
          name="status"
          control={control}
          defaultValue={true}
          render={({ field: { value, onChange, ...field } }) => (
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                {...field}
              />
              <span className={`form-check-label small ${value ? 'text-success' : 'text-danger'}`}>
                {value ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default StatusField; 