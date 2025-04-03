import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Componente para el campo de zona
 */
export const ZoneField = ({ control, errors }) => {
  return (
    <>
      <label htmlFor="zona" className="form-label text-secondary fw-medium">Zona</label>
      <Controller
        name="zona"
        control={control}
        rules={{
          required: 'La zona es obligatoria'
        }}
        render={({ field }) => (
          <input
            type="text"
            id="zona"
            className={`form-control ${errors.zona ? 'is-invalid' : ''}`}
            placeholder="Ej: Centro Puebla"
            {...field}
          />
        )}
      />
      {errors.zona && (
        <div className="invalid-feedback">{errors.zona.message}</div>
      )}
      <small className="text-muted d-block mt-1">
        Define un nombre descriptivo para la zona de cobertura
      </small>
    </>
  );
};

/**
 * Componente para el campo de estado
 */
export const StatusField = ({ control }) => {
  return (
    <>
      <label htmlFor="activo" className="form-label text-secondary fw-medium">Estado</label>
      <Controller
        name="activo"
        control={control}
        render={({ field }) => (
          <select
            id="activo"
            className="form-select"
            {...field}
            value={field.value ? 'true' : 'false'}
            onChange={(e) => field.onChange(e.target.value === 'true')}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        )}
      />
      <small className="text-muted d-block mt-1">
        Determina si esta regla de envío está disponible para los clientes
      </small>
    </>
  );
}; 