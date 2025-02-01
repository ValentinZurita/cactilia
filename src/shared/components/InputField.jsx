import { useState } from "react";

export const InputField = ({ label, type, id, placeholder, register, errors, toggleVisibility = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3 w-100 text-start">
      <label htmlFor={id} className="form-label text-muted">{label}</label>
      <div className="input-group">
        <input
          {...register} // Aplica register aquí ✅
          type={toggleVisibility ? (showPassword ? "text" : "password") : type}
          className={`form-control shadow-sm ${errors?.message ? 'is-invalid' : ''}`}
          id={id}
          placeholder={placeholder}
          required
        />
        {toggleVisibility && (
          <button
            type="button"
            className="btn btn-outline-secondary border shadow-sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
          </button>
        )}
        {errors?.message && <div className="invalid-feedback">{errors.message}</div>}
      </div>
    </div>
  );
};