import { forwardRef } from "react";

export const BirthdateField = forwardRef(({ label = "Fecha de nacimiento", id = "birthdate", errors, ...rest }, ref) => {
  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <div className="input-group">
        <input
          {...rest}
          ref={ref} // ✅ Para conectar con `react-hook-form`
          type="date"
          className={`form-control shadow-sm ${errors ? "is-invalid" : ""}`}
          id={id}
          required
        />
        <span className="input-group-text bg-white shadow-sm">
          <i className="bi bi-calendar"></i>
        </span>
        {errors && <div className="invalid-feedback">{errors.message}</div>}
      </div>
    </div>
  );
});