import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Campo para el estado activo/inactivo de la regla de envío
 * Compatible con ambos modos: register o control
 */
const StatusField = (props) => {
  // Si se está usando con register
  if (props.register) {
    const { register, errors, setValue, watch } = props;
    const status = watch('status');
    
    return (
      <div className="mb-4">
        <label htmlFor="status" className="form-label fw-medium mb-2">
          Estado de la regla
        </label>
        
        <div className="form-check form-switch">
          <input
            type="checkbox"
            id="status"
            className="form-check-input"
            {...register('status')}
            onChange={(e) => {
              setValue('status', e.target.checked);
            }}
          />
          <label htmlFor="status" className="form-check-label">
            {status ? 'Activo' : 'Inactivo'}
          </label>
        </div>
        
        {errors?.status && (
          <div className="invalid-feedback">
            {errors.status.message}
          </div>
        )}
      </div>
    );
  }
  
  // Si se está usando con control (modo tradicional)
  const { control } = props;
  
  return (
    <div className="mb-4">
      <label className="form-label fw-medium mb-2">
        Estado de la regla
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
              id="status-switch"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              {...field}
            />
            <label className="form-check-label" htmlFor="status-switch">
              {value ? 'Activo' : 'Inactivo'}
            </label>
          </div>
        )}
      />
    </div>
  );
};

export default StatusField; 