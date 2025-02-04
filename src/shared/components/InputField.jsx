import { forwardRef, useState } from "react";

export const InputField = forwardRef(({
                                        label,
                                        type = "text",
                                        errors,            // Aquí errors hace referencia a UN campo de error. Ej: errors.fullName
                                        placeholder,
                                        toggleVisibility = false,
                                        ...inputProps     // El resto de props (onChange, name, ref, etc.) vienen de ...register(...)
                                      }, ref) => {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3 w-100 text-start">

      {/* Label */}
      <label className="form-label text-muted">
        {label}
      </label>

      {/* Input Group */}
      <div className="input-group">

        {/* Input */}
        <input
          {...inputProps}                          // <-- ¡Esparcimos todas las props de register!
          ref={ref}                                // <-- forwardRef, útil si react-hook-form lo requiere
          type={toggleVisibility ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className={`form-control shadow-sm ${errors ? "is-invalid" : ""}`}
        />

        {/* Toggle Password Visibility */}
        {toggleVisibility && (
          <button
            type="button"
            className="btn btn-outline-secondary border shadow-sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
          </button>
        )}

        {/* Error message */}
        {errors && (
          <div className="invalid-feedback">
            {errors.message}
          </div>
        )}

      </div>
    </div>
  );
});