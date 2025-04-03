import React from 'react';
import { Controller } from 'react-hook-form';

/**
 * Campo para la zona o nombre descriptivo de la regla de envío
 */
const ZoneField = ({ control, errors }) => {
  return (
    <div className="mb-0">
      <div className="d-flex justify-content-between align-items-center">
        <label className="form-label text-secondary small mb-1">
          Nombre de la zona
        </label>
        {errors?.name && (
          <span className="badge text-bg-danger rounded-pill small">
            Requerido
          </span>
        )}
      </div>
      
      <Controller
        name="name"
        control={control}
        defaultValue=""
        rules={{ required: true }}
        render={({ field }) => (
          <input
            type="text"
            className={`form-control form-control-sm ${errors?.name ? 'is-invalid' : ''}`}
            placeholder="Ej: Zona Metropolitana, Resto del País..."
            {...field}
          />
        )}
      />
      
      {errors?.name && (
        <div className="invalid-feedback small">
          El nombre de la zona es obligatorio
        </div>
      )}
    </div>
  );
};

export default ZoneField; 