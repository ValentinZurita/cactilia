import React from 'react';

export const MessageField = ({ register, errors }) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label className="form-label text-muted">Mensaje</label>
      <div className="input-group">
        <textarea
          className={`form-control shadow-sm ${errors ? "is-invalid" : ""}`}
          rows="4"
          placeholder="Escribe tu mensaje..."
          {...register("mensaje", {
            required: "El mensaje es requerido",
            minLength: {
              value: 10,
              message: "El mensaje debe tener al menos 10 caracteres"
            }
          })}
        ></textarea>
        {errors && <div className="invalid-feedback">{errors.message}</div>}
      </div>
    </div>
  );
};